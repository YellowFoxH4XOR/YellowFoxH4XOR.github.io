#!/usr/bin/env node
/**
 * Design + accessibility regression suite.
 *
 * Checks the things that are easy to break silently and expensive to notice
 * later: horizontal overflow at real device widths, WCAG AA text contrast in
 * both themes, WCAG 2.2 target sizes, content still readable with JavaScript
 * off, and a printable page from either theme.
 *
 * Usage:
 *   npm run build && npx next start -p 3100 &
 *   node scripts/design-check.mjs [baseUrl]
 *
 * Default base URL is http://localhost:3100. Exits non-zero on any failure so
 * it can gate a commit or a CI job.
 *
 * Playwright is deliberately NOT a dependency of this project: `npm ci` runs
 * inside the Docker build that ships to production, and Playwright's install
 * pulls browser binaries. Install it on demand instead:
 *
 *   npm i -D playwright && npx playwright install chromium
 *
 * or point PLAYWRIGHT_PATH at an existing install.
 */
const playwrightSpecifier = process.env.PLAYWRIGHT_PATH ?? "playwright";

let chromium;
try {
  ({ chromium } = await import(playwrightSpecifier));
} catch {
  console.error(
    "design-check needs Playwright, which is not installed here.\n" +
      "  npm i -D playwright && npx playwright install chromium\n" +
      "  (or set PLAYWRIGHT_PATH to an existing install)",
  );
  process.exit(2);
}

const BASE = process.argv[2] ?? "http://localhost:3100";

const ROUTES = [
  "/",
  "/blog",
  "/bookshelf",
  "/resume",
  "/tech-blogs",
  "/blog/deterministic-ai",
  "/this-route-does-not-exist",
];

const VIEWPORTS = [
  [320, 700, "320 (iPhone SE)"],
  [360, 780, "360 (small Android)"],
  [390, 844, "390 (iPhone 14)"],
  [768, 1024, "768 (tablet)"],
  [1024, 800, "1024 (laptop)"],
  [1440, 900, "1440 (desktop)"],
  [1920, 1080, "1920 (wide)"],
];

const failures = [];
const fail = (check, detail) => failures.push({ check, detail });

/**
 * Colour helpers injected into the page.
 *
 * getComputedStyle serialises oklch() as lab(), and canvas `fillStyle` echoes
 * that string back unparsed, so string parsing silently produces nonsense
 * ratios. Painting the colour over a known base and reading the pixel is the
 * only reliable way to get real sRGB out of the browser.
 */
const COLOUR_HELPERS = `
  const cv = document.createElement('canvas'); cv.width = cv.height = 1;
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  const compose = (css, base) => {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = 'rgb(' + base[0] + ',' + base[1] + ',' + base[2] + ')';
    ctx.fillRect(0, 0, 1, 1);
    ctx.fillStyle = css;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2]];
  };
  const chan = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const lum = (rgb) => 0.2126 * chan(rgb[0]) + 0.7152 * chan(rgb[1]) + 0.0722 * chan(rgb[2]);
  const contrast = (a, b) => {
    const l1 = lum(a), l2 = lum(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };
  const bgOf = (el) => {
    const chain = [];
    let n = el;
    while (n) { chain.push(getComputedStyle(n).backgroundColor); n = n.parentElement; }
    let base = compose(getComputedStyle(document.body).backgroundColor, [255, 255, 255]);
    for (let i = chain.length - 1; i >= 0; i--) base = compose(chain[i], base);
    return base;
  };
`;

const settle = async (page) => {
  // Reveal-on-scroll sections start hidden; force the settled state so the
  // audit sees the same pixels a reader eventually does.
  await page.evaluate(() =>
    document.querySelectorAll(".reveal").forEach((e) => e.classList.add("is-visible")),
  );
  await page.waitForTimeout(250);
};

async function checkOverflow(browser) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  for (const [w, h, label] of VIEWPORTS) {
    await page.setViewportSize({ width: w, height: h });
    for (const route of ROUTES) {
      await page.goto(BASE + route, { waitUntil: "networkidle" });
      await settle(page);
      const r = await page.evaluate(() => ({
        sw: document.documentElement.scrollWidth,
        iw: window.innerWidth,
      }));
      if (r.sw > r.iw + 1) {
        fail("horizontal-overflow", `${label} ${route}: ${r.sw - r.iw}px past viewport`);
      }
    }
  }
  await ctx.close();
}

async function checkContrast(browser) {
  for (const theme of ["light", "dark"]) {
    // The theme must be in localStorage before navigation: next-themes
    // reapplies the class after hydration, and on a long page that race
    // produces phantom failures if you toggle the class post-load.
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(BASE, { waitUntil: "domcontentloaded" });
    await page.evaluate((t) => localStorage.setItem("theme", t), theme);

    for (const route of ROUTES) {
      await page.goto(BASE + route, { waitUntil: "networkidle" });
      await settle(page);
      const bad = await page.evaluate(
        new Function(`
        ${COLOUR_HELPERS}
        const out = [], seen = new Set();
        const sel = 'p,span,a,li,h1,h2,h3,time,button,code,strong,em,td,th,figcaption,option';
        for (const el of document.querySelectorAll(sel)) {
          const txt = (el.textContent || '').trim();
          if (!txt || el.children.length > 0) continue;
          const cs = getComputedStyle(el);
          if (cs.visibility === 'hidden' || cs.display === 'none') continue;
          if (Number(cs.opacity) < 0.1) continue;
          if (el.closest('[class*="sr-only"]')) continue;
          const bg = bgOf(el);
          const ratio = contrast(compose(cs.color, bg), bg);
          const px = parseFloat(cs.fontSize);
          const bold = Number(cs.fontWeight) >= 700;
          const min = (px >= 24 || (px >= 18.66 && bold)) ? 3 : 4.5;
          const key = cs.color + '|' + Math.round(px);
          if (ratio < min && !seen.has(key)) {
            seen.add(key);
            out.push({ text: txt.slice(0, 30), ratio: +ratio.toFixed(2), need: min, px: +px.toFixed(1) });
          }
        }
        return out;
      `),
      );
      for (const b of bad) {
        fail(
          "contrast",
          `${theme} ${route}: "${b.text}" ${b.ratio}:1 (needs ${b.need}:1) at ${b.px}px`,
        );
      }
    }
    await ctx.close();
  }
}

async function checkTargetSize(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  for (const route of ROUTES) {
    await page.goto(BASE + route, { waitUntil: "networkidle" });
    await settle(page);
    const small = await page.evaluate(() => {
      const out = [];
      for (const el of document.querySelectorAll("header a, footer a, nav a, button, select")) {
        const r = el.getBoundingClientRect();
        if (r.width === 0) continue;
        // WCAG 2.2 2.5.8 exempts links sitting inline inside a sentence.
        const inSentence = el.closest("p") && getComputedStyle(el).display.includes("inline");
        if (!inSentence && (r.height < 24 || r.width < 24)) {
          out.push({
            text: (el.textContent || "").trim().slice(0, 24),
            w: Math.round(r.width),
            h: Math.round(r.height),
          });
        }
      }
      return out;
    });
    for (const s of small) {
      fail("target-size", `${route}: "${s.text}" is ${s.w}x${s.h}px (needs 24x24)`);
    }
  }
  await ctx.close();
}

async function checkNoJavaScript(browser) {
  const ctx = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 1440, height: 900 },
  });
  const page = await ctx.newPage();
  for (const route of ["/", "/blog", "/bookshelf", "/resume"]) {
    await page.goto(BASE + route, { waitUntil: "domcontentloaded" });
    const hidden = await page.evaluate(() =>
      [...document.querySelectorAll(".reveal")].filter(
        (e) => Number(getComputedStyle(e).opacity) < 0.9,
      ).length,
    );
    if (hidden > 0) {
      fail("no-js", `${route}: ${hidden} revealed section(s) invisible without JavaScript`);
    }
  }
  await ctx.close();
}

async function checkPrint(browser) {
  for (const theme of ["light", "dark"]) {
    const ctx = await browser.newContext({ viewport: { width: 900, height: 1200 } });
    const page = await ctx.newPage();
    await page.goto(BASE + "/resume", { waitUntil: "domcontentloaded" });
    await page.evaluate((t) => localStorage.setItem("theme", t), theme);
    await page.reload({ waitUntil: "networkidle" });
    await page.emulateMedia({ media: "print" });
    await page.waitForTimeout(300);

    const state = await page.evaluate(
      new Function(`
      ${COLOUR_HELPERS}
      const paper = compose(getComputedStyle(document.body).backgroundColor, [255, 255, 255]);
      const probe = (s) => {
        const el = document.querySelector(s);
        if (!el) return null;
        return +contrast(compose(getComputedStyle(el).color, paper), paper).toFixed(2);
      };
      const disp = (s) => { const e = document.querySelector(s); return e ? getComputedStyle(e).display : 'absent'; };
      return {
        navbar: disp('[data-print-hide]'),
        printOnly: disp('[data-print-only]'),
        h1: disp('h1'),
        heading: probe('h3'),
        body: probe('li'),
      };
    `),
    );

    if (state.navbar !== "none") fail("print", `${theme}: navbar not hidden (${state.navbar})`);
    if (state.printOnly !== "block") fail("print", `${theme}: identity block missing`);
    if (state.h1 === "none" || state.h1 === "absent") fail("print", `${theme}: page title missing`);
    if (!state.heading || state.heading < 4.5)
      fail("print", `${theme}: heading contrast ${state.heading}:1 on paper`);
    if (!state.body || state.body < 4.5)
      fail("print", `${theme}: body contrast ${state.body}:1 on paper`);

    await ctx.close();
  }
}

async function launch() {
  // Prefer Playwright's own Chromium. If its pinned build is not in the local
  // browser cache, fall back to an installed Chrome rather than making the
  // whole suite unrunnable over a version mismatch.
  try {
    return await chromium.launch();
  } catch (err) {
    if (!/Executable doesn't exist/i.test(String(err))) throw err;
    for (const channel of ["chrome", "chromium", "msedge"]) {
      try {
        const browser = await chromium.launch({ channel });
        console.log(`note: using system ${channel} (bundled Chromium not downloaded)`);
        return browser;
      } catch {
        /* try the next channel */
      }
    }
    throw new Error(
      "No usable browser. Run `npx playwright install chromium`, or install Chrome.",
    );
  }
}

async function main() {
  const browser = await launch();
  try {
    await checkOverflow(browser);
    await checkContrast(browser);
    await checkTargetSize(browser);
    await checkNoJavaScript(browser);
    await checkPrint(browser);
  } finally {
    await browser.close();
  }

  if (failures.length === 0) {
    console.log(
      `PASS  ${ROUTES.length} routes | ${VIEWPORTS.length} viewports | 2 themes\n` +
        "      overflow, contrast (WCAG AA), target size (WCAG 2.2), no-JS, print",
    );
    return;
  }

  const byCheck = failures.reduce((acc, f) => {
    (acc[f.check] ??= []).push(f.detail);
    return acc;
  }, {});
  console.error(`FAIL  ${failures.length} issue(s)\n`);
  for (const [check, details] of Object.entries(byCheck)) {
    console.error(`  ${check} (${details.length})`);
    for (const d of details) console.error(`    - ${d}`);
  }
  process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

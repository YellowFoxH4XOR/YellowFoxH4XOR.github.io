#!/usr/bin/env node
// Interaction and discoverability checks for the Pi Designer integration.
// Uses the same optional PLAYWRIGHT_PATH setup as design-check.mjs.
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";

const { chromium } = await import(process.env.PLAYWRIGHT_PATH ?? "playwright");
const base = process.argv[2] ?? "http://localhost:3100";
const canonicalBase = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://akshatkatiyar.com").replace(/\/$/, "");
const output = ".design-review/redesign";
const browser = await chromium.launch({ channel: "chrome" });
const errors = [];
await mkdir(output, { recursive: true });

async function assertImages(page) {
  // Full-page screenshots don't trigger lazy loading below the viewport.
  await page.locator("main img").evaluateAll((images) => images.forEach((image) => { image.loading = "eager"; }));
  await page.waitForFunction(() => [...document.querySelectorAll("main img")].every((image) => image.complete && image.naturalWidth > 0));
}

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce", colorScheme: "light" });
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  const routes = ["/", "/blog", "/bookshelf", "/resume", "/tech-blogs", "/tech-blogs/page/2", "/blog/deterministic-ai"];
  for (const route of routes) {
    const response = await page.goto(base + route, { waitUntil: "networkidle" });
    assert.equal(response.status(), 200, `${route} renders`);
    assert.equal(await page.locator("h1").count(), 1, `${route} has one h1`);
    assert.equal((await page.locator('link[rel="canonical"]').getAttribute("href")).replace(/\/$/, ""), `${canonicalBase}${route}`.replace(/\/$/, ""));
    assert.ok(await page.locator('meta[property="og:image"]').getAttribute("content"), `${route} social image`);
    const rawHTML = await response.text();
    assert.ok(rawHTML.includes('application/ld+json'), `${route} schema is server-rendered`);
    await assertImages(page);
    const label = route === "/" ? "home" : route.slice(1).replaceAll("/", "-");
    await page.screenshot({ path: `${output}/pi-${label}-desktop.png`, fullPage: route !== "/tech-blogs" });
  }

  await page.goto(base, { waitUntil: "networkidle" });
  const traceHref = await page.locator(".command-trace").getAttribute("href");
  const portrait = page.locator(".portrait img");
  const portraitBefore = await portrait.boundingBox();
  await portrait.hover();
  await page.waitForFunction(() => getComputedStyle(document.querySelector(".portrait img")).filter === "grayscale(0) brightness(1.1)");
  assert.deepEqual(await portrait.boundingBox(), portraitBefore, "Portrait brightens without shifting layout");
  await page.locator("h1").hover();
  await page.waitForFunction(() => getComputedStyle(document.querySelector(".portrait img")).filter === "grayscale(0.85) brightness(1)");
  await page.locator(".portrait figcaption a").focus();
  await page.waitForFunction(() => getComputedStyle(document.querySelector(".portrait img")).filter === "grayscale(0) brightness(1.1)");
  await page.locator(".portrait figcaption a").evaluate((element) => element.blur());
  const product = page.locator("#deckle-image");
  const frameBefore = await page.locator(".product-image-frame").boundingBox();
  await page.getByRole("button", { name: "Your desk", exact: true }).click();
  assert.equal(await page.getByRole("button", { name: "Your desk", exact: true }).getAttribute("aria-pressed"), "true");
  assert.match(await product.getAttribute("alt"), /native desk/);
  assert.equal((await page.locator(".product-image-frame").boundingBox()).height, frameBefore.height, "Gallery has no frame shift");
  await page.getByRole("button", { name: "Paper library", exact: true }).click();
  assert.match(await product.getAttribute("alt"), /paper library/);
  await page.getByRole("button", { name: "Toggle theme" }).click();
  await page.waitForFunction(() => document.documentElement.classList.contains("dark"));
  await assertImages(page);
  await page.screenshot({ path: `${output}/pi-home-dark.png`, fullPage: true });
  await page.goto(base + "/bookshelf", { waitUntil: "networkidle" });
  assert.ok(await page.locator("html").evaluate((element) => element.classList.contains("dark")), "Theme persists across navigation");
  await page.getByRole("button", { name: "Toggle theme" }).click();

  await page.goto(base + "/blog", { waitUntil: "networkidle" });
  const total = await page.locator(".archive-row").count();
  assert.ok(total >= 12, "Archive includes all source essays");
  const articleLinks = await page.locator(".archive-row h2 a").evaluateAll((links) => links.map((link) => link.getAttribute("href")));
  const search = page.getByRole("searchbox", { name: "Search essays by title, topic or keyword" });
  await page.getByRole("button", { name: "Python & Go", exact: true }).click();
  const languages = await page.locator(".archive-row").count();
  assert.ok(languages > 0 && languages < total, "Topic filters work");
  await search.fill("PYTHON");
  assert.ok(await page.locator(".archive-row").count() > 0, "Search is case-insensitive");
  assert.ok(new URL(page.url()).searchParams.get("q") === "PYTHON", "Search is shareable");
  await page.reload({ waitUntil: "networkidle" });
  assert.equal(await search.inputValue(), "PYTHON", "Search restores on reload");
  assert.equal(await page.getByRole("button", { name: "Python & Go", exact: true }).getAttribute("aria-pressed"), "true");
  await search.fill("no-matching-essay-987654321");
  assert.equal(await page.locator(".archive-row").count(), 0);
  await page.getByRole("button", { name: "Clear filters", exact: true }).click();
  assert.equal(await page.locator(".archive-row").count(), total);
  assert.equal(await search.inputValue(), "");
  assert.ok(await search.evaluate((element) => element === document.activeElement), "Recovery restores focus");
  await page.evaluate(() => { history.pushState(null, "", "?topic=systems&q=dragonfly"); dispatchEvent(new PopStateEvent("popstate")); });
  assert.equal(await page.locator(".archive-row").count(), 1, "History restores combined filters");
  await page.goBack();
  assert.equal(await page.locator(".archive-row").count(), total, "Back restores all essays");
  await page.goForward();
  assert.equal(await page.locator(".archive-row").count(), 1, "Forward restores filters");

  for (const href of articleLinks) {
    const response = await page.goto(base + href, { waitUntil: "domcontentloaded" });
    assert.equal(response.status(), 200, `${href} preserved`);
    assert.equal(await page.locator("h1").count(), 1);
  }
  await page.goto(base + traceHref, { waitUntil: "domcontentloaded" });
  const traceId = new URL(base + traceHref).hash.slice(1);
  assert.ok(traceId && await page.evaluate((id) => !!document.getElementById(id), decodeURIComponent(traceId)), "Homepage command trace targets a real heading");
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForFunction(() => document.querySelector('[role="progressbar"]').getAttribute("aria-valuenow") === "100");
  await page.waitForFunction(() => getComputedStyle(document.querySelector('[role="progressbar"] > div')).transform === "matrix(1, 0, 0, 1, 0, 0)");
  assert.equal(await page.locator('[role="progressbar"] > div').evaluate((element) => getComputedStyle(element).transform), "matrix(1, 0, 0, 1, 0, 0)", "Reading progress fills with a transform, not layout animation");
  await page.getByRole("button", { name: "Scroll to top", exact: true }).click();
  await page.waitForFunction(() => window.scrollY === 0 && document.querySelector('button[aria-label="Scroll to top"]').tabIndex === -1);
  assert.equal(await page.locator('button[aria-label="Scroll to top"]').getAttribute("aria-hidden"), "true", "Hidden top control is not exposed to assistive technology");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base, { waitUntil: "networkidle" });
  await assertImages(page);
  await page.screenshot({ path: `${output}/pi-home-mobile.png`, fullPage: true });
  const summary = page.locator('summary[aria-label="Navigation menu"]');
  const mobileNav = page.getByRole("navigation", { name: "Mobile navigation", exact: true });
  await summary.click();
  assert.ok(await mobileNav.isVisible());
  await page.screenshot({ path: `${output}/pi-menu-mobile.png` });
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("details[open]").count(), 0);
  assert.ok(await summary.evaluate((element) => element === document.activeElement));
  await summary.click();
  await mobileNav.getByRole("link", { name: "Writing", exact: true }).click();
  await page.waitForURL(base + "/blog");
  assert.equal(await page.locator("details[open]").count(), 0);
  await summary.click();
  await page.setViewportSize({ width: 1024, height: 800 });
  await page.waitForFunction(() => !document.querySelector("details.mobile-menu").open);
  assert.equal(await page.locator("details[open]").count(), 0, "Desktop resize closes mobile navigation");
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto(base, { waitUntil: "networkidle" });
  await assertImages(page);
  await page.screenshot({ path: `${output}/pi-home-320.png`, fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + "/tech-blogs", { waitUntil: "networkidle" });
  const entries = page.locator("a.defer-offscreen");
  const allEntries = await entries.count();
  const source = page.getByLabel("Filter by source");
  await source.selectOption("cloudflare");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await page.waitForURL(/\/tech-blogs\/search\?.*source=cloudflare/);
  assert.ok(await entries.count() > 0 && await entries.count() <= 50);
  assert.ok((await entries.allTextContents()).every((text) => text.includes("Cloudflare")), "Source selection filters the complete archive");
  const feedSearch = page.getByRole("searchbox", { name: "Search tech blogs" });
  await feedSearch.fill("no-matching-article-987654321");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await page.waitForURL(/q=no-matching-article-987654321/);
  assert.equal(await entries.count(), 0);
  await page.getByRole("link", { name: "Reset filters", exact: true }).click();
  await page.waitForURL(base + "/tech-blogs");
  assert.equal(await entries.count(), allEntries);
  assert.equal(await source.inputValue(), "");
  await feedSearch.fill("Cloudflare");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await page.waitForURL(/q=Cloudflare/);
  assert.ok(await entries.count() > 0);
  await page.getByRole("link", { name: "Clear search", exact: true }).click();
  await page.waitForURL(base + "/tech-blogs");
  assert.equal(await entries.count(), allEntries);
  const firstArticle = await entries.first().getAttribute("href");
  await page.getByRole("navigation", { name: "Article archive pages" }).getByRole("link", { name: "Next", exact: true }).click();
  await page.waitForURL(base + "/tech-blogs/page/2");
  assert.notEqual(await entries.first().getAttribute("href"), firstArticle, "Archive pages show different articles");

  for (const route of ["/feed.xml", "/sitemap.xml", "/robots.txt", "/llms.txt", "/akshat_katiyar_resume.pdf"]) {
    const response = await context.request.get(base + route);
    assert.equal(response.status(), 200, `${route} preserved`);
  }
  await context.close();

  const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const plain = await nojs.newPage();
  await plain.goto(base);
  await plain.locator("summary").click();
  assert.ok(await plain.getByRole("navigation", { name: "Mobile navigation", exact: true }).isVisible(), "Mobile nav works without JS");
  for (const route of routes) {
    await plain.goto(base + route);
    assert.ok(await plain.locator("h1").isVisible(), `${route} heading visible without JS`);
    const invisible = await plain.locator("main p, main h2, main h3").evaluateAll((elements) => elements.filter((element) => getComputedStyle(element).display !== "none" && Number(getComputedStyle(element).opacity) < .9).length);
    assert.equal(invisible, 0, `${route} content visible without JS`);
    if (route === "/blog") assert.equal(await plain.locator(".archive-row").count(), articleLinks.length, "No-JS archive includes every essay");
  }
  await plain.goto(base + "/tech-blogs");
  await plain.getByLabel("Filter by source").selectOption("cloudflare");
  await plain.getByRole("searchbox", { name: "Search tech blogs" }).fill("Cloudflare");
  await plain.getByRole("button", { name: "Search", exact: true }).click();
  await plain.waitForURL(/source=cloudflare/);
  assert.ok(await plain.locator("a.defer-offscreen").count() > 0, "Global source and keyword search works without JavaScript");
  await nojs.close();
  assert.deepEqual(errors, [], "No client-side exceptions");
  console.log("PASS: server-rendered metadata/schema, all articles, gallery, theme, archive/search/URL history, mobile menu, feed search, no-JS content/navigation, feeds/PDF, and screenshots");
} finally {
  await browser.close();
}

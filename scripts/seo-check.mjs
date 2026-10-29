#!/usr/bin/env node
// Verify the actual production HTML rather than just inspecting metadata exports.
// Uses the optional PLAYWRIGHT_PATH setup shared with design-check.mjs.
import assert from "node:assert/strict";
import fs from "node:fs";
import { gzipSync } from "node:zlib";
import matter from "gray-matter";
import { XMLParser, XMLValidator } from "fast-xml-parser";

const { chromium } = await import(process.env.PLAYWRIGHT_PATH ?? "playwright");
const base = process.argv[2] ?? "http://localhost:3100";
const browser = await chromium.launch({ channel: "chrome" });
const parser = new XMLParser();
const stats = [];

try {
  const context = await browser.newContext();
  const page = await context.newPage();
  const sitemapResponse = await context.request.get(`${base}/sitemap.xml`);
  assert.equal(sitemapResponse.status(), 200, "Sitemap is available");
  const sitemapXML = await sitemapResponse.text();
  assert.equal(XMLValidator.validate(sitemapXML), true, "Sitemap XML is valid");
  const locations = [].concat(parser.parse(sitemapXML).urlset.url).map((item) => item.loc);
  assert.equal(new Set(locations).size, locations.length, "Sitemap has no duplicate URLs");
  const origin = new URL(locations[0]).origin;
  const articleURLs = new Set();
  const documents = new Map();
  const internalTargets = new Map();
  const archiveEntries = [];
  const previewImages = new Set();
  const titles = new Set();
  const descriptions = new Set();

  for (const location of locations) {
    const canonicalURL = new URL(location);
    assert.equal(canonicalURL.origin, origin, "Sitemap uses one canonical origin");
    assert.equal(canonicalURL.protocol, "https:", "Public sitemap URLs use HTTPS");
    const route = canonicalURL.pathname + canonicalURL.search;
    const response = await context.request.get(base + route);
    assert.equal(response.status(), 200, `${route} is not a redirect or error`);
    assert.match(response.headers()["content-type"], /text\/html/, `${route} is HTML`);
    const html = await response.text();
    const document = await page.evaluate((source) => {
      const doc = new DOMParser().parseFromString(source, "text/html");
      const meta = (name, attribute = "name") => doc.querySelector(`meta[${attribute}="${name}"]`)?.getAttribute("content");
      return {
        title: doc.querySelector("title")?.textContent,
        description: meta("description"),
        canonical: [...doc.querySelectorAll('link[rel="canonical"]')].map((link) => link.getAttribute("href")),
        robots: meta("robots") ?? "",
        viewport: meta("viewport"),
        language: doc.documentElement.lang,
        h1: [...doc.querySelectorAll("h1")].map((heading) => heading.textContent?.trim()),
        schemas: [...doc.querySelectorAll('script[type="application/ld+json"]')].map((script) => JSON.parse(script.textContent)),
        ogTitle: meta("og:title", "property"),
        ogDescription: meta("og:description", "property"),
        ogURL: meta("og:url", "property"),
        ogImage: meta("og:image", "property"),
        twitterCard: meta("twitter:card"),
        twitterImage: meta("twitter:image"),
        imageAlts: [...doc.querySelectorAll("main img")].map((image) => image.getAttribute("alt")),
        ids: [...doc.querySelectorAll("[id]")].map((element) => element.id),
        feedEntries: [...doc.querySelectorAll("a.defer-offscreen")].map((link) => ({ url: link.getAttribute("href"), source: link.getAttribute("data-source") })),
        links: [...doc.querySelectorAll("main a[href]")].map((link) => link.getAttribute("href")),
        feedLinks: [...doc.querySelectorAll('link[rel="alternate"][type="application/rss+xml"]')].map((link) => link.getAttribute("href")),
      };
    }, html);
    documents.set(route, document);
    assert.ok(document.title?.trim(), `${route} has a title`);
    assert.ok(document.description?.trim(), `${route} has a description`);
    assert.ok(!titles.has(document.title), `${route} title is unique`);
    assert.ok(!descriptions.has(document.description), `${route} description is unique`);
    titles.add(document.title);
    descriptions.add(document.description);
    assert.equal(document.canonical.length, 1, `${route} has exactly one canonical`);
    assert.equal(new URL(document.canonical[0]).href, canonicalURL.href, `${route} has a self-canonical`);
    assert.doesNotMatch(document.robots, /noindex|nofollow/, `${route} remains indexable`);
    assert.equal(document.h1.length, 1, `${route} has one main heading`);
    assert.ok(document.h1[0], `${route} heading is not empty`);
    assert.equal(document.language, "en");
    assert.match(document.viewport, /width=device-width/);
    assert.ok(document.ogTitle && document.ogDescription && document.ogImage, `${route} has social metadata`);
    assert.equal(new URL(document.ogURL).href, canonicalURL.href, `${route} social URL matches canonical`);
    assert.equal(document.twitterCard, "summary_large_image");
    assert.ok(document.twitterImage, `${route} has a Twitter preview image`);
    assert.ok(document.feedLinks.length > 0, `${route} retains RSS discovery`);
    assert.ok(document.feedLinks.some((href) => new URL(href, canonicalURL).href === `${origin}/feed.xml`), `${route} advertises the real RSS URL`);
    previewImages.add(document.ogImage);
    previewImages.add(document.twitterImage);
    assert.ok(document.imageAlts.every((alt) => alt !== null), `${route} images have alt attributes (empty is valid for decoration)`);
    assert.ok(document.schemas.length > 0, `${route} JSON-LD is server-rendered`);
    for (const schema of document.schemas) {
      assert.equal(schema["@context"], "https://schema.org");
      assert.ok(schema["@type"], `${route} schema has a type`);
      if (schema.author) assert.equal(schema.author["@id"], `${origin}/#person`);
      if (schema.publisher) assert.equal(schema.publisher["@id"], `${origin}/#person`);
      if (schema["@type"] === "BlogPosting") {
        articleURLs.add(canonicalURL.href);
        assert.equal(schema.mainEntityOfPage["@id"], canonicalURL.href);
        assert.ok(!Number.isNaN(Date.parse(schema.datePublished)), `${route} has a valid publication date`);
        if (schema.dateModified) assert.ok(Date.parse(schema.dateModified) >= Date.parse(schema.datePublished));
        assert.equal(schema["@id"], `${canonicalURL.href}#article`, "Articles have stable graph identifiers");
      }
      if (schema["@type"] === "ProfilePage") {
        assert.ok(schema.mainEntity.alumniOf.every((school) => school.name !== "Amazon Web Services"), "Certification is not represented as school attendance");
        assert.ok(schema.mainEntity.hasCredential.some((credential) => credential.name.includes("AWS Certified")), "The real certification remains represented");
      }
      if (schema["@type"] === "CollectionPage") {
        assert.equal(schema.url, canonicalURL.href);
        assert.equal(schema.mainEntity.itemListElement.length, document.feedEntries.length, "Collection schema mirrors visible articles");
        assert.deepEqual(schema.mainEntity.itemListElement.map((item) => item.item.url), document.feedEntries.map((entry) => entry.url));
      }
    }
    for (const href of document.links) {
      const target = new URL(href, canonicalURL);
      if (target.origin !== origin) continue;
      const targetRoute = target.pathname + target.search;
      const hashes = internalTargets.get(targetRoute) ?? new Set();
      if (target.hash) hashes.add(decodeURIComponent(target.hash.slice(1)));
      internalTargets.set(targetRoute, hashes);
    }
    const bytes = Buffer.byteLength(html);
    const gzipBytes = gzipSync(html).length;
    if (route === "/tech-blogs" || route.startsWith("/tech-blogs/page/")) {
      assert.ok(bytes < 350_000, `${route} avoids the former multi-megabyte HTML payload (${bytes} bytes)`);
      assert.ok(document.feedEntries.length <= 50, `${route} renders only one bounded page`);
      archiveEntries.push(...document.feedEntries.map((entry) => `${entry.source}:${entry.url}`));
    }
    stats.push({ route, bytes, gzipBytes });
  }

  for (const image of previewImages) {
    const url = new URL(image);
    assert.equal(url.origin, origin, "Social previews use the canonical origin");
    const response = await context.request.get(base + url.pathname + url.search);
    assert.equal(response.status(), 200, `${url.pathname} preview image is served`);
    assert.match(response.headers()["content-type"], /^image\//, `${url.pathname} is an image response`);
  }

  for (const [route, hashes] of internalTargets) {
    let document = documents.get(route);
    if (!document) {
      const response = await context.request.get(base + route);
      assert.equal(response.status(), 200, `Internal link ${route} is not broken`);
      document = await page.evaluate((html) => {
        const doc = new DOMParser().parseFromString(html, "text/html");
        return { ids: [...doc.querySelectorAll("[id]")].map((element) => element.id) };
      }, await response.text());
    }
    for (const hash of hashes) assert.ok(document.ids.includes(hash), `${route}#${hash} targets an actual element`);
  }
  const snapshotEntries = fs.readdirSync("docs-tech-blogs").filter((file) => file.endsWith(".json")).flatMap((file) => JSON.parse(fs.readFileSync(`docs-tech-blogs/${file}`, "utf8")));
  assert.deepEqual(archiveEntries.sort(), snapshotEntries.map((entry) => `${entry.companySlug}:${entry.url}`).sort(), "Every external article appears exactly once across crawlable archive pages");
  const searchPages = [];
  for (const route of ["/tech-blogs/search?q=AI", "/tech-blogs/search?q=AI&page=2"]) {
    const response = await context.request.get(base + route);
    assert.equal(response.status(), 200, `${route} global search renders`);
    const result = await page.evaluate((html) => {
      const doc = new DOMParser().parseFromString(html, "text/html");
      return {
        canonical: doc.querySelector('link[rel="canonical"]')?.getAttribute("href"),
        links: [...doc.querySelectorAll("a.defer-offscreen")].map((link) => `${link.getAttribute("data-source")}:${link.getAttribute("href")}`),
        next: doc.querySelector('nav[aria-label="Article archive pages"] a[rel="next"]')?.getAttribute("href"),
      };
    }, await response.text());
    assert.equal(result.canonical, origin + route, `${route} has a matching search-page canonical`);
    assert.equal(result.links.length, 50, "Global search is paginated after filtering");
    assert.ok(result.next?.includes("q=AI"), "Search pagination preserves the keyword");
    searchPages.push(result.links);
  }
  assert.ok(searchPages[1].every((key) => !searchPages[0].includes(key)), "Global search pages do not repeat entries");
  for (const invalid of ["/tech-blogs/page/999999", "/tech-blogs/search?source=not-a-real-source", "/tech-blogs/search?q=go&page=-1"]) {
    assert.equal((await context.request.get(base + invalid)).status(), 404, `${invalid} is a real 404`);
  }
  const alias = await context.request.get(`${base}/tech-blogs/page/1`, { maxRedirects: 0 });
  assert.equal(alias.status(), 308, "Page-one alias is permanently redirected");
  assert.equal(new URL(alias.headers().location, base).pathname, "/tech-blogs");

  const published = fs.readdirSync("content/blog").filter((name) => /\.mdx?$/.test(name)).filter((name) => !matter(fs.readFileSync(`content/blog/${name}`, "utf8")).data.draft);
  assert.equal(articleURLs.size, published.length, "Every published article is in the sitemap");
  const feedResponse = await context.request.get(`${base}/feed.xml`);
  assert.equal(feedResponse.status(), 200);
  const feedXML = await feedResponse.text();
  assert.equal(XMLValidator.validate(feedXML), true, "RSS XML is valid");
  const items = [].concat(parser.parse(feedXML).rss.channel.item ?? []);
  assert.deepEqual(new Set(items.map((item) => item.link)), articleURLs, "RSS and sitemap enumerate the same original articles");
  const robotsResponse = await context.request.get(`${base}/robots.txt`);
  const robots = await robotsResponse.text();
  assert.equal(robotsResponse.status(), 200);
  assert.match(robots, /Sitemap: https:\/\//);
  for (const agent of ["GPTBot", "OAI-SearchBot", "PerplexityBot", "ClaudeBot"]) assert.ok(robots.includes(agent), `${agent} access is preserved`);
  const missing = await context.request.get(`${base}/this-seo-route-does-not-exist`);
  assert.equal(missing.status(), 404, "Unknown URLs are real 404s, not soft-404 landing pages");
  await context.close();
  console.table(stats);
  console.log(`PASS: ${locations.length} sitemap pages; unique metadata, self-canonicals, indexability, server-rendered schema, image semantics, RSS consistency, robots and page-weight budgets`);
} finally {
  await browser.close();
}

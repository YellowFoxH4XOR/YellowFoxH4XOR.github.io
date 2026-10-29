#!/usr/bin/env node
import assert from "node:assert/strict";
import { techBlogArchivePath, techBlogPageCount, techBlogPage, techBlogSearchPath, filterTechBlogs, paginationNumbers } from "../src/lib/tech-blog-pagination.ts";
import { validatePostFrontmatter } from "../src/lib/post-frontmatter.ts";
import { relatedPosts } from "../src/lib/post-recommendations.ts";
import { getAllTechBlogs } from "../src/lib/tech-blogs.ts";
import { normalizeFeedURL } from "./lib/feed-url.mjs";

assert.equal(normalizeFeedURL("/blog/linkbert/", "https://ai.stanford.edu/blog/feed.xml"), "https://ai.stanford.edu/blog/linkbert/");
assert.equal(normalizeFeedURL("../post", "https://example.com/news/feed.xml"), "https://example.com/post");
assert.equal(normalizeFeedURL("//example.com/post", "https://example.org/rss"), "https://example.com/post");
assert.equal(normalizeFeedURL("javascript:alert(1)", "https://example.com/rss"), null);
assert.equal(normalizeFeedURL("data:text/html,hello", "https://example.com/rss"), null);
assert.equal(normalizeFeedURL("https://user:password@example.com/post", "https://example.com/rss"), null);
assert.equal(normalizeFeedURL("", "https://example.com/rss"), null);
assert.equal(normalizeFeedURL("http://blog.research.google/2024/03/example.html", "https://blog.research.google/rss"), "https://blog.research.google/2024/03/example.html");
assert.equal(normalizeFeedURL("http://example.com/post", "https://example.com/rss"), "http://example.com/post", "Unknown hosts are not blindly upgraded");

assert.equal(techBlogPageCount(0), 1);
assert.equal(techBlogPageCount(50), 1);
assert.equal(techBlogPageCount(51), 2);
assert.equal(techBlogArchivePath(1), "/tech-blogs");
assert.equal(techBlogArchivePath(2), "/tech-blogs/page/2");
assert.equal(techBlogSearchPath({ page: 2 }), "/tech-blogs/page/2");
assert.equal(techBlogSearchPath({ query: "C++ & RAG", source: "cloudflare", page: 2 }), "/tech-blogs/search?q=C%2B%2B+%26+RAG&source=cloudflare&page=2");
assert.deepEqual(paginationNumbers(1, 1), [1]);
assert.deepEqual(paginationNumbers(12, 26), [1, 11, 12, 13, 26]);
assert.deepEqual(paginationNumbers(1, 3), [1, 2, 3]);

const entries = getAllTechBlogs();
const walked = Array.from({ length: techBlogPageCount(entries.length) }, (_, page) => techBlogPage(entries, page + 1)).flat();
assert.deepEqual(walked, entries, "Paging neither drops nor repeats entries");
assert.deepEqual(getAllTechBlogs(), entries, "Ordering is deterministic, including equal publication dates");
assert.equal(filterTechBlogs(entries, "", "").length, entries.length);
assert.ok(filterTechBlogs(entries, "CLOUDFLARE", "cloudflare").length > 0);
assert.ok(filterTechBlogs(entries, "CLOUDFLARE", "cloudflare").every((entry) => entry.companySlug === "cloudflare"));
assert.equal(filterTechBlogs(entries, "no-seo-test-result-987654321", "").length, 0);
const last = entries.at(-1);
assert.ok(filterTechBlogs(entries, last.title, last.companySlug).some((entry) => entry.url === last.url), "Global search includes the end of the archive");

const valid = { title: "A real article", date: "2026-06-20", excerpt: "A real description.", tags: ["go", "go", "systems"] };
assert.deepEqual(validatePostFrontmatter(valid, "sample").tags, ["go", "systems"]);
assert.equal(validatePostFrontmatter({ ...valid, date: new Date("2026-06-20T00:00:00Z") }, "sample").date, "2026-06-20");
for (const invalid of [
  { ...valid, title: "" },
  { ...valid, excerpt: " " },
  { ...valid, date: undefined },
  { ...valid, date: "2026-02-29" },
  { ...valid, date: "2026-13-01" },
  { ...valid, date: new Date("invalid") },
  { ...valid, tags: ["go", 1] },
]) assert.throws(() => validatePostFrontmatter(invalid, "invalid-sample"), /Invalid/);

const post = (slug, tags, date = "2026-06-20") => ({ slug, tags, date, title: slug, excerpt: "Description", readingTime: "1 min read" });
const current = post("current", ["systems", "go"]);
const candidates = [current, post("specific", ["go"]), post("general", ["systems"]), post("general-2", ["systems"]), post("unrelated", ["books"])];
assert.deepEqual(relatedPosts(current, candidates).map((item) => item.slug), ["specific", "general", "general-2"]);
assert.ok(!relatedPosts(current, candidates).includes(current));
assert.deepEqual(relatedPosts(current, candidates, 0), []);
assert.deepEqual(relatedPosts(post("no-overlap", ["python"]), candidates), []);
console.log(`PASS: pagination, full-archive search (${entries.length} entries), URL encoding, stable ordering, frontmatter validation and related-article selection`);

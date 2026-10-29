import fs from "node:fs";
import path from "node:path";

// Offline loader for the aggregated tech-blog feed data. The JSON files in
// docs-tech-blogs/ are produced offline by scripts/fetch-tech-blogs.mjs (run by
// a scheduled GitHub Action) and committed to the repo. This reader is a pure
// fs read — no network — so `next build` stays reproducible. Mirrors blog.ts.
const TECH_BLOGS_DIR = path.join(process.cwd(), "docs-tech-blogs");

export type TechBlogEntry = {
  company: string; // display name, e.g. "Airbnb"
  companySlug: string; // fs-safe slug, e.g. "airbnb"
  title: string;
  url: string; // direct link to the original (external) article
  date: string; // ISO "YYYY-MM-DD"
  summary: string; // plain-text excerpt
};

// All entries across every company file, newest first.
export function getAllTechBlogs(): TechBlogEntry[] {
  if (!fs.existsSync(TECH_BLOGS_DIR)) {
    throw new Error("Missing docs-tech-blogs snapshot. Include the committed feed data in the server deployment.");
  }

  const entries = fs
    .readdirSync(TECH_BLOGS_DIR)
    .filter((f) => f.endsWith(".json"))
    .flatMap((f) => {
      const raw = fs.readFileSync(path.join(TECH_BLOGS_DIR, f), "utf8");
      return JSON.parse(raw) as TechBlogEntry[];
    });

  for (const entry of entries) {
    let url: URL;
    try { url = new URL(entry.url); }
    catch { throw new Error(`Invalid article URL in ${entry.companySlug} feed snapshot. Store absolute source URLs.`); }
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
      throw new Error(`Unsupported article URL in ${entry.companySlug} feed snapshot.`);
    }
  }

  return entries.sort((a, b) =>
    b.date.localeCompare(a.date) || a.companySlug.localeCompare(b.companySlug) || a.url.localeCompare(b.url),
  );
}

export type CompanyFacet = { slug: string; name: string; count: number };

// Distinct companies present in the data, with post counts — drives the filter
// chips. Sorted by name for a stable, scannable order.
export function getCompanies(entries: TechBlogEntry[]): CompanyFacet[] {
  const map = new Map<string, CompanyFacet>();
  for (const e of entries) {
    const existing = map.get(e.companySlug);
    if (existing) existing.count++;
    else map.set(e.companySlug, { slug: e.companySlug, name: e.company, count: 1 });
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

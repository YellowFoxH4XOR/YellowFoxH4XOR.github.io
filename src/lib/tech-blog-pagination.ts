import type { TechBlogEntry } from "./tech-blogs";

export const TECH_BLOG_PAGE_SIZE = 50;

export function techBlogPageCount(count: number) {
  return Math.max(1, Math.ceil(count / TECH_BLOG_PAGE_SIZE));
}

export function techBlogArchivePath(page = 1) {
  return page === 1 ? "/tech-blogs" : `/tech-blogs/page/${page}`;
}

export function techBlogSearchPath({ query = "", source = "", page = 1 }: {
  query?: string;
  source?: string;
  page?: number;
} = {}) {
  if (!query && !source) return techBlogArchivePath(page);
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (source) params.set("source", source);
  if (page > 1) params.set("page", String(page));
  return `/tech-blogs/search?${params}`;
}

export function filterTechBlogs(entries: TechBlogEntry[], query: string, source: string) {
  const keyword = query.trim().toLowerCase();
  return entries.filter((entry) =>
    (!source || entry.companySlug === source) &&
    `${entry.title} ${entry.summary} ${entry.company}`.toLowerCase().includes(keyword),
  );
}

export function techBlogPage(entries: TechBlogEntry[], page: number) {
  const offset = (page - 1) * TECH_BLOG_PAGE_SIZE;
  return entries.slice(offset, offset + TECH_BLOG_PAGE_SIZE);
}

// A compact set of real links, not a button-only "load more" interface.
export function paginationNumbers(current: number, total: number) {
  return [...new Set([1, current - 1, current, current + 1, total])]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b);
}

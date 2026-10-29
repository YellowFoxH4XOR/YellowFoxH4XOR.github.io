import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { TechBlogArchive } from "@/components/tech-blog-archive";
import { getAllTechBlogs, getCompanies } from "@/lib/tech-blogs";
import { filterTechBlogs, techBlogPage, techBlogPageCount, techBlogSearchPath } from "@/lib/tech-blog-pagination";
import { pageMetadata } from "@/lib/page-metadata";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

async function getSearch(searchParams: Props["searchParams"]) {
  const params = await searchParams;
  const first = (key: string) => Array.isArray(params[key]) ? params[key][0] ?? "" : params[key] ?? "";
  const query = first("q").trim().replace(/\s+/g, " ").slice(0, 200);
  const source = first("source");
  const rawPage = first("page") || "1";
  const page = Number(rawPage);
  const entries = getAllTechBlogs();
  const companies = getCompanies(entries);
  if (!/^[1-9]\d*$/.test(rawPage) || !Number.isSafeInteger(page) || (source && !companies.some((company) => company.slug === source))) notFound();
  const filtered = filterTechBlogs(entries, query, source);
  const totalPages = techBlogPageCount(filtered.length);
  if (page > totalPages) notFound();
  const path = techBlogSearchPath({ query, source, page });
  if (!query && !source) redirect(path);
  return { entries: techBlogPage(filtered, page), companies, totalEntries: entries.length, totalResults: filtered.length, totalPages, page, query, source, path };
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const state = await getSearch(searchParams);
  const sourceName = state.companies.find((company) => company.slug === state.source)?.name;
  const subject = [state.query ? `“${state.query}”` : "", sourceName ?? ""].filter(Boolean).join(" · ");
  return pageMetadata(
    `${subject} — Reading Room${state.page > 1 ? ` — Page ${state.page}` : ""}`,
    `Browse ${state.totalResults} matching engineering and AI research articles${sourceName ? ` from ${sourceName}` : ""}${state.query ? ` for “${state.query}”` : ""}. Page ${state.page} of ${state.totalPages}, with excerpts and original-source links.`,
    state.path,
  );
}

export default async function TechBlogSearchPage({ searchParams }: Props) {
  return <TechBlogArchive {...await getSearch(searchParams)} />;
}

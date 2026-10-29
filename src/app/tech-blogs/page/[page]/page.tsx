import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TechBlogArchive } from "@/components/tech-blog-archive";
import { getAllTechBlogs, getCompanies } from "@/lib/tech-blogs";
import { techBlogArchivePath, techBlogPage, techBlogPageCount } from "@/lib/tech-blog-pagination";
import { pageMetadata } from "@/lib/page-metadata";

type Props = { params: Promise<{ page: string }> };
export const dynamicParams = false;

export function generateStaticParams() {
  return Array.from({ length: techBlogPageCount(getAllTechBlogs().length) - 1 }, (_, index) => ({ page: String(index + 2) }));
}

async function getPage(params: Props["params"]) {
  const value = (await params).page;
  const page = Number(value);
  if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(page) || page < 2 || page > techBlogPageCount(getAllTechBlogs().length)) notFound();
  return page;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getPage(params);
  return pageMetadata(
    `Engineering Blogs & AI Research — Page ${page}`,
    `Page ${page} of the engineering and AI research reading room. Browse older articles, short feed excerpts, and links to the original sources.`,
    techBlogArchivePath(page),
  );
}

export default async function TechBlogsArchivePage({ params }: Props) {
  const page = await getPage(params);
  const entries = getAllTechBlogs();
  return <TechBlogArchive entries={techBlogPage(entries, page)} companies={getCompanies(entries)} totalEntries={entries.length} totalResults={entries.length} page={page} totalPages={techBlogPageCount(entries.length)} path={techBlogArchivePath(page)} />;
}

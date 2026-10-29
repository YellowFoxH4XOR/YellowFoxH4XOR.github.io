import type { Metadata } from "next";
import { getAllTechBlogs, getCompanies } from "@/lib/tech-blogs";
import { TechBlogArchive } from "@/components/tech-blog-archive";
import { techBlogPage, techBlogPageCount } from "@/lib/tech-blog-pagination";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata(
  "Engineering Blogs & AI Research",
  "Explore engineering blogs and AI research from the teams I follow. Search by keyword or source, with short feed excerpts and links to the original articles.",
  "/tech-blogs",
);

export default function TechBlogsPage() {
  const entries = getAllTechBlogs();
  return <TechBlogArchive entries={techBlogPage(entries, 1)} companies={getCompanies(entries)} totalEntries={entries.length} totalResults={entries.length} page={1} totalPages={techBlogPageCount(entries.length)} path="/tech-blogs" />;
}

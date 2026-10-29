import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { PageHeader } from "@/components/page-header";
import { TechBlogList } from "@/components/tech-blog-list";
import { techBlogsCollectionSchema } from "@/lib/seo";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { TECH_BLOG_PAGE_SIZE } from "@/lib/tech-blog-pagination";
import type { TechBlogEntry, CompanyFacet } from "@/lib/tech-blogs";

export function TechBlogArchive({ entries, companies, totalEntries, totalResults, page, totalPages, path, query = "", source = "" }: {
  entries: TechBlogEntry[];
  companies: CompanyFacet[];
  totalEntries: number;
  totalResults: number;
  page: number;
  totalPages: number;
  path: string;
  query?: string;
  source?: string;
}) {
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Reading room", path: "/tech-blogs" },
    ...(path !== "/tech-blogs" ? [{ name: query || source ? "Search results" : `Page ${page}`, path }] : []),
  ];

  return (
    <div>
      <JsonLd data={techBlogsCollectionSchema(entries, { path, total: totalResults, offset: (page - 1) * TECH_BLOG_PAGE_SIZE })} />
      <Breadcrumbs items={crumbs} />
      <PageHeader
        eyebrow="Engineering blogs & AI research"
        title="Reading room."
        deck={<p>A reading room from engineering teams and AI labs: titles, short feed excerpts, and links to the originals. For my own essays, explore <Link href="/blog" className="text-brand link-ember">the writing archive</Link>.</p>}
        meta={[`${totalEntries} articles tracked`, `${companies.length} sources`, "Refresh scheduled daily"]}
      />
      <div className="block-gap">
        <TechBlogList entries={entries} companies={companies} totalEntries={totalEntries} totalResults={totalResults} page={page} totalPages={totalPages} query={query} source={source} />
      </div>
    </div>
  );
}

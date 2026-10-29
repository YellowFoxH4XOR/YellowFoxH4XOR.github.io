import type { Metadata } from "next";
import { getAllTechBlogs, getCompanies } from "@/lib/tech-blogs";
import { TechBlogList } from "@/components/tech-blog-list";
import { JsonLd } from "@/components/json-ld";
import { Reveal } from "@/components/reveal";
import { PageHeader } from "@/components/page-header";
import { techBlogsCollectionSchema } from "@/lib/seo";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata(
  "Tech Blogs",
  "Recent posts from engineering blogs and AI labs, plus the latest AI research, aggregated from feeds and linked to the original sources.",
  "/tech-blogs",
);

export default function TechBlogsPage() {
  const entries = getAllTechBlogs();
  const companies = getCompanies(entries);

  return (
    <div>
      {entries.length > 0 && (
        <JsonLd data={techBlogsCollectionSchema(entries)} />
      )}

      <PageHeader
        eyebrow="Engineering blogs & AI research"
        title={
          <>
            Reading room.
          </>
        }
        deck={
          <p>
            Recent posts and AI research from the companies I follow, pulled
            from their feeds and linked straight to the originals. Nothing is
            reproduced here, only pointed at.
          </p>
        }
        meta={[
          `${entries.length} posts tracked`,
          `${companies.length} sources`,
          "Refreshed daily",
        ]}
      />

      {entries.length > 0 ? (
        <Reveal className="block-gap">
          <TechBlogList entries={entries} companies={companies} />
        </Reveal>
      ) : (
        <p className="block-gap text-sm text-muted-foreground">
          No posts yet, run{" "}
          <code className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs">
            npm run fetch-tech-blogs
          </code>{" "}
          and commit the output in{" "}
          <code className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs">
            docs-tech-blogs/
          </code>
          .
        </p>
      )}
    </div>
  );
}

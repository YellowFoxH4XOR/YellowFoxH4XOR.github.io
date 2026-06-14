import type { Metadata } from "next";
import { getAllTechBlogs, getCompanies } from "@/lib/tech-blogs";
import { TechBlogList } from "@/components/tech-blog-list";
import { JsonLd } from "@/components/json-ld";
import { techBlogsCollectionSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Tech Blogs",
  description:
    "Recent posts from big-tech engineering blogs and AI labs — Airbnb, Meta, Netflix, OpenAI, Anthropic, Cloudflare, and more — plus the latest AI research, aggregated from their feeds and linked to the originals.",
  alternates: { canonical: "/tech-blogs" },
};

export default function TechBlogsPage() {
  const entries = getAllTechBlogs();
  const companies = getCompanies(entries);

  return (
    <div className="space-y-10 animate-fade-in-up">
      {entries.length > 0 && (
        <JsonLd data={techBlogsCollectionSchema(entries)} />
      )}
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-gradient-brand pb-1">
          Tech Blogs
        </h1>
        <p className="mt-2 text-muted-foreground">
          Recent engineering posts and AI research from the companies I follow —
          fetched from their RSS feeds and linked to the originals. Filter by
          company; newest first.
        </p>
      </header>

      {entries.length > 0 ? (
        <TechBlogList entries={entries} companies={companies} />
      ) : (
        <p className="text-sm text-muted-foreground">
          No posts yet — run{" "}
          <code className="rounded border border-border/40 bg-muted px-1.5 py-0.5 font-mono text-xs">
            npm run fetch-tech-blogs
          </code>{" "}
          and commit the output in{" "}
          <code className="rounded border border-border/40 bg-muted px-1.5 py-0.5 font-mono text-xs">
            docs-tech-blogs/
          </code>
          .
        </p>
      )}
    </div>
  );
}

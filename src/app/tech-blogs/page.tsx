import type { Metadata } from "next";
import { getAllTechBlogs, getCompanies } from "@/lib/tech-blogs";
import { TechBlogList } from "@/components/tech-blog-list";
import { JsonLd } from "@/components/json-ld";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
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
    <div>
      {entries.length > 0 && (
        <JsonLd data={techBlogsCollectionSchema(entries)} />
      )}

      <header className="opacity-0 animate-fade-in-up [animation-fill-mode:forwards]">
        <p className="eyebrow">The reading room</p>
        <h1 className="mt-4 text-[clamp(2.4rem,6vw,4.25rem)] font-bold leading-[1.02] tracking-[-0.03em]">
          Engineering blogs
          <br />
          worth your time<span className="text-brand">.</span>
        </h1>
        <p className="mt-5 max-w-xl text-muted-foreground">
          Recent posts and AI research from the companies I follow, pulled from
          their RSS feeds and linked to the originals. Filter by company,
          newest first.
        </p>
      </header>

      {entries.length > 0 ? (
        <Reveal className="mt-12">
          <SectionHeading>{entries.length} posts tracked</SectionHeading>
          <div className="mt-6">
            <TechBlogList entries={entries} companies={companies} />
          </div>
        </Reveal>
      ) : (
        <p className="mt-12 text-sm text-muted-foreground">
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

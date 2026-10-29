import type { Metadata } from "next";
import { getAllPosts } from "@/lib/blog";
import { BlogArchive } from "@/components/blog-archive";
import { JsonLd } from "@/components/json-ld";
import { PageHeader } from "@/components/page-header";
import { blogSchema } from "@/lib/seo";
import { pageMetadata } from "@/lib/page-metadata";
import { Breadcrumbs } from "@/components/breadcrumbs";

export const metadata: Metadata = pageMetadata(
  "Platform Engineering & AI Notes",
  "Practical notes on AI agents, platform engineering, backend systems, Python, and Go.",
  "/blog",
);

export default function BlogIndexPage() {
  const posts = getAllPosts();
  return (
    <div>
      {posts.length > 0 && <JsonLd data={blogSchema(posts)} />}
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Writing", path: "/blog" }]} />
      <PageHeader
        eyebrow="Field notes from building real systems."
        title="Writing."
        deck={
          <p>
            Python, Go, AI infrastructure, and distributed systems. What worked,
            what broke, and what I learned along the way. Also available via the{" "}
            <a href="/feed.xml" className="text-brand link-ember">RSS feed</a>.
          </p>
        }
      />
      <BlogArchive posts={posts} />
    </div>
  );
}

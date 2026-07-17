import type { Metadata } from "next";
import { getAllPosts } from "@/lib/blog";
import { PostCard } from "@/components/post-card";
import { JsonLd } from "@/components/json-ld";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { blogSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Blog",
  description: "Writing about engineering, systems, and what I'm learning.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <div>
      {posts.length > 0 && <JsonLd data={blogSchema(posts)} />}

      <header className="opacity-0 animate-fade-in-up [animation-fill-mode:forwards]">
        <p className="eyebrow">The blog</p>
        <h1 className="mt-4 text-[clamp(2.4rem,6vw,4.25rem)] font-bold leading-[1.02] tracking-[-0.03em]">
          Notes on engineering,
          <br />
          systems, and craft<span className="text-brand">.</span>
        </h1>
        <p className="mt-5 max-w-xl text-muted-foreground">
          What I&apos;m building, breaking, and learning. New posts appear here
          first, and in the{" "}
          <a href="/feed.xml" className="text-brand link-ember">
            RSS feed
          </a>
          .
        </p>
      </header>

      {posts.length > 0 ? (
        <Reveal className="mt-12">
          <SectionHeading>{posts.length} posts</SectionHeading>
          <div className="mt-2 divide-y divide-border border-b border-border">
            {posts.map((post, i) => (
              <PostCard key={post.slug} post={post} index={i} />
            ))}
          </div>
        </Reveal>
      ) : (
        <p className="mt-12 text-sm text-muted-foreground">
          No posts yet, add a markdown file to{" "}
          <code className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs">
            content/blog/
          </code>
          .
        </p>
      )}
    </div>
  );
}

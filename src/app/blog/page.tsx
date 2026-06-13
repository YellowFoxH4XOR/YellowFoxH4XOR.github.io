import type { Metadata } from "next";
import { getAllPosts } from "@/lib/blog";
import { PostCard } from "@/components/post-card";

export const metadata: Metadata = {
  title: "Blog",
  description: "Writing about engineering, systems, and what I'm learning.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <div className="space-y-10 animate-fade-in-up">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-gradient-brand pb-1">Blog</h1>
        <p className="mt-2 text-muted-foreground">
          Notes on engineering, systems, and what I&apos;m learning.
        </p>
      </header>

      {posts.length > 0 ? (
        <div className="grid gap-4 animate-fade-in-up opacity-0 animation-delay-100 [animation-fill-mode:forwards]">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground animate-fade-in-up opacity-0 animation-delay-100 [animation-fill-mode:forwards]">
          No posts yet — add a markdown file to{" "}
          <code className="rounded border border-border/40 bg-muted px-1.5 py-0.5 font-mono text-xs">
            content/blog/
          </code>
          .
        </p>
      )}
    </div>
  );
}

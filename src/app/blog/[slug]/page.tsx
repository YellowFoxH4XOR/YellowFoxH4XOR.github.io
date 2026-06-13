import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getAllPosts, getPostBySlug, formatDate } from "@/lib/blog";
import { Markdown } from "@/components/markdown";
import { Badge } from "@/components/ui/badge";

// Pre-render one static page per post at build time; unknown slugs 404.
export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}
export const dynamicParams = false;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
    },
  };
}

export default async function PostPage({ params }: Params) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="space-y-8 animate-fade-in-up">
      <Link
        href="/blog"
        className="group inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" /> Back to blog
      </Link>

      <header className="space-y-3 border-b border-border/40 pb-8">
        <div className="flex items-center gap-3 text-sm text-muted-foreground/80">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span aria-hidden>·</span>
          <span>{post.readingTime}</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-gradient-brand pb-1">
          {post.title}
        </h1>
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="font-mono text-xs bg-secondary/60 border border-border/20 backdrop-blur-md">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </header>

      <Markdown content={post.content} />
    </article>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getAllPosts, getPostBySlug, formatDate } from "@/lib/blog";
import { Markdown } from "@/components/markdown";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/json-ld";
import { blogPostingSchema, breadcrumbSchema } from "@/lib/seo";
import { ReadingProgress } from "@/components/reading-progress";
import { site } from "@/lib/site";

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
    keywords: post.tags,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      authors: [site.name],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function PostPage({ params }: Params) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const posts = getAllPosts();
  const idx = posts.findIndex((p) => p.slug === post.slug);
  const newer = idx > 0 ? posts[idx - 1] : null;
  const older = idx < posts.length - 1 ? posts[idx + 1] : null;
  const crumbs = [
    { name: "Home", url: site.url },
    { name: "Blog", url: `${site.url}/blog` },
    { name: post.title, url: `${site.url}/blog/${post.slug}` },
  ];

  return (
    <article className="space-y-8 animate-fade-in-up">
      <JsonLd data={blogPostingSchema(post)} />
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <ReadingProgress />
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

      {(newer || older) && (
        <nav className="grid gap-4 border-t border-border/40 pt-8 sm:grid-cols-2">
          {older ? (
            <Link
              href={`/blog/${older.slug}`}
              className="group rounded-xl glass-panel p-4 transition-colors hover:border-brand/40"
            >
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <ArrowLeft className="size-3" /> Older
              </span>
              <span className="mt-1 block font-medium transition-colors group-hover:text-brand">
                {older.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {newer ? (
            <Link
              href={`/blog/${newer.slug}`}
              className="group rounded-xl glass-panel p-4 text-right transition-colors hover:border-brand/40 sm:col-start-2"
            >
              <span className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                Newer <ArrowRight className="size-3" />
              </span>
              <span className="mt-1 block font-medium transition-colors group-hover:text-brand">
                {newer.title}
              </span>
            </Link>
          ) : null}
        </nav>
      )}
    </article>
  );
}

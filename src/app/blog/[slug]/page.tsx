import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getAllPosts, getPostBySlug, formatDate } from "@/lib/blog";
import { extractToc } from "@/lib/toc";
import { Markdown } from "@/components/markdown";
import { TableOfContents } from "@/components/table-of-contents";
import { JsonLd } from "@/components/json-ld";
import { blogPostingSchema, breadcrumbSchema } from "@/lib/seo";
import { ReadingProgress } from "@/components/reading-progress";
import { site } from "@/lib/site";
import { pageAlternates } from "@/lib/page-metadata";
import { relatedPosts } from "@/lib/post-recommendations";

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
    alternates: pageAlternates(`/blog/${post.slug}`),
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url: `${site.url}/blog/${post.slug}`,
      siteName: site.name,
      locale: site.locale,
      publishedTime: post.date,
      authors: [site.name],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      creator: site.twitterHandle,
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
  const toc = extractToc(post.content);
  const related = relatedPosts(post, posts);
  const crumbs = [
    { name: "Home", url: site.url },
    { name: "Blog", url: `${site.url}/blog` },
    { name: post.title, url: `${site.url}/blog/${post.slug}` },
  ];

  return (
    <div className="lg:grid lg:grid-cols-[13rem_minmax(0,44rem)] lg:justify-center lg:gap-x-12">
      {/* Contents rail. Rendered first in the DOM so keyboard users reach it
          before the article body, and so it can stick to the left margin. */}
      <TableOfContents items={toc} />

      <article className="mx-auto max-w-3xl lg:mx-0 lg:max-w-none">
        <JsonLd data={blogPostingSchema(post)} />
        <JsonLd data={breadcrumbSchema(crumbs)} />
        <ReadingProgress />

        <div>
          <Link
            href="/blog"
            className="group inline-flex items-center gap-2 font-mono text-micro font-medium uppercase tracking-[0.2em] text-muted-foreground transition-colors duration-200 hover:text-brand"
          >
            <ArrowLeft className="size-3.5 transition-transform duration-200 group-hover:-translate-x-1" />
            All posts
          </Link>

          <header className="mt-8 border-b border-hairline pb-9">
            <p className="eyebrow flex items-center gap-3">
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span aria-hidden className="text-brand">
                ·
              </span>
              <span>{post.readingTime}</span>
            </p>
            <h1 className="mt-5 text-display font-bold">{post.title}</h1>
            <p className="mt-6 text-lead leading-relaxed text-muted-foreground">{post.excerpt}</p>
            <div className="mt-6 flex items-center gap-3 text-sm">
              <Image src="/images/profile-portrait.jpg" width={40} height={40} alt="" className="size-10 rounded-full object-cover grayscale" />
              <span>By <Link href="/resume" className="link-ember inline-flex min-h-6 items-center">{site.name}</Link></span>
            </div>
            {post.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-hairline px-2.5 py-0.5 font-mono text-micro text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>
        </div>

        <div className="mt-10">
          <Markdown content={post.content} />
        </div>

        {related.length > 0 && (
          <section className="mt-14 border-t border-hairline pt-7" aria-labelledby="related-heading">
            <h2 id="related-heading" className="text-title font-semibold">Related writing</h2>
            <ul className="mt-5 space-y-5">
              {related.map((item) => (
                <li key={item.slug}>
                  <Link href={`/blog/${item.slug}`} className="link-ember font-medium">{item.title}</Link>
                  <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{item.excerpt}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {(newer || older) && (
          <nav className="mt-16 divide-y divide-hairline border-y border-hairline">
            {older && (
              <Link
                href={`/blog/${older.slug}`}
                className="index-row group flex items-baseline justify-between gap-6 py-5"
              >
                <span className="flex items-center gap-2 font-mono text-micro uppercase tracking-[0.2em] text-muted-foreground">
                  <ArrowLeft className="size-3.5 transition-transform duration-200 group-hover:-translate-x-1" />
                  Older
                </span>
                <span className="text-right font-medium tracking-tight transition-colors duration-200 group-hover:text-brand">
                  {older.title}
                </span>
              </Link>
            )}
            {newer && (
              <Link
                href={`/blog/${newer.slug}`}
                className="index-row group flex items-baseline justify-between gap-6 py-5"
              >
                <span className="font-medium tracking-tight transition-colors duration-200 group-hover:text-brand">
                  {newer.title}
                </span>
                <span className="flex items-center gap-2 font-mono text-micro uppercase tracking-[0.2em] text-muted-foreground">
                  Newer
                  <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </Link>
            )}
          </nav>
        )}
      </article>
    </div>
  );
}

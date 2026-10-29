import type { Metadata } from "next";
import { getAllPosts } from "@/lib/blog";
import { PostCard } from "@/components/post-card";
import { JsonLd } from "@/components/json-ld";
import { Reveal } from "@/components/reveal";
import { PageHeader } from "@/components/page-header";
import { SectionRail } from "@/components/section-rail";
import { blogSchema } from "@/lib/seo";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata(
  "Blog",
  "Practical notes on AI agents, platform engineering, backend systems, Python, and Go.",
  "/blog",
);

export default function BlogIndexPage() {
  const posts = getAllPosts();

  // Tag frequency across the archive, most-used first. Shown in the rail as a
  // read on what the writing actually covers, not as a filter control.
  const topics = Object.entries(
    posts.reduce<Record<string, number>>((acc, post) => {
      for (const tag of post.tags) acc[tag] = (acc[tag] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const years = posts.map((p) => new Date(p.date).getFullYear());
  const first = years.length > 0 ? Math.min(...years) : null;
  const last = years.length > 0 ? Math.max(...years) : null;
  // A single year should read "2026", not "2026–2026".
  const span =
    first === null || last === null
      ? undefined
      : first === last
        ? `${first}`
        : `${first}\u2013${last}`;

  return (
    <div>
      {posts.length > 0 && <JsonLd data={blogSchema(posts)} />}

      <PageHeader
        eyebrow="The blog"
        title={
          <>
            Notes on engineering, systems, and craft
            <span className="text-brand">.</span>
          </>
        }
        deck={
          <p>
            What I&apos;m building, breaking, and learning. New posts appear
            here first, and in the{" "}
            <a href="/feed.xml" className="text-brand link-ember">
              RSS feed
            </a>
            .
          </p>
        }
        meta={[
          `${posts.length} post${posts.length === 1 ? "" : "s"}`,
          ...(span ? [span] : []),
          "No cadence, only when it's ready",
        ]}
      />

      {posts.length > 0 ? (
        <Reveal className="section-gap">
          <SectionRail
            label="Archive"
            meta="Newest first. Every post is plain markdown, written in one sitting and edited in several."
            action={
              topics.length > 0 ? (
                <ul className="flex flex-wrap gap-x-4 gap-y-2">
                  {topics.map(([tag, count]) => (
                    <li
                      key={tag}
                      className="font-mono text-micro text-subtle"
                    >
                      {tag}
                      <span className="ml-1.5 text-brand">{count}</span>
                    </li>
                  ))}
                </ul>
              ) : undefined
            }
          >
            <div className="divide-y divide-hairline border-y border-hairline">
              {posts.map((post, i) => (
                <PostCard key={post.slug} post={post} index={i} />
              ))}
            </div>
          </SectionRail>
        </Reveal>
      ) : (
        <p className="section-gap text-sm text-muted-foreground">
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

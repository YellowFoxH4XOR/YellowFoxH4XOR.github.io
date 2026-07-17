import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatDate, type PostMeta } from "@/lib/blog";

// Editorial index row for a post: numeral, title, excerpt, mono metadata,
// and an arrow that lifts on hover. Used on the home page and /blog.
export function PostCard({
  post,
  index = 0,
}: {
  post: PostMeta;
  index?: number;
}) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group grid grid-cols-[2.25rem_1fr] items-baseline gap-x-4 py-6 sm:grid-cols-[3rem_1fr_auto] sm:gap-x-8 sm:py-7"
    >
      <span className="font-mono text-xs text-muted-foreground/70 transition-colors duration-300 group-hover:text-brand">
        {String(index + 1).padStart(2, "0")}
      </span>

      <span className="min-w-0">
        <span className="block text-lg font-semibold tracking-tight text-foreground transition-colors duration-300 group-hover:text-brand sm:text-xl">
          {post.title}
        </span>
        {post.excerpt && (
          <span className="mt-1.5 line-clamp-2 block max-w-2xl text-sm leading-6 text-muted-foreground">
            {post.excerpt}
          </span>
        )}
        <span className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-[11px] text-muted-foreground/80">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span aria-hidden>·</span>
          <span>{post.readingTime}</span>
          {post.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border px-2 py-0.5"
            >
              {tag}
            </span>
          ))}
        </span>
      </span>

      <ArrowUpRight className="hidden size-5 shrink-0 self-center text-muted-foreground transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-brand sm:block" />
    </Link>
  );
}

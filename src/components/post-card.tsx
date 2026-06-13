import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatDate, type PostMeta } from "@/lib/blog";
import { Badge } from "@/components/ui/badge";

export function PostCard({ post }: { post: PostMeta }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block rounded-xl glass-card p-5"
    >
      <div className="flex items-center gap-3 text-xs text-muted-foreground/80">
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        <span aria-hidden>·</span>
        <span>{post.readingTime}</span>
      </div>

      <h3 className="mt-2 text-lg font-semibold tracking-tight text-foreground transition-colors group-hover:text-brand">
        {post.title}
      </h3>

      {post.excerpt && (
        <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
          {post.excerpt}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {post.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="font-mono text-xs bg-secondary/60 border border-border/20 backdrop-blur-md">
              {tag}
            </Badge>
          ))}
        </div>
        <span className="inline-flex items-center gap-1 text-sm font-medium text-brand opacity-0 translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
          Read <ArrowRight className="size-4" />
        </span>
      </div>
    </Link>
  );
}

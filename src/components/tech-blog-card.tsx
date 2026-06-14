import { ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { TechBlogEntry } from "@/lib/tech-blogs";

// Mirrors PostCard but links OUT to the original article (external <a>, not
// next/link) and shows the originating company instead of reading time/tags.
export function TechBlogCard({ entry }: { entry: TechBlogEntry }) {
  return (
    <a
      href={entry.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col rounded-xl glass-card p-5"
    >
      <div className="flex items-center gap-3 text-xs text-muted-foreground/80">
        <time dateTime={entry.date}>{formatDate(entry.date)}</time>
        <span aria-hidden>·</span>
        <Badge
          variant="secondary"
          className="font-mono text-xs bg-secondary/60 border border-border/20 backdrop-blur-md"
        >
          {entry.company}
        </Badge>
      </div>

      <h3 className="mt-2 text-lg font-semibold tracking-tight text-foreground transition-colors group-hover:text-brand">
        {entry.title}
      </h3>

      {entry.summary && (
        <p className="mt-1.5 line-clamp-3 text-sm text-muted-foreground">
          {entry.summary}
        </p>
      )}

      <div className="mt-4 flex items-center justify-end">
        <span className="inline-flex items-center gap-1 text-sm font-medium text-brand opacity-0 translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
          Read <ExternalLink className="size-3.5" />
        </span>
      </div>
    </a>
  );
}

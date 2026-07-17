import { ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { TechBlogEntry } from "@/lib/tech-blogs";

// Editorial index row for an external engineering post. Links OUT to the
// original article (external <a>, not next/link); only metadata + a short
// summary are shown here.
export function TechBlogCard({ entry }: { entry: TechBlogEntry }) {
  return (
    <a
      href={entry.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-2 py-5 sm:py-6"
    >
      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className="rounded-full border border-brand/30 bg-brand/10 px-2.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-brand">
            {entry.company}
          </span>
          <time
            dateTime={entry.date}
            className="font-mono text-[11px] text-muted-foreground/80"
          >
            {formatDate(entry.date)}
          </time>
        </span>
        <span className="mt-2 block text-base font-semibold tracking-tight text-foreground transition-colors duration-300 group-hover:text-brand sm:text-lg">
          {entry.title}
        </span>
        {entry.summary && (
          <span className="mt-1.5 line-clamp-2 block max-w-2xl text-sm leading-6 text-muted-foreground">
            {entry.summary}
          </span>
        )}
      </span>

      <ExternalLink className="size-4 shrink-0 self-center text-muted-foreground transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-brand" />
    </a>
  );
}

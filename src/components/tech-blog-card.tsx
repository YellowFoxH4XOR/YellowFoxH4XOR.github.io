import { ArrowUpRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { TechBlogEntry } from "@/lib/tech-blogs";

// Editorial index row for an external engineering post. Links OUT to the
// original article (external <a>, not next/link); only metadata + a short
// summary are shown here.
//
// Titles and summaries come from third-party feeds, so they are wrapped
// defensively: arXiv in particular ships titles as one underscore-joined
// token ("Benchmarking_Fast_Domain_Adaptation_...") which has no break
// opportunity and blows out the grid on narrow screens.
export function TechBlogCard({ entry }: { entry: TechBlogEntry }) {
  return (
    <a
      href={entry.url}
      target="_blank"
      rel="noopener noreferrer"
      className="index-row defer-offscreen group grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-6 gap-y-2 py-5 sm:py-6"
    >
      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          {/* Neutral pill, not an ember one. With 1200+ rows an accent-filled
             chip on every line turns the accent into wallpaper, and brand
             text on a brand tint only reaches 4.1:1 in the light theme. */}
          <span className="rounded-full border border-hairline bg-muted px-2.5 py-0.5 font-mono text-micro font-medium uppercase tracking-[0.15em] text-muted-foreground transition-colors duration-200 group-hover:border-brand/40 group-hover:text-foreground">
            {entry.company}
          </span>
          <time
            dateTime={entry.date}
            className="font-mono text-micro text-subtle"
          >
            {formatDate(entry.date)}
          </time>
        </span>

        <span className="mt-2.5 block break-words text-[1.05rem] font-semibold leading-snug tracking-tight text-foreground transition-colors duration-200 group-hover:text-brand sm:text-[1.15rem]">
          {entry.title}
        </span>

        {entry.summary && (
          <span className="mt-2 line-clamp-2 block max-w-[68ch] break-words text-[0.9rem] leading-6 text-muted-foreground">
            {entry.summary}
          </span>
        )}
      </span>

      <ArrowUpRight className="size-4 shrink-0 self-center text-subtle transition-all duration-200 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-brand" />
    </a>
  );
}

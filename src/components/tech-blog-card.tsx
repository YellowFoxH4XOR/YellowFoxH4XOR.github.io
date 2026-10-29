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
      data-source={entry.companySlug}
      target="_blank"
      rel="noopener noreferrer"
      className="feed-card index-row defer-offscreen"
    >
      <div className="feed-card-main">
        <div className="feed-card-meta">
          {/* Neutral pill, not an ember one. With 1200+ rows an accent-filled
             chip on every line turns the accent into wallpaper, and brand
             text on a brand tint only reaches 4.1:1 in the light theme. */}
          <span className="feed-card-source">
            {entry.company}
          </span>
          <time
            dateTime={entry.date}
            className="feed-card-date"
          >
            {formatDate(entry.date)}
          </time>
        </div>

        <h2 className="feed-card-title">
          {entry.title}
        </h2>

        {entry.summary && (
          <p className="feed-card-summary">
            {entry.summary}
          </p>
        )}
      </div>

      <ArrowUpRight className="feed-card-arrow" aria-hidden />
    </a>
  );
}

"use client";

import { useId, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SparkIcon } from "@/components/icons";
import { TechBlogCard } from "@/components/tech-blog-card";
import type { TechBlogEntry, CompanyFacet } from "@/lib/tech-blogs";

type Props = {
  entries: TechBlogEntry[]; // pre-sorted newest-first by the server
  companies: CompanyFacet[];
};

/**
 * Feed index with a source filter.
 *
 * The filter lives in a sticky left rail rather than as a chip wall above the
 * list. With ~37 sources the chips took the entire first screen, so nobody saw
 * a post before scrolling; in the rail they cost no vertical space, stay
 * reachable while scrolling a very long list, and match the two-track layout
 * the rest of the site uses.
 *
 * Below `lg` there is no rail to put them in, and 37 stacked buttons is worse
 * than the wall it replaced, so the same choice is offered as a native select
 * (which phones render as a proper picker).
 */
export function TechBlogList({ entries, companies }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const search = useRef<HTMLInputElement>(null);
  const selectId = useId();

  // entries arrive newest-first; filtering preserves that order.
  const filtered = entries.filter(
    (entry) =>
      (!selected || entry.companySlug === selected) &&
      `${entry.title} ${entry.summary} ${entry.company}`
        .toLowerCase()
        .includes(query.toLowerCase().trim()),
  );

  const active = companies.find((c) => c.slug === selected);

  const railItem = (isActive: boolean) =>
    cn(
      "group flex w-full items-baseline gap-2 py-1 text-left font-mono text-[0.72rem] uppercase tracking-[0.1em] transition-colors duration-200",
      isActive
        ? "text-brand"
        : "text-muted-foreground hover:text-foreground",
    );

  return (
    <div className="spread">
      {/* Source filter */}
      <div className="spread-rail">
        <div className="flex items-center gap-3">
          <SparkIcon className="size-3 shrink-0 text-brand" />
          <h2 className="eyebrow shrink-0">Sources</h2>
          <span aria-hidden className="h-px flex-1 bg-hairline lg:hidden" />
        </div>

        {/* Compact picker for narrow screens. */}
        <div className="mt-4 lg:hidden">
          <label htmlFor={selectId} className="sr-only">
            Filter by source
          </label>
          <select
            id={selectId}
            value={selected ?? ""}
            onChange={(e) => setSelected(e.target.value || null)}
            className="w-full rounded-md border border-border bg-card px-3 py-2.5 font-mono text-meta text-foreground"
          >
            <option value="">All sources ({entries.length})</option>
            {companies.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name} ({c.count})
              </option>
            ))}
          </select>
        </div>

        {/* Full list on wide screens, scrolling inside the sticky rail. The
            mask softens the cut where the list runs past the rail instead of
            slicing a row in half at the viewport edge. */}
        <div
          className="mt-4 hidden max-h-[calc(100vh-13rem)] overflow-y-auto pr-2 lg:block"
          style={{
            maskImage:
              "linear-gradient(to bottom, black calc(100% - 2.5rem), transparent)",
          }}
        >
          <button
            type="button"
            onClick={() => setSelected(null)}
            aria-pressed={selected === null}
            className={railItem(selected === null)}
          >
            <span className="min-w-0 flex-1 truncate">All sources</span>
            <span className="shrink-0 text-subtle">{entries.length}</span>
          </button>
          {companies.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => setSelected(c.slug === selected ? null : c.slug)}
              aria-pressed={selected === c.slug}
              className={railItem(selected === c.slug)}
            >
              <span className="min-w-0 flex-1 truncate">{c.name}</span>
              <span className="shrink-0 text-subtle">{c.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Entries */}
      <div className="min-w-0">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <label className="archive-search flex-1">
            <Search aria-hidden className="size-5 shrink-0" />
            <span className="sr-only">Search tech blogs</span>
            <input
              ref={search}
              type="search"
              placeholder="Search tech blogs"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              className="grid size-11 place-items-center rounded-full border border-border"
              onClick={() => { setQuery(""); search.current?.focus(); }}
            >
              <X aria-hidden className="size-4" />
            </button>
          )}
        </div>
        <p role="status" aria-live="polite" aria-atomic="true" className="mb-4 font-mono text-micro uppercase tracking-[0.18em] text-subtle">
          {active
            ? `${filtered.length} from ${active.name}`
            : `${filtered.length} posts, newest first`}
        </p>

        {filtered.length > 0 ? (
          <div className="divide-y divide-hairline border-y border-hairline">
            {filtered.map((entry) => (
              <TechBlogCard
                key={`${entry.companySlug}-${entry.url}`}
                entry={entry}
              />
            ))}
          </div>
        ) : (
          <div className="archive-empty">
            <h2>No matching articles</h2>
            <p>Try another keyword or source.</p>
            <button
              type="button"
              className="primary-link"
              onClick={() => { setSelected(null); setQuery(""); search.current?.focus(); }}
            >
              Reset filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

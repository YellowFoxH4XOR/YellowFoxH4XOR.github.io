"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { TechBlogCard } from "@/components/tech-blog-card";
import type { TechBlogEntry, CompanyFacet } from "@/lib/tech-blogs";

type Props = {
  entries: TechBlogEntry[]; // pre-sorted newest-first by the server
  companies: CompanyFacet[];
};

export function TechBlogList({ entries, companies }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  // entries arrive newest-first; filtering preserves that order.
  const filtered = selected
    ? entries.filter((e) => e.companySlug === selected)
    : entries;

  const chip = (active: boolean) =>
    cn(
      "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
      active
        ? "border-brand bg-brand text-white shadow-[0_0_10px_var(--color-brand)]"
        : "border-border/40 text-muted-foreground hover:border-border hover:text-foreground",
    );

  return (
    <div className="space-y-6">
      <div role="group" aria-label="Filter by company" className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSelected(null)}
          aria-pressed={selected === null}
          className={chip(selected === null)}
        >
          All <span className="ml-1.5 text-xs opacity-70">{entries.length}</span>
        </button>
        {companies.map((c) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => setSelected(c.slug === selected ? null : c.slug)}
            aria-pressed={selected === c.slug}
            className={chip(selected === c.slug)}
          >
            {c.name} <span className="ml-1.5 text-xs opacity-70">{c.count}</span>
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2">
          {filtered.map((entry) => (
            <TechBlogCard key={`${entry.companySlug}-${entry.url}`} entry={entry} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No posts for this company.</p>
      )}
    </div>
  );
}

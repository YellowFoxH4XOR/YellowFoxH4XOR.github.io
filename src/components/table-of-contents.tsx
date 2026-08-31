"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { TocItem } from "@/lib/toc";

/**
 * Sticky contents rail for a post, with a scroll spy.
 *
 * Lives in the left margin on large screens, which would otherwise be empty.
 * Below `lg` it renders nothing: the reading-progress bar already answers
 * "how far in am I", and a collapsed accordion above the article would push
 * the first paragraph off the fold for no real gain.
 */
export function TableOfContents({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) return;

    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    // Pick the last heading whose top has passed the reading line (28% down
    // the viewport). Cheaper and far steadier than reacting to intersection
    // ratios, which flicker when several headings are on screen at once.
    const sync = () => {
      const line = window.innerHeight * 0.28;
      let current: string | null = null;
      for (const el of headings) {
        if (el.getBoundingClientRect().top <= line) current = el.id;
        else break;
      }
      // Before the first heading scrolls past, highlight nothing rather than
      // lying about where the reader is.
      setActiveId(current);
    };

    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync, { passive: true });
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [items]);

  if (items.length < 2) return null;

  return (
    <nav
      aria-label="On this page"
      className="sticky top-28 hidden max-h-[calc(100vh-9rem)] overflow-y-auto lg:block"
    >
      <p className="eyebrow">Contents</p>
      <ul className="mt-4 space-y-0.5 border-l border-hairline">
        {items.map((item) => {
          const active = activeId === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={active ? "location" : undefined}
                className={cn(
                  "-ml-px block border-l py-1.5 pr-2 text-[0.8rem] leading-5 transition-colors duration-200",
                  item.depth === 3 ? "pl-7" : "pl-4",
                  active
                    ? "border-brand font-medium text-foreground"
                    : "border-transparent text-subtle hover:border-border hover:text-foreground",
                )}
              >
                {item.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Editorial masthead for inner pages.
 *
 * Headline left, deck right: the standard magazine opener. It exists because
 * a left-aligned stack in a 72rem container leaves half the page empty, and
 * empty is not the same as spacious. On narrow screens the two tracks fold
 * into one and the deck simply follows the headline.
 *
 * `title` takes a ReactNode so pages can mark up their own line breaks and
 * accent punctuation without this component guessing at them.
 */
export function PageHeader({
  eyebrow,
  title,
  deck,
  meta,
  action,
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  deck?: ReactNode;
  /** Short mono facts shown under the deck: counts, cadence, sources. */
  meta?: string[];
  /** Optional call to action pinned to the foot of the deck column. */
  action?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "border-b border-hairline pb-[var(--space-block)]",
        className,
      )}
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:items-end lg:gap-14">
        <div className="opacity-0 animate-fade-in-up [animation-fill-mode:forwards]">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-5 text-display font-bold">{title}</h1>
        </div>

        {(deck || meta || action) && (
          <div
            className="opacity-0 animate-fade-in-up [animation-fill-mode:forwards] lg:pb-2"
            style={{ animationDelay: "140ms" }}
          >
            {deck && (
              <div className="max-w-[46ch] text-[0.98rem] leading-7 text-muted-foreground">
                {deck}
              </div>
            )}
            {meta && meta.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
                {meta.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 font-mono text-micro uppercase tracking-[0.18em] text-subtle"
                  >
                    <span
                      aria-hidden
                      className="size-1 rounded-full bg-brand/70"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            )}
            {action && <div className="mt-7">{action}</div>}
          </div>
        )}
      </div>
    </header>
  );
}

import { cn } from "@/lib/utils";
import { SparkIcon } from "@/components/icons";

/**
 * Editorial two-track section. The rail carries the section label and its
 * metadata (count, year, a trailing link); the main track carries content.
 *
 * On large screens the rail sticks while its own section scrolls past, so the
 * page always says where you are. Below `lg` it degrades to the familiar
 * label + hairline header, which is the right shape for a narrow column.
 */
export function SectionRail({
  label,
  meta,
  action,
  children,
  className,
}: {
  /** Short section name. Rendered as the mono eyebrow. */
  label: string;
  /** Optional second line: a count, a date range, a one-line note. */
  meta?: string;
  /** Optional footer slot in the rail, typically an "all posts" link. */
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("spread", className)}>
      <div className="spread-rail">
        <div className="flex items-center gap-3">
          <SparkIcon className="size-3 shrink-0 text-brand" />
          <h2 className="eyebrow shrink-0">{label}</h2>
          {/* The rule only earns its place in the collapsed layout; in the
              two-track spread the rail's own edge does that job. */}
          <span aria-hidden className="h-px flex-1 bg-hairline lg:hidden" />
        </div>

        {meta && (
          <p className="mt-3 hidden font-mono text-micro leading-relaxed text-subtle lg:block">
            {meta}
          </p>
        )}

        {action && <div className="mt-6 hidden lg:block">{action}</div>}
      </div>

      <div className="min-w-0">{children}</div>
    </section>
  );
}

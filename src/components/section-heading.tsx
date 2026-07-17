import { cn } from "@/lib/utils";
import { SparkIcon } from "@/components/icons";

// Section opener: ember spark, mono eyebrow label, and a hairline rule.
// The consistent rhythm across pages without reaching for cards.
export function SectionHeading({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <SparkIcon className="size-3 shrink-0 text-brand" />
      <h2 className="eyebrow shrink-0">{children}</h2>
      <span aria-hidden className="h-px flex-1 bg-border" />
    </div>
  );
}

import { SparkIcon } from "@/components/icons";

// Slow capability ticker. Pure CSS loop (two identical copies, translateX
// -50%), decorative only, so it is hidden from assistive tech. Pauses on
// hover; neutralized for reduced-motion users by the global media query.
export function Marquee({ items }: { items: string[] }) {
  return (
    <div
      aria-hidden="true"
      className="group relative overflow-hidden border-y border-border py-3.5 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
    >
      <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center gap-8 pr-8">
            {items.map((item) => (
              <span key={item} className="flex items-center gap-8">
                <span className="font-mono text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
                  {item}
                </span>
                <SparkIcon className="size-2.5 text-brand" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

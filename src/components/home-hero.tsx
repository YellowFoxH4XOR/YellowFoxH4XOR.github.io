"use client";

import { useRef, type CSSProperties, type PointerEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { site } from "@/lib/site";
import { SparkIcon } from "@/components/icons";

// Home hero: masked line-rise choreography on load, plus an ember glow that
// trails the pointer (written straight to the DOM, no re-renders). All motion
// is transform/opacity with an exponential ease-out.
export function HomeHero() {
  const glowRef = useRef<HTMLDivElement>(null);

  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    const glow = glowRef.current;
    if (!glow) return;
    const rect = e.currentTarget.getBoundingClientRect();
    glow.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    glow.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  return (
    <section
      onPointerMove={onPointerMove}
      className="relative -mx-6 overflow-hidden px-6 pb-4 pt-8 sm:pt-12 lg:-mx-8 lg:px-8"
    >
      {/* Pointer glow */}
      <div
        ref={glowRef}
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(340px circle at var(--mx, 70%) var(--my, 30%), color-mix(in oklch, var(--color-brand) 13%, transparent), transparent 70%)",
        }}
      />

      <div className="relative grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16">
        <div>
          {/* Eyebrow */}
          <p
            className="eyebrow flex items-center gap-2.5 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "40ms" }}
          >
            <SparkIcon className="size-3 text-brand" />
            {site.name} · {site.role}
          </p>

          {/* Statement */}
          <h1 className="mt-6 text-mega font-bold">
            <span className="hero-mask">
              <span className="hero-line" style={{ "--hero-delay": "120ms" } as CSSProperties}>
                I build the pipes
              </span>
            </span>{" "}
            <span className="hero-mask">
              <span
                className="hero-line text-brand"
                style={{ "--hero-delay": "220ms" } as CSSProperties}
              >
                AI products
              </span>
            </span>{" "}
            <span className="hero-mask">
              <span className="hero-line" style={{ "--hero-delay": "320ms" } as CSSProperties}>
                run on.
              </span>
            </span>
          </h1>

          {/* Intro */}
          <p
            className="mt-7 max-w-[54ch] text-lead text-muted-foreground opacity-0 animate-fade-in-up"
            style={{ animationDelay: "340ms" }}
          >
            {site.intro}
          </p>

          {/* Actions */}
          <div
            className="mt-9 flex flex-wrap items-center gap-4 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "420ms" }}
          >
            <Link
              href="/blog"
              className="group inline-flex items-center gap-2 rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground shadow-[0_12px_32px_-14px_var(--color-brand)] transition-all duration-200 ease-[cubic-bezier(0.25,1,0.5,1)] hover:-translate-y-0.5 hover:shadow-[0_20px_44px_-16px_var(--color-brand)]"
            >
              Read the blog
              <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/resume"
              className="group inline-flex items-center gap-2 rounded-md border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors duration-200 hover:border-brand/60 hover:text-brand"
            >
              Resume
              <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Status */}
          <p
            className="mt-10 flex items-center gap-2.5 font-mono text-meta text-muted-foreground opacity-0 animate-fade-in-up"
            style={{ animationDelay: "500ms" }}
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-blink rounded-full bg-brand" />
            </span>
            Currently: {site.worksFor}
          </p>
        </div>

        {/* Portrait */}
        <figure
          className="relative mx-auto w-44 shrink-0 opacity-0 animate-fade-in-up sm:w-52 lg:mx-0 lg:w-60"
          style={{ animationDelay: "380ms" }}
        >
          <div className="group relative -rotate-2 transition-transform duration-500 ease-out hover:rotate-0">
            {/* Corner ticks */}
            <span aria-hidden className="absolute -left-2.5 -top-2.5 h-5 w-5 border-l-2 border-t-2 border-brand" />
            <span aria-hidden className="absolute -right-2.5 -top-2.5 h-5 w-5 border-r-2 border-t-2 border-brand" />
            <span aria-hidden className="absolute -bottom-2.5 -left-2.5 h-5 w-5 border-b-2 border-l-2 border-brand" />
            <span aria-hidden className="absolute -bottom-2.5 -right-2.5 h-5 w-5 border-b-2 border-r-2 border-brand" />
            <Image
              src="/images/profile.jpg"
              alt={`Portrait of ${site.name}`}
              width={240}
              height={240}
              priority
              className="aspect-square w-full rounded-md border border-border object-cover grayscale-[45%] transition-all duration-500 group-hover:grayscale-0"
            />
          </div>
          <figcaption className="mt-4 text-center font-mono text-[11px] tracking-wider text-muted-foreground">
            fig. 01 · @yellowfox_h4xor
          </figcaption>
        </figure>
      </div>

      {/* Scroll cue */}
      <div
        aria-hidden
        className="mt-10 hidden items-center gap-3 opacity-0 animate-fade-in-up sm:flex"
        style={{ animationDelay: "580ms" }}
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-subtle">
          Scroll
        </span>
        <span className="h-px w-16 bg-border" />
        <span className="size-1 animate-float rounded-full bg-brand" />
      </div>
    </section>
  );
}

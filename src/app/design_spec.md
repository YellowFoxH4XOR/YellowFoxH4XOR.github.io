# Personal Developer Website Design Specification

This document outlines the design system, custom utilities, animation behaviors, and color science used in the site. The system uses standard **Tailwind CSS v4** rules and modern **OKLCH** color spaces.

---

## 0. Concept: Ember & Ink

The site's identity hook is the owner's handle (YellowFox). The aesthetic is a **fox den at night**: warm drafting paper by day, lamplit warm ink after dark, with a single committed **ember accent** (fox orange) carrying every brand moment. Surfaces are solid and calm; structure comes from hairline rules, index numerals, and mono metadata labels. No glassmorphism, no gradient text, no card grids by default.

Voice words: precise, warm, crafted.

---

## 1. Color System (OKLCH)

Neutrals are always warm-tinted (never pure black/white). One accent, used deliberately.

### Light Theme (drafting paper)
- **Background**: `oklch(0.968 0.009 85)` — warm off-white paper.
- **Foreground**: `oklch(0.25 0.025 55)` — warm ink, softer than black.
- **Brand (ember)**: `oklch(0.58 0.165 48)` — burnt ember orange, enough contrast on paper.
- **Borders**: `oklch(0.875 0.016 70)` — hairline rules.
- **Code panels**: `--code-bg: oklch(0.19 0.018 55)` — warm ink in both themes.

### Dark Theme (lamplit ink)
- **Background**: `oklch(0.165 0.013 55)` — warm near-black.
- **Foreground**: `oklch(0.915 0.014 75)` — warm paper white.
- **Brand (ember)**: `oklch(0.76 0.15 62)` — glowing amber for dark rooms.
- **Borders**: `oklch(0.29 0.022 55)`.

### Ambient background (layout)
1. `bg-grain` — SVG fractal-noise paper grain at ~3.5–5% opacity.
2. `bg-dot-pattern` — 26px dot field, masked to fade out below the fold.
3. Two static ember radial glows (top-right pulses slowly via `animate-pulse-slow`).

---

## 2. Typography

- **Display + body**: Bricolage Grotesque (`--font-sans`) — a crafted grotesque with character; weight and size contrast carry the hierarchy.
- **Data/labels**: Spline Sans Mono (`--font-mono`) — eyebrows, metadata, chips, nav, code.
- **Hero scale**: fluid `clamp(2.9rem, 7.5vw, 5.75rem)`, tight tracking (-0.035em). Page titles use `clamp(2.4rem, 6vw, 4.25rem)`.
- **Eyebrows** (`.eyebrow`): mono, 0.72rem, uppercase, 0.22em tracking, muted.
- **Signature**: every page title ends with an ember period; section headings pair the spark glyph with an eyebrow and a hairline rule (`SectionHeading`).
- Blog posts open with an **ember drop cap** (`.article > p:first-of-type::first-letter`).

---

## 3. Layout Language

- Editorial **index rows**, not card grids: numeral + title + metadata + arrow, divided by hairlines (`PostCard`, `TechBlogCard`, bookshelf, resume projects).
- Left-aligned asymmetric compositions; content capped at `max-w-6xl`, articles at `max-w-3xl`.
- `panel` utility (solid surface, hairline border, ember hover edge) exists for true cards; glass utilities were removed.
- The ember spark (`SparkIcon`) is the brand mark: nav logo, eyebrows, marquee separators, footer.
- Footer ends with a giant clipped name watermark.

---

## 4. Motion System

All motion is transform/opacity with an exponential ease-out (`--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1)`). No bounce, no elastic, no layout-property animation.

1. **Hero choreography**: masked line-rise (`hero-mask` + `hero-line` with `--hero-delay`) for the display statement; staggered `fade-in-up` for eyebrow, intro, actions, status, portrait.
2. **Pointer glow** (`HomeHero`): ember radial gradient trails the pointer, written straight to the DOM (no React re-renders).
3. **Scroll reveal** (`Reveal`): IntersectionObserver adds `.is-visible`; 0.9s rise with per-instance `--reveal-delay` stagger. Markup is server-rendered; reduced-motion users get the final state instantly.
4. **Marquee**: pure-CSS capability ticker (two copies, `translateX(-50%)`, 36s linear), pauses on hover.
5. **Micro-interactions**: arrows nudge on hover, the nav spark rotates 90°, skill chips and rows tint ember, book covers tilt in 3D (`book-3d`).
6. **Ambient**: `animate-pulse-slow` (glow), `animate-blink` (status dot), `animate-float` (scroll cue).
7. `prefers-reduced-motion: reduce` neutralizes everything globally.

---

## 5. Invariants

See `CLAUDE.md`. JSON-LD stays server-rendered via `<JsonLd>`; identity lives in `src/lib/site.ts`; sitemap/llms.txt/RSS derive from `getAllPosts()` and are never hand-edited.

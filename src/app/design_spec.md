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
- **Brand (ember)**: `oklch(0.55 0.17 46)` — burnt ember orange. Lightness is
  set by measurement, not taste: it is the darkest step that keeps link-sized
  text at 4.5:1 on paper.
- **Muted foreground**: `oklch(0.47 0.03 55)` (~6.2:1).
- **Subtle**: `oklch(0.54 0.028 58)` (~4.7:1) — the quietest readable tier.
- **Borders**: `oklch(0.875 0.016 70)`; **hairline**: `oklch(0.885 0.014 72)`.
- **Ink plane**: `oklch(0.228 0.024 50)` — the single dark surface per page.
- **Code panels**: `--code-bg: oklch(0.19 0.018 55)` — warm ink in both themes.

### Dark Theme (lamplit ink)
- **Background**: `oklch(0.165 0.013 55)` — warm near-black.
- **Foreground**: `oklch(0.915 0.014 75)` — warm paper white.
- **Brand (ember)**: `oklch(0.76 0.15 62)` — glowing amber for dark rooms.
- **Muted foreground**: `oklch(0.66 0.025 60)`; **subtle**: `oklch(0.59 0.024 60)`.
- **Borders**: `oklch(0.29 0.022 55)`; **hairline**: `oklch(0.265 0.02 55)`.
- **Ink plane**: `oklch(0.243 0.022 54)` — lifts off the page instead of sinking.

### Three text tiers, no faded text

`foreground` → `muted-foreground` → `subtle`. Never dim text with an opacity
modifier: `text-muted-foreground/70` and friends measure 2.6–3.9:1 and fail
WCAG AA. Hierarchy is carried by size, weight, and family instead.

### Ambient background (layout)
1. `bg-grain` — SVG fractal-noise paper grain at ~5.5–7.5% opacity.
2. `bg-dot-pattern` — 26px dot field, masked to fade out below the fold.
3. Two ember radial glows (top-right pulses slowly via `animate-pulse-slow`).
4. A radial vignette, so the middle of the page reads as the lit part of the room.

---

## 2. Typography

- **Display + body**: Bricolage Grotesque (`--font-sans`) — a crafted grotesque with character; weight and size contrast carry the hierarchy.
- **Data/labels**: Spline Sans Mono (`--font-mono`) — eyebrows, metadata, chips, nav, code.
- **Scale**: one fluid modular scale, `--text-micro` → `--text-mega`, each step a
  visible jump (~1.3 ratio). Utilities: `text-mega` (home hero), `text-display`
  (page titles, post titles), `text-headline`, `text-title` (index-row titles),
  `text-lead`, `text-meta`, `text-micro`. Nothing sizes itself off-scale.
- **Eyebrows** (`.eyebrow`): mono, `--text-micro`, uppercase, 0.22em tracking, muted.
- **Measure**: article prose is capped at 40rem (~70 characters). Code blocks,
  tables and images keep the full column, because they are scanned, not read.
- **Figures**: `tabular-nums` on everything mono, so dates and indices never jitter.
- **Signature**: every page title ends with an ember period; section labels pair
  the spark glyph with a mono eyebrow (`SectionRail`).
- Posts open with a **lead paragraph** set one step up. There is no drop cap:
  a drop cap is only as good as its first letter, and "I" or an opening quote
  renders as a stray stroke.

---

## 3. Layout Language

- **The editorial spread** is the core pattern. `spread` + `spread-rail` build a
  two-track grid: a sticky rail carrying the section label and its metadata,
  and a wide track carrying the content. It exists because a left-aligned stack
  in a 72rem container leaves half the page empty, and empty is not spacious.
  Below `lg` it folds to a single column.
- **Inner pages open with a masthead** (`PageHeader`): headline left, deck right.
- Editorial **index rows**, not card grids: numeral + title + metadata + arrow,
  divided by hairlines (`PostCard`, `TechBlogCard`, bookshelf, resume projects).
  The `index-row` utility gives the whole row a warm hover wash.
- **One ink plane per page.** The dark panel is what the warm paper pushes
  against, and it stops working the moment it repeats.
- Grid tracks holding text are always `minmax(0, 1fr)`. A bare `1fr` carries an
  implicit `min-width: auto`, refuses to shrink, and clips content on phones.
- `panel` (solid surface, hairline border, ember hover edge) exists for true
  cards; glass utilities were removed.
- The ember spark (`SparkIcon`) is the brand mark: nav logo, eyebrows, marquee
  separators, footer.
- Footer ends with a giant name watermark, masked so it dissolves off the bottom
  rather than being sliced by the viewport edge.

---

## 4. Motion System

All motion is transform/opacity. Hovers are fast (180ms on `--ease-out-quart`);
entrances are slow and cinematic (`--ease-out-expo`). No bounce, no elastic, no
layout-property animation.

1. **Hero choreography**: masked line-rise (`hero-mask` + `hero-line` with `--hero-delay`) for the display statement; staggered `fade-in-up` for eyebrow, intro, actions, status, portrait. The whole sequence settles inside ~1.2s.
2. **Pointer glow** (`HomeHero`): ember radial gradient trails the pointer, written straight to the DOM (no React re-renders).
3. **Scroll reveal** (`Reveal`): IntersectionObserver adds `.is-visible`; 0.9s rise with per-instance `--reveal-delay` stagger. The hidden start state is scoped to `@media (scripting: enabled)` so a reader without JavaScript sees content rather than a blank page.
4. **Marquee**: pure-CSS capability ticker (two copies, `translateX(-50%)`, 36s linear), full-bleed, pauses on hover.
5. **Micro-interactions**: arrows nudge on hover, the nav spark rotates 90°, index rows wash ember, book covers tilt in 3D (`book-3d`).
6. **Navigation**: the header dissolves at the top of the page and materialises into a defined bar once content passes underneath.
7. **Ambient**: `animate-pulse-slow` (glow), `animate-blink` (status dot), `animate-float` (scroll cue).
8. `prefers-reduced-motion: reduce` neutralizes everything globally.

---

## 5. Performance and print

- Long index lists use `defer-offscreen` (`content-visibility: auto` plus a
  measured `contain-intrinsic-size`). Every row stays in the DOM for crawlers,
  but off-screen rows skip layout and paint: a full style+layout pass on the
  1200-row feed drops from ~150ms to ~16ms.
- Print CSS re-declares the light token set inside `@media print`. Element
  colour classes override a body-level rule, so without this a reader in dark
  mode prints white on white. Screen-only furniture is hidden with
  `data-print-hide`, never by tag name.

---

## 6. Invariants

See `CLAUDE.md`. JSON-LD stays server-rendered via `<JsonLd>`; identity lives in
`src/lib/site.ts`; sitemap/llms.txt/RSS derive from `getAllPosts()` and are never
hand-edited. Run `npm run design-check` after any UI change.

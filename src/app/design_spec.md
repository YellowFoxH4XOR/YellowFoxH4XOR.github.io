# Engineering portfolio — Ember & Ink

## Design source

The implementation adapts the Pi Designer project **Akshat Katiyar — Engineering
portfolio redesign** (`proj_a3a2a5e26c280d08`) into the existing Next.js App Router
site. It is not an embedded HTML prototype: the existing Markdown loaders,
content modules, routes, metadata, RSS, sitemap, and server-rendered JSON-LD remain
the source of truth.

## Visual direction

Warm drafting paper, quiet ink, and a restrained ember accent. The homepage opens
with a personal-name masthead and a portrait/biography spread. Writing has an
asymmetric lead/secondary hierarchy. A single dark studio plane showcases
Kelvanic and Deckle's real native UI, followed by three books and a contact footer.

The original Bricolage Grotesque / Spline Sans Mono pairing is retained through
`next/font`. No ticker, ambient glow, rotated portrait, giant watermark, or
load-blocking entrance remains. Content is visible immediately and without JS.

## Implementation map

| Concern | Source |
|---|---|
| Semantic light/dark tokens, article, print, shared utilities | `globals.css` |
| Pi Designer composition and responsive rules | `portfolio.css` |
| Identity, biography, employer, navigation and social URLs | `../lib/site.ts` |
| Experience, books and project descriptions | `../lib/content.ts` |
| Server-rendered homepage | `page.tsx`, `../components/home-hero.tsx` |
| Stateful Deckle views | `../components/deckle-gallery.tsx` |
| Native mobile navigation, theme control | `../components/navbar.tsx`, `theme-toggle.tsx` |
| Archive search/topic filters | `../components/blog-archive.tsx`, `../lib/post-topics.ts` |
| Shared inner-page heading | `../components/page-header.tsx` |
| Responsive/contrast/print checks | `../../scripts/design-check.mjs` |
| Interaction, content and metadata checks | `../../scripts/redesign-check.mjs` |

## Layout and typography

- The page measure is 1200px with fluid gutters. Text-bearing grid tracks use
  `minmax(0, 1fr)` to prevent horizontal overflow.
- The homepage masthead is the largest type; inner pages have short editorial
  titles. Article prose retains its bounded reading measure and syntax styling.
- At mobile widths, the introduction, writing action, current-work evidence and
  latest essay precede the portrait. The studio collapses to a single column.
- Books preserve their cover aspect ratios. The Deckle frame has a fixed aspect
  ratio and contains each authentic product view without cropping or layout shift.
- The nav switches to a native `<details>` menu below 769px. Escape restores
  summary focus; selection and desktop resize close the menu. It works without JS.

## Colour, interaction and accessibility

- Semantic paper/ink tokens support both themes; the dark studio remains raised
  above the dark page. Text hierarchy uses size, weight and family, not opacity.
- Orange is reserved for small actions and categories. The command trace's OK
  label uses a darker ink/ember blend to retain contrast on the tinted surface.
- Main controls have 44px targets, visible focus and native semantics. Theme
  selection follows the system initially and persists via `next-themes`.
- Archive search and topic filters combine and restore from `q` / `topic` query
  parameters, including back/forward. The server snapshot includes all essays;
  counts are live-announced, and empty-state recovery returns search focus.
- The reading room retains source filtering and adds keyword search / recovery.
- Motion is limited to restrained hover transforms, with existing reduced-motion
  overrides. `Reveal` remains a server-rendered compatibility wrapper, not an
  IntersectionObserver gate.
- Print retains the existing explicit light token set and resume identity block.

## Asset provenance

`public/images/profile-portrait.jpg`, `deckle-library.png`, and `deckle-desk.png`
are copied unchanged from the Pi Designer project. The portrait is its crop of the
original supplied photograph. Deckle images are the project's authentic native
view renders, documented in the prototype's `project-notes.md`. Book covers and
the original resume PDF remain in their existing paths. Next Image serves
optimized renditions; no runtime dependency on the Pi Designer workspace exists.

## Verification

Run `npm run build` and `npm run lint`. Against a production server, run
`npm run design-check -- <base-url>` and `npm run ui-check -- <base-url>`.
Both browser suites use an existing Playwright installation through
`PLAYWRIGHT_PATH` if it is not installed locally; Playwright is not added to
production dependencies. Screenshots are written into the ignored
`.design-review/redesign/` directory.

The automated checks are regression evidence, not a full manual screen-reader
accessibility certification. This integration does not change deployment config
or deploy the site.

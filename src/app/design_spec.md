# Engineering portfolio — Ember & Ink

## Design source

The original implementation adapted the Pi Designer project **Akshat Katiyar — Engineering
portfolio redesign** (`proj_a3a2a5e26c280d08`) into the existing Next.js App Router
site. The Hallmark homepage refinement retains that project's Ember & Ink brand,
real assets, content, and wiring. It is not an embedded HTML prototype: the existing Markdown loaders,
content modules, routes, metadata, RSS, sitemap, and server-rendered JSON-LD remain
the source of truth.

## Visual direction

Warm drafting paper, quiet ink, and a restrained ember accent. The homepage opens
with a personal-name masthead, a single engineering sentence, writing actions,
the latest essay and the owner's portrait. Engineering biography and current-work
evidence follow as their own spread. Writing has a large lead essay and an ordered
command trace, followed by two editorial rows. A single dark studio plane showcases
Kelvanic and Deckle's real native UI, followed by three books and a contact footer.

The original Bricolage Grotesque / Spline Sans Mono pairing is retained through
`next/font`. No ticker, ambient glow, rotated portrait, giant watermark, or
load-blocking entrance remains. Content is visible immediately and without JS.

## Implementation map

| Concern | Source |
|---|---|
| Semantic light/dark/print tokens, spacing and homepage type scale | `tokens.css` |
| Tailwind aliases, article, print and shared utilities | `globals.css` |
| Base access, focus, overflow and typography rules | `base.css` |
| Shared chrome, inner-page composition and responsive rules | `portfolio.css` |
| Scoped Hallmark homepage composition | `homepage.css` |
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
- At mobile widths, the introduction names CBA's AI developer platform and its
  existing 200+ engineer adoption figure; this evidence, the writing action and
  latest essay precede the portrait. Full biography and work details remain visible
  below it. The studio collapses to a single column.
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
- The reading room uses 50-entry server-rendered archive pages, real pagination
  links, and global source/keyword search through a GET form. Search and source
  filtering work without JavaScript; the entire collection is never serialized
  into a client component.
- Motion is limited to restrained hover transforms, with existing reduced-motion
  overrides. `Reveal` remains a server-rendered compatibility wrapper, not an
  IntersectionObserver gate.
- Homepage typography uses `--text-home-*` steps; section grids share `--home-gap`.
  The palette's original light and dark values are retained in `tokens.css`; print
  uses a near-white drafting-paper token with dark text. Superseded homepage rules
  were consolidated rather than left beneath competing overrides.
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
`npm run design-check -- <base-url>`, `npm run ui-check -- <base-url>` and
`npm run seo-check -- <base-url>`. Pure content/pagination checks are available
through `npm run seo-unit-check`. Browser suites use an existing Playwright installation through
`PLAYWRIGHT_PATH` if it is not installed locally; Playwright is not added to
production dependencies. Screenshots are written into the ignored
`.design-review/redesign/` directory.

The automated checks are regression evidence, not a full manual screen-reader
accessibility certification. The Docker runner explicitly includes the committed
feed snapshot for request-time search. No hosting settings are changed and these
local changes do not deploy the site.

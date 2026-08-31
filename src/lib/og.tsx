import fs from "node:fs";
import path from "node:path";
import type { ReactElement } from "react";
import { site } from "@/lib/site";

/**
 * Shared social-card design.
 *
 * Open Graph cards are the most-shared artifact this site produces: in a
 * timeline or a Slack unfurl the card *is* the site. So it uses the same ink
 * plane, ember hearth and typography as the pages rather than a system font on
 * a flat rectangle.
 *
 * Fonts are vendored into `src/app/_og-fonts` and read from disk. Satori
 * cannot use WOFF2 (which is all `next/font` produces), and fetching from
 * Google at build time would put the network on the build path, which this
 * project deliberately keeps clean.
 */

export const OG_SIZE = { width: 1200, height: 630 } as const;

const FONT_DIR = path.join(process.cwd(), "src", "app", "_og-fonts");

let cachedFonts: OgFont[] | null = null;

type OgFont = {
  name: string;
  data: Buffer;
  weight: 400 | 700;
  style: "normal";
};

export function ogFonts(): OgFont[] {
  cachedFonts ??= [
    {
      name: "Bricolage Grotesque",
      data: fs.readFileSync(path.join(FONT_DIR, "BricolageGrotesque-Bold.ttf")),
      weight: 700 as const,
      style: "normal" as const,
    },
    {
      name: "Spline Sans Mono",
      data: fs.readFileSync(path.join(FONT_DIR, "SplineSansMono-Regular.ttf")),
      weight: 400 as const,
      style: "normal" as const,
    },
  ];
  return cachedFonts;
}

// Ember & Ink, resolved to plain sRGB: Satori has no CSS variables and no
// oklch(). These mirror the dark-theme tokens in globals.css.
const ink = "#231c17";
const inkDeep = "#1a1512";
const paper = "#f3ece2";
const ember = "#e08a3c";
const emberDeep = "#8a3d12";
const quiet = "#a2938a";

/** The ember spark, the site's brand mark, drawn for Satori. */
function Spark({ size = 26, color = ember }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2L12 2z" />
    </svg>
  );
}

/**
 * One card layout for every route: a mono eyebrow, a big display line, and a
 * mono footer rule. Callers vary the words, not the composition, so a shared
 * link is recognisable as this site whatever page it points at.
 */
export function OgCard({
  eyebrow,
  title,
  footerLeft,
  footerRight = site.name,
  titleSize = 84,
}: {
  eyebrow: string;
  title: string;
  footerLeft?: string;
  footerRight?: string;
  /** Drop for long titles so they still fit three lines. */
  titleSize?: number;
}): ReactElement {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: `radial-gradient(900px 620px at 100% 115%, ${emberDeep} 0%, transparent 62%), ${ink}`,
        color: paper,
        fontFamily: "Bricolage Grotesque",
        position: "relative",
      }}
    >
      {/* Corner ticks, the same framing device the portrait uses on the site. */}
      <div
        style={{
          position: "absolute",
          top: 36,
          right: 36,
          width: 40,
          height: 40,
          borderTop: `3px solid ${ember}`,
          borderRight: `3px solid ${ember}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 36,
          left: 36,
          width: 40,
          height: 40,
          borderBottom: `3px solid ${ember}`,
          borderLeft: `3px solid ${ember}`,
        }}
      />

      {/* Eyebrow */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <Spark />
        <span
          style={{
            fontFamily: "Spline Sans Mono",
            fontSize: 24,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: quiet,
          }}
        >
          {eyebrow}
        </span>
      </div>

      {/* Statement */}
      <div
        style={{
          display: "flex",
          fontSize: titleSize,
          fontWeight: 700,
          letterSpacing: "-0.035em",
          lineHeight: 1.04,
          maxWidth: 1000,
        }}
      >
        {title}
      </div>

      {/* Footer rule */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", height: 1, background: inkDeep }} />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "Spline Sans Mono",
            fontSize: 24,
            color: quiet,
          }}
        >
          <span>{footerLeft ?? site.url.replace(/^https?:\/\//, "")}</span>
          <span style={{ color: ember }}>{footerRight}</span>
        </div>
      </div>
    </div>
  );
}

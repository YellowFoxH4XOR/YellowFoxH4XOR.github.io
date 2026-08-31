import { ImageResponse } from "next/og";
import { site } from "@/lib/site";
import { OgCard, OG_SIZE, ogFonts } from "@/lib/og";

// Default social/preview card for the site (1200×630), generated at build time.
export const alt = `${site.name} — ${site.role}`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <OgCard
        eyebrow={site.role}
        title="I build the pipes AI products run on."
        footerLeft={site.url.replace(/^https?:\/\//, "")}
        footerRight={site.name}
      />
    ),
    { ...size, fonts: ogFonts() },
  );
}

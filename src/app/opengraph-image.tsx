import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

// Default social/preview card for the site (1200×630), generated at build time.
export const alt = `${site.name} — ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background:
            "radial-gradient(1000px 600px at 80% -10%, #7c3a0e 0%, transparent 60%), #171310",
          color: "#f5efe6",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 30, color: "#eda35c" }}>
          {site.url.replace("https://", "")}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 96,
            fontWeight: 700,
            marginTop: 24,
            letterSpacing: "-0.03em",
          }}
        >
          {site.name}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 40,
            marginTop: 16,
            color: "#eda35c",
          }}
        >
          {site.role}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 28,
            marginTop: 40,
            color: "#b8a99a",
            maxWidth: 900,
          }}
        >
          {site.description}
        </div>
      </div>
    ),
    { ...size },
  );
}

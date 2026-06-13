import { ImageResponse } from "next/og";
import { site } from "@/lib/site";
import { getAllPosts, getPostBySlug, formatDate } from "@/lib/blog";

// Per-post social/preview card. One image is prebuilt per post (SSG).
export const alt = "Blog post";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export default async function PostOgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  const title = post?.title ?? "Blog";
  const meta = post ? `${formatDate(post.date)} · ${post.readingTime}` : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "80px",
          background:
            "radial-gradient(1000px 600px at 80% -10%, #4c1d95 0%, transparent 60%), #0a0a0f",
          color: "#fafafa",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, color: "#a78bfa" }}>
          {site.url.replace("https://", "")}/blog
        </div>
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 28,
            color: "#a1a1aa",
          }}
        >
          <span>{meta}</span>
          <span style={{ color: "#c4b5fd" }}>{site.name}</span>
        </div>
      </div>
    ),
    { ...size },
  );
}

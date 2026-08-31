import { ImageResponse } from "next/og";
import { site } from "@/lib/site";
import { getAllPosts, getPostBySlug, formatDate } from "@/lib/blog";
import { OgCard, OG_SIZE, ogFonts } from "@/lib/og";

// Per-post social/preview card. One image is prebuilt per post (SSG).
export const alt = "Blog post";
export const size = OG_SIZE;
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

  // Step the display size down as titles get longer, so a long headline still
  // lands inside three lines instead of overflowing the card.
  const titleSize = title.length > 68 ? 56 : title.length > 44 ? 66 : 78;

  return new ImageResponse(
    (
      <OgCard
        eyebrow="Writing"
        title={title}
        titleSize={titleSize}
        footerLeft={
          post ? `${formatDate(post.date)} · ${post.readingTime}` : undefined
        }
        footerRight={site.name}
      />
    ),
    { ...size, fonts: ogFonts() },
  );
}

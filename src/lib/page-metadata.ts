import type { Metadata } from "next";
import { site } from "@/lib/site";

// Next replaces alternates as a whole when a page supplies its canonical.
// Include RSS here too so inner pages retain feed auto-discovery.
export function pageAlternates(path: string) {
  return {
    canonical: path,
    types: { "application/rss+xml": [{ url: "/feed.xml", title: `${site.name} — Blog` }] },
  };
}

// Metadata objects are replaced rather than deep-merged by Next.js, so each
// page needs its own social title, description, and URL as well as a canonical.
export function pageMetadata(title: string, description: string, path: string): Metadata {
  const socialTitle = `${title} | ${site.name}`;
  return {
    title,
    description,
    alternates: pageAlternates(path),
    openGraph: {
      title: socialTitle,
      description,
      url: `${site.url}${path}`,
      siteName: site.name,
      locale: site.locale,
      type: "website",
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: `${site.name} — ${site.role}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      creator: site.twitterHandle,
      images: ["/opengraph-image"],
    },
  };
}

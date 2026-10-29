import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { getAllPosts } from "@/lib/blog";
import { getAllTechBlogs } from "@/lib/tech-blogs";
import { techBlogArchivePath, techBlogPageCount } from "@/lib/tech-blog-pagination";

// Generated at /sitemap.xml. Lists every static route plus one entry per blog
// post so crawlers can discover new posts. Do not claim a modification date
// unless the content model tracks actual edits.
export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: site.url, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/blog`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${site.url}/tech-blogs`, changeFrequency: "daily", priority: 0.8 },
    { url: `${site.url}/bookshelf`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${site.url}/resume`, changeFrequency: "monthly", priority: 0.7 },
  ];

  const postRoutes: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${site.url}/blog/${post.slug}`,
    changeFrequency: "yearly",
    priority: 0.8,
  }));

  const archiveRoutes = Array.from({ length: techBlogPageCount(getAllTechBlogs().length) - 1 }, (_, index) => ({
    url: `${site.url}${techBlogArchivePath(index + 2)}`,
    changeFrequency: "daily" as const,
  }));

  return [...staticRoutes, ...postRoutes, ...archiveRoutes];
}

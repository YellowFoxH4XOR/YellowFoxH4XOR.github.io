import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { validatePostFrontmatter } from "@/lib/post-frontmatter";

// Blog posts live as markdown files in /content/blog. Push a new .md file to
// GitHub, Coolify rebuilds, and the post is statically generated. No DB.
const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export type PostMeta = {
  slug: string;
  title: string;
  date: string; // ISO string, e.g. "2026-06-13"
  excerpt: string;
  tags: string[];
  readingTime: string;
};

export type Post = PostMeta & {
  content: string;
};

function readingTime(text: string): string {
  const words = text.trim().split(/\s+/).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

function getSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  const slugs = fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx?$/, ""));
  if (new Set(slugs).size !== slugs.length) throw new Error("Duplicate blog slug: keep only one .md or .mdx file per article.");
  if (slugs.some((slug) => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))) throw new Error("Blog filenames must use lowercase letters, numbers, and single hyphens.");
  return slugs;
}

export function getPostBySlug(slug: string): Post | null {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
  const mdPath = path.join(BLOG_DIR, `${slug}.md`);
  const mdxPath = path.join(BLOG_DIR, `${slug}.mdx`);
  const filePath = fs.existsSync(mdPath) ? mdPath : mdxPath;
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  // A draft frontmatter flag keeps a post out of production builds.
  if (data.draft && process.env.NODE_ENV === "production") return null;
  const metadata = validatePostFrontmatter(data, slug);

  return {
    slug,
    ...metadata,
    readingTime: readingTime(content),
    content,
  };
}

export function getAllPosts(): PostMeta[] {
  return getSlugs()
    .map((slug) => getPostBySlug(slug))
    .filter((p): p is Post => p !== null)
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug))
    .map(
      ({ slug, title, date, excerpt, tags, readingTime }): PostMeta => ({
        slug,
        title,
        date,
        excerpt,
        tags,
        readingTime,
      }),
    );
}

// Re-exported from utils (node-free) so client components can use it without
// pulling this module's `node:fs` import into the client bundle.
export { formatDate } from "@/lib/utils";

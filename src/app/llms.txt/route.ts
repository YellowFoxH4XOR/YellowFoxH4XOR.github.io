import { site } from "@/lib/site";
import { getAllPosts } from "@/lib/blog";

// /llms.txt — the llmstxt.org convention: a concise, curated, markdown summary
// of the site for LLM answer engines (Perplexity, ChatGPT, Claude, etc.) so
// they can ingest the most relevant content without crawling/guessing.
export const dynamic = "force-static";

export function GET() {
  const posts = getAllPosts();

  const blogList = posts
    .map((p) => `- [${p.title}](${site.url}/blog/${p.slug}): ${p.excerpt}`)
    .join("\n");

  const body = `# ${site.name}

> ${site.description}

${site.intro}

- Role: ${site.jobTitle} at ${site.worksFor}
- Founder of ${site.studio.name}, an independent software studio: ${site.studio.url}
- Primary skills: ${site.keywords.join(", ")}
- Links: ${site.sameAs.join(" | ")}

## Pages
- [Home](${site.url}/): Intro and latest writing.
- [Blog](${site.url}/blog): Articles on engineering and systems.
- [Tech Blogs](${site.url}/tech-blogs): Paginated reading room of external engineering posts and AI research, aggregated from feeds with short excerpts and links to the originals. Follow the page links to browse the archive.
- [Reading room search](${site.url}/tech-blogs/search): GET search across the full archive using q (keyword) and source (source slug), with page for additional results.
- [Bookshelf](${site.url}/bookshelf): Books that shaped my thinking.
- [Resume](${site.url}/resume): Experience and skills.

## Blog posts
${blogList}

## Feeds
- RSS: ${site.url}/feed.xml
- Sitemap: ${site.url}/sitemap.xml
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

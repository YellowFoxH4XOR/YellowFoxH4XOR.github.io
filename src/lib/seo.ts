// Builders for schema.org JSON-LD. Structured data is the single biggest lever
// for letting search engines and AI answer engines understand *what* this site
// is (a person, their writing) rather than guessing from prose.
import { site } from "@/lib/site";
import type { PostMeta } from "@/lib/blog";
import type { TechBlogEntry } from "@/lib/tech-blogs";
import { experience, education, skillGroups, books } from "@/lib/content";

// Stable @id anchors. Giving the Person and WebSite one canonical id each lets
// engines reconcile every mention across pages into a single entity instead of
// treating each page's inline copy as a separate, unrelated node.
const PERSON_ID = `${site.url}/#person`;
const WEBSITE_ID = `${site.url}/#website`;

// A lightweight reference to the canonical Person node. Used in author/publisher
// slots so they point at the full Person (defined on the home page / resume)
// rather than duplicating it everywhere.
function personRef() {
  return { "@type": "Person", "@id": PERSON_ID, name: site.name, url: site.url };
}

export function personSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": PERSON_ID,
    name: site.name,
    url: site.url,
    image: `${site.url}/images/profile.jpg`,
    jobTitle: site.jobTitle,
    worksFor: { "@type": "Organization", name: site.worksFor },
    affiliation: { "@type": "Organization", "@id": site.studio.id, name: site.studio.name, url: site.studio.url },
    description: site.description,
    sameAs: site.sameAs,
    // Topics, not the person's own name.
    knowsAbout: site.keywords.filter((keyword) => keyword !== site.name),
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: site.name,
    url: site.url,
    description: site.description,
    inLanguage: "en",
    author: personRef(),
    publisher: personRef(),
  };
}

export function blogPostingSchema(post: PostMeta) {
  const postUrl = `${site.url}/blog/${post.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    url: postUrl,
    mainEntityOfPage: { "@type": "WebPage", "@id": postUrl },
    image: `${postUrl}/opengraph-image`,
    keywords: post.tags.join(", "),
    inLanguage: "en",
    isPartOf: { "@id": WEBSITE_ID },
    author: personRef(),
    publisher: personRef(),
  };
}

// /blog index — a Blog node listing every post so an engine can enumerate the
// writing without crawling each URL, and link it to the canonical author.
export function blogSchema(posts: PostMeta[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${site.url}/blog#blog`,
    name: `${site.name} — Blog`,
    url: `${site.url}/blog`,
    description: "Writing about engineering, systems, and what I'm learning.",
    inLanguage: "en",
    isPartOf: { "@id": WEBSITE_ID },
    author: personRef(),
    publisher: personRef(),
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt,
      url: `${site.url}/blog/${post.slug}`,
      datePublished: post.date,
      keywords: post.tags.join(", "),
    })),
  };
}

// /resume — a ProfilePage whose mainEntity is the canonical Person, enriched
// with employment history, education, and skills. This is what lets an agent
// answer "what is Akshat's experience / background" structurally.
export function resumeSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: `${site.url}/resume`,
    mainEntity: {
      "@type": "Person",
      "@id": PERSON_ID,
      name: site.name,
      url: site.url,
      image: `${site.url}/images/profile.jpg`,
      jobTitle: site.jobTitle,
      description: site.description,
      sameAs: site.sameAs,
      worksFor: { "@type": "Organization", name: site.worksFor },
      knowsAbout: skillGroups.flatMap((g) => g.items),
      alumniOf: education.map((e) => ({
        "@type": "EducationalOrganization",
        name: e.school,
      })),
      // Each past role as an Occupation. Title, employer, and period are folded
      // into the name (Occupation has no employer field) with the highlights as
      // the description — enough for an engine to summarise the work history.
      hasOccupation: experience.map((job) => ({
        "@type": "Occupation",
        name: `${job.title} · ${job.company} (${job.period})`,
        description: job.highlights.join(" "),
      })),
    },
  };
}

// /bookshelf — an ordered ItemList of Books so an engine can answer "what books
// does Akshat recommend" without scraping the card layout.
export function bookshelfSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${site.name} — Bookshelf`,
    url: `${site.url}/bookshelf`,
    numberOfItems: books.length,
    itemListElement: books.map((book, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Book",
        name: book.title,
        author: { "@type": "Person", name: book.author },
        image: `${site.url}${book.cover}`,
        description: book.description,
      },
    })),
  };
}

// /tech-blogs — a CollectionPage curating external engineering-blog articles.
// We are the maintainer (curator), not the author, and each item's publisher is
// the originating company — so the markup never falsely claims authorship. Cap
// the ItemList at 50 to keep the inline JSON-LD block lean.
export function techBlogsCollectionSchema(entries: TechBlogEntry[]) {
  const pageUrl = `${site.url}/tech-blogs`;
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${pageUrl}#collection`,
    name: `${site.name} — Tech Blogs`,
    url: pageUrl,
    description:
      "A curated aggregation of recent posts from big-tech engineering blogs, linked to the original sources.",
    inLanguage: "en",
    isPartOf: { "@id": WEBSITE_ID },
    maintainer: personRef(),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: entries.length,
      itemListElement: entries.slice(0, 50).map((entry, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Article",
          headline: entry.title,
          url: entry.url,
          datePublished: entry.date,
          publisher: { "@type": "Organization", name: entry.company },
        },
      })),
    },
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

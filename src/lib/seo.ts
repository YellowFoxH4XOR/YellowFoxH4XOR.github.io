// Builders for schema.org JSON-LD. Structured data is the single biggest lever
// for letting search engines and AI answer engines understand *what* this site
// is (a person, their writing) rather than guessing from prose.
import { site } from "@/lib/site";
import type { PostMeta } from "@/lib/blog";

export function personSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    url: site.url,
    image: `${site.url}/images/profile.jpg`,
    jobTitle: site.jobTitle,
    worksFor: { "@type": "Organization", name: site.worksFor },
    description: site.description,
    sameAs: site.sameAs,
    knowsAbout: site.keywords,
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.url,
    description: site.description,
    inLanguage: "en",
    author: { "@type": "Person", name: site.name, url: site.url },
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
    author: {
      "@type": "Person",
      name: site.name,
      url: site.url,
    },
    publisher: {
      "@type": "Person",
      name: site.name,
      url: site.url,
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

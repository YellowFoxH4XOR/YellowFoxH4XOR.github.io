// Single source of truth for site-wide metadata, navigation, and social links.
// Edit here once instead of touching every page (the old static site duplicated
// this across three HTML files).

export const site = {
  name: "Akshat Katiyar",
  role: "Senior Backend Engineer",
  // Used for absolute URLs in metadata / Open Graph. Override in prod via env.
  // This must match the host the site is actually served on (canonical domain).
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://site.akshatkatiyar.com",
  description:
    "Senior Backend Engineer with 7+ years building production Python and Go services, REST APIs, and GenAI products (RAG, LLM agents). Writing about engineering, systems, and the books I read.",
  intro:
    "I'm a Senior Backend Engineer with 7+ years building production Python and Go services, REST APIs, and PostgreSQL-backed platforms end to end. Lately I build GenAI products — RAG pipelines, LLM agents, and model routing — alongside DevOps and full-stack delivery. Currently at Commonwealth Bank (CBA India).",
  greeting: "Hey, I'm Akshat",

  // SEO / structured-data fields.
  locale: "en_US",
  twitterHandle: "@yellowfox_h4xor",
  email: "abhisidds@gmail.com",
  jobTitle: "Senior Backend Engineer",
  worksFor: "Commonwealth Bank (CBA India)",
  // Profiles that establish identity for search/AI engines (schema.org sameAs).
  sameAs: [
    "https://github.com/YellowFoxH4XOR",
    "https://www.linkedin.com/in/akshat-katiyar/",
    "https://x.com/yellowfox_h4xor",
  ],
  keywords: [
    "Akshat Katiyar",
    "senior backend engineer",
    "backend engineer",
    "GenAI engineer",
    "Python",
    "Go",
    "FastAPI",
    "RAG",
    "LLM",
    "LangChain",
    "distributed systems",
    "engineering blog",
  ],
} as const;

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/tech-blogs", label: "Tech Blogs" },
  { href: "/bookshelf", label: "Bookshelf" },
  { href: "/resume", label: "Resume" },
] as const;

export const socialLinks = [
  { label: "Newsletter", href: "/feed.xml", icon: "newsletter" },
  { label: "Twitter", href: "https://x.com/yellowfox_h4xor", icon: "twitter" },
  { label: "GitHub", href: "https://github.com/YellowFoxH4XOR", icon: "github" },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/akshat-katiyar/",
    icon: "linkedin",
  },
] as const;

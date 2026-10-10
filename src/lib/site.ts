// Single source of truth for site-wide metadata, navigation, and social links.
// Edit here once instead of touching every page (the old static site duplicated
// this across three HTML files).

export const site = {
  name: "Akshat Katiyar",
  role: "Senior Platform Engineer",
  // Used for absolute URLs in metadata / Open Graph. Override in prod via env.
  // This must match the host the site is actually served on (canonical domain).
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://akshatkatiyar.com",
  description:
    "Senior platform engineer with 7+ years building developer infrastructure, automation, and distributed backend systems in Python and Go. Writing about engineering, systems, and the books I read.",
  intro:
    "I'm a senior platform engineer with 7+ years building developer infrastructure, automation, and distributed backend systems in Python and Go. At Commonwealth Bank I built the internal AI developer platform — coding-agent workspaces, MCP integrations, an LLM compatibility gateway, and evaluation telemetry — now used by 200+ engineers.",
  greeting: "Hey, I'm Akshat",

  // SEO / structured-data fields.
  locale: "en_US",
  twitterHandle: "@yellowfox_h4xor",
  email: "akshatkatiyar4@gmail.com",
  jobTitle: "Senior Platform Engineer",
  worksFor: "Commonwealth Bank of Australia (CBA India)",
  // The software studio Akshat founded; kelvanic.com names him as founder with
  // this site's Person @id, so search engines connect the two entities.
  studio: {
    name: "Kelvanic",
    url: "https://kelvanic.com/",
    id: "https://kelvanic.com/#organization",
  },
  // Other profiles of this same person (schema.org sameAs).
  sameAs: [
    "https://github.com/YellowFoxH4XOR",
    "https://www.linkedin.com/in/akshat-katiyar/",
    "https://x.com/yellowfox_h4xor",
  ],
  keywords: [
    "Akshat Katiyar",
    "senior platform engineer",
    "developer infrastructure",
    "AI developer platform",
    "backend engineer",
    "Python",
    "Go",
    "FastAPI",
    "MCP",
    "LLM gateway",
    "LangGraph",
    "distributed systems",
    "engineering blog",
  ],
} as const;

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/bookshelf", label: "Bookshelf" },
  { href: "/resume", label: "Resume" },
  { href: "/tech-blogs", label: "Tech Blogs" },
  // External: projects live on the Kelvanic studio site.
  { href: "https://kelvanic.com/", label: "Projects" },
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

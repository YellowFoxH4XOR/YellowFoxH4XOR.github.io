// Single source of truth for site-wide metadata, navigation, and social links.
// Edit here once instead of touching every page (the old static site duplicated
// this across three HTML files).

export const site = {
  name: "Akshat Katiyar",
  role: "Software Engineer",
  // Used for absolute URLs in metadata / Open Graph. Override in prod via env.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.akshatkatiyar.com",
  description:
    "Full-stack engineer focused on building and optimizing software systems. Writing about engineering, systems, and the books I read.",
  intro:
    "I'm a full-stack developer focused on building and optimizing software systems. I primarily work with Python and Go. Currently part of the team at Commonwealth Bank of Australia, contributing across the tech stack.",
  greeting: "Hey, I'm Akshat",
} as const;

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/bookshelf", label: "Bookshelf" },
  { href: "/resume", label: "Resume" },
] as const;

export const socialLinks = [
  { label: "Newsletter", href: "#", icon: "newsletter" },
  { label: "Twitter", href: "https://x.com/yellowfox_h4xor", icon: "twitter" },
  { label: "GitHub", href: "https://github.com/YellowFoxH4XOR", icon: "github" },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/akshat-katiyar/",
    icon: "linkedin",
  },
] as const;

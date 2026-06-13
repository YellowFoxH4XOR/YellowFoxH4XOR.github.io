import Link from "next/link";
import { Rss } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { site, navLinks, socialLinks } from "@/lib/site";
import { GithubIcon, LinkedinIcon, XIcon } from "@/components/icons";

type IconCmp = ComponentType<SVGProps<SVGSVGElement>>;

const icons: Record<string, IconCmp> = {
  github: GithubIcon,
  linkedin: LinkedinIcon,
  twitter: XIcon,
  newsletter: Rss,
};

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border/40">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-6 py-10 text-sm text-muted-foreground sm:flex-row sm:justify-between">
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {socialLinks.map((link) => {
            const Icon = icons[link.icon] ?? Rss;
            const external = link.href.startsWith("http");
            return (
              <a
                key={link.label}
                href={link.href}
                aria-label={link.label}
                {...(external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="text-muted-foreground transition-colors hover:text-brand"
              >
                <Icon className="size-[18px]" />
              </a>
            );
          })}
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl px-6 pb-10 text-center text-xs text-muted-foreground/70 sm:text-left">
        © {new Date().getFullYear()} {site.name}. All rights reserved.
      </div>
    </footer>
  );
}

import { ArrowUpRight, Rss } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { site, navLinks, socialLinks } from "@/lib/site";
import { GithubIcon, LinkedinIcon, XIcon, SparkIcon } from "@/components/icons";

type IconCmp = ComponentType<SVGProps<SVGSVGElement>>;

const icons: Record<string, IconCmp> = {
  github: GithubIcon,
  linkedin: LinkedinIcon,
  twitter: XIcon,
  newsletter: Rss,
};

export function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-border/70">
      <div className="mx-auto w-full max-w-6xl px-6 pb-12 pt-14 lg:px-8">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          {/* Identity */}
          <div>
            <p className="flex items-center gap-2.5">
              <SparkIcon className="size-4 text-brand" />
              <span className="font-semibold tracking-tight">{site.name}</span>
            </p>
            <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
              {site.role}. Writing about engineering, systems, and the books I
              read.
            </p>
            <a
              href={`mailto:${site.email}`}
              className="mt-3 inline-block font-mono text-xs text-muted-foreground link-ember hover:text-foreground"
            >
              {site.email}
            </a>
          </div>

          {/* Site map */}
          <nav aria-label="Footer" className="flex flex-col gap-2.5">
            <p className="eyebrow mb-1">Pages</p>
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                {...(link.href.startsWith("http")
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="w-fit font-mono text-xs text-muted-foreground transition-colors hover:text-brand"
              >
                <span className="inline-flex items-center gap-1.5">
                  {link.label}
                  {link.href.startsWith("http") && (
                    <ArrowUpRight aria-hidden className="size-3" />
                  )}
                </span>
              </a>
            ))}
          </nav>

          {/* Social */}
          <div className="flex flex-col gap-2.5">
            <p className="eyebrow mb-1">Profiles</p>
            {socialLinks.map((link) => {
              const Icon = icons[link.icon] ?? Rss;
              const external = link.href.startsWith("http");
              return (
                <a
                  key={link.label}
                  href={link.href}
                  {...(external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="group flex w-fit items-center gap-2.5 font-mono text-xs text-muted-foreground transition-colors hover:text-brand"
                >
                  <Icon className="size-3.5 transition-colors group-hover:text-brand" />
                  {link.label}
                </a>
              );
            })}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <p className="font-mono text-[11px] tracking-wider text-muted-foreground/70">
            Built with Next.js · Set in Bricolage Grotesque
          </p>
        </div>
      </div>

      {/* Watermark */}
      <div
        aria-hidden
        className="pointer-events-none select-none text-center font-bold leading-[0.72] tracking-[-0.04em] text-foreground/[0.045] dark:text-foreground/[0.05]"
        style={{ fontSize: "clamp(4rem, 17vw, 15rem)" }}
      >
        akshat
      </div>
    </footer>
  );
}

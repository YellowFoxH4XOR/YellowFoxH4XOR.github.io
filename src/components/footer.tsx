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
    <footer className="relative mt-[var(--space-block)] overflow-hidden border-t border-hairline">
      <div className="mx-auto w-full max-w-6xl px-6 pb-10 pt-14 lg:px-8">
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
              className="mt-2 inline-block py-1.5 font-mono text-meta text-muted-foreground link-ember hover:text-foreground"
            >
              {site.email}
            </a>
          </div>

          {/* Site map */}
          <nav aria-label="Footer" className="flex flex-col gap-0.5">
            <p className="eyebrow mb-2">Pages</p>
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                {...(link.href.startsWith("http")
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="w-fit py-1.5 font-mono text-meta text-muted-foreground transition-colors duration-200 hover:text-brand"
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
          <div className="flex flex-col gap-0.5">
            <p className="eyebrow mb-2">Profiles</p>
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
                  className="group flex w-fit items-center gap-2.5 py-1.5 font-mono text-meta text-muted-foreground transition-colors duration-200 hover:text-brand"
                >
                  <Icon className="size-3.5 transition-colors duration-200 group-hover:text-brand" />
                  {link.label}
                </a>
              );
            })}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-hairline pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <p className="font-mono text-micro tracking-wider text-subtle">
            Next.js · Tailwind · set in Bricolage Grotesque &amp; Spline Sans
            Mono
          </p>
        </div>
      </div>

      {/* Watermark. The name is meant to run off the bottom of the page, so it
          is masked to dissolve rather than stopped mid-stroke by the viewport
          edge, which reads as a rendering accident. */}
      <div
        aria-hidden
        className="pointer-events-none -mb-[3vw] select-none text-center font-bold leading-[0.78] tracking-[-0.045em] text-foreground/[0.05] [mask-image:linear-gradient(to_bottom,black_35%,transparent_92%)] dark:text-foreground/[0.055]"
        style={{ fontSize: "clamp(4rem, 17vw, 15rem)" }}
      >
        akshat
      </div>
    </footer>
  );
}

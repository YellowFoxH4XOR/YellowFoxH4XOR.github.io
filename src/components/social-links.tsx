import { Rss } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { socialLinks } from "@/lib/site";
import { GithubIcon, LinkedinIcon, XIcon } from "@/components/icons";

type IconCmp = ComponentType<SVGProps<SVGSVGElement>>;

const icons: Record<string, IconCmp> = {
  github: GithubIcon,
  linkedin: LinkedinIcon,
  twitter: XIcon,
  newsletter: Rss,
};

// Outbound profiles as mono pills: hairline border, ember icon on hover.
export function SocialLinks() {
  return (
    <div className="flex flex-wrap gap-2.5">
      {socialLinks.map((link) => {
        const Icon = icons[link.icon] ?? Rss;
        return (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-full border border-hairline px-4 py-2 font-mono text-micro font-medium uppercase tracking-[0.15em] text-muted-foreground transition-all duration-200 ease-[cubic-bezier(0.25,1,0.5,1)] hover:-translate-y-0.5 hover:border-brand/60 hover:text-foreground"
          >
            <Icon className="size-3.5 transition-colors duration-200 group-hover:text-brand" />
            {link.label}
          </a>
        );
      })}
    </div>
  );
}

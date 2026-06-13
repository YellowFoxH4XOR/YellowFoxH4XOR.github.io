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
            className="group inline-flex items-center gap-2 rounded-xl glass-card px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <Icon className="size-4 transition-colors group-hover:text-brand" />
            {link.label}
          </a>
        );
      })}
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { navLinks, site } from "@/lib/site";
import { ThemeToggle } from "@/components/theme-toggle";
import { SparkIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);

  // Auto-hide on scroll down, reveal on scroll up (always shown near the top).
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y < 80 || y < lastY) {
        setHidden(false);
      } else if (y > lastY + 4) {
        setHidden(true);
        setOpen(false);
      }
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border/70 bg-background/85 backdrop-blur-md transition-transform duration-500 will-change-transform supports-[backdrop-filter]:bg-background/70",
        hidden && !open ? "-translate-y-full" : "translate-y-0",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6 lg:px-8">
        {/* Wordmark */}
        <Link
          href="/"
          className="group flex items-center gap-2.5"
          aria-label={`${site.name}, home`}
        >
          <SparkIcon className="size-4 text-brand transition-transform duration-500 group-hover:rotate-90" />
          <span className="font-mono text-sm font-semibold tracking-tight">
            akshat<span className="text-brand">.</span>katiyar
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 sm:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={cn(
                "group relative font-mono text-[11px] font-medium uppercase tracking-[0.2em] transition-colors duration-300",
                isActive(link.href)
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="flex items-center gap-1.5">
                <span
                  aria-hidden
                  className={cn(
                    "size-1 rounded-full bg-brand transition-all duration-300",
                    isActive(link.href)
                      ? "scale-100 opacity-100"
                      : "scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-60",
                  )}
                />
                {link.label}
              </span>
            </Link>
          ))}
          <ThemeToggle />
        </nav>

        {/* Mobile: trigger + theme */}
        <div className="flex items-center gap-1 sm:hidden">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle navigation"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="border-t border-border/60 px-6 py-4 sm:hidden">
          {navLinks.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              style={{ animationDelay: `${i * 50}ms` }}
              className={cn(
                "flex items-center gap-3 rounded-md px-2 py-2.5 font-mono text-xs font-medium uppercase tracking-[0.2em] opacity-0 animate-fade-in-up",
                isActive(link.href)
                  ? "text-brand"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "size-1 rounded-full",
                  isActive(link.href) ? "bg-brand" : "bg-border",
                )}
              />
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

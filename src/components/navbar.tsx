"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { navLinks, site } from "@/lib/site";
import { ThemeToggle } from "@/components/theme-toggle";
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

  // A link is active for an exact match, or when the current path is nested
  // under it (e.g. /blog/my-post highlights the "Blog" tab) — but never treat
  // "/" as a prefix of everything.
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={cn(
        "sticky top-4 z-50 mx-auto w-full max-w-3xl px-4 sm:px-6 transition-transform duration-300 will-change-transform",
        // Auto-hide: slide fully out of view when scrolling down (kept visible
        // while the mobile menu is open).
        hidden && !open ? "-translate-y-[150%]" : "translate-y-0",
      )}
    >
      <div
        className={cn(
          // Opaque-enough background (with a fallback for browsers that skip
          // backdrop-blur) so scrolled content doesn't bleed through. Only
          // border-radius/shadow transition — animating blur/size is janky on phones.
          "flex flex-col justify-center px-6 border border-border/60 bg-background/90 backdrop-blur-md shadow-lg hover:shadow-xl hover:border-brand/40 supports-[backdrop-filter]:bg-background/70",
          open ? "rounded-3xl h-auto py-4 gap-4" : "rounded-full h-14"
        )}
      >
        <div className="flex items-center justify-between w-full">
          <Link
            href="/"
            className="group font-mono text-sm font-semibold tracking-tight transition-all duration-300 hover:scale-[1.03] flex items-center"
            onClick={() => setOpen(false)}
          >
            <span className="transition-all duration-300 group-hover:text-gradient-brand">
              {site.name.toLowerCase().replace(" ", "_")}
            </span>
            <span className="text-brand">.dev</span>
          </Link>

          <div className="flex items-center gap-1.5">
            <nav className="hidden items-center gap-1 sm:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group relative px-3 py-1.5 text-sm font-medium transition-all duration-300 hover:scale-105"
                >
                  <span
                    className={cn(
                      "relative z-10 transition-colors duration-300",
                      isActive(link.href)
                        ? "text-brand"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  >
                    {link.label}
                  </span>
                  <span
                    className={cn(
                      "absolute inset-x-3 -bottom-0.5 h-[2px] rounded-full bg-brand transition-all duration-300 origin-center",
                      isActive(link.href)
                        ? "scale-x-100 opacity-100 shadow-[0_0_8px_var(--color-brand)]"
                        : "scale-x-0 opacity-0 group-hover:scale-x-75 group-hover:opacity-50"
                    )}
                  />
                </Link>
              ))}
            </nav>

            <ThemeToggle />

            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden rounded-full hover:bg-muted/60 size-9"
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
          <nav className="flex flex-col gap-1 border-t border-border/40 pt-3 sm:hidden">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "block rounded-lg px-3 py-2 text-sm font-medium",
                  isActive(link.href)
                    ? "text-brand bg-brand/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}

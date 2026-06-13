"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { navLinks } from "@/lib/site";
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

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={cn(
        // Full-width bar. Opaque background with a fallback for browsers that
        // skip backdrop-blur so scrolled content can't bleed through.
        "sticky top-0 z-50 w-full border-b border-border/60 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/70 transition-transform duration-300 will-change-transform",
        hidden && !open ? "-translate-y-full" : "translate-y-0",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6 lg:px-8">
        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 sm:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative px-3 py-2 text-sm font-medium"
            >
              <span
                className={cn(
                  "relative z-10 transition-colors",
                  isActive(link.href)
                    ? "text-brand"
                    : "text-muted-foreground group-hover:text-foreground",
                )}
              >
                {link.label}
              </span>
              <span
                className={cn(
                  "absolute inset-x-3 -bottom-0.5 h-[2px] rounded-full bg-brand transition-transform duration-300 origin-center",
                  isActive(link.href)
                    ? "scale-x-100 shadow-[0_0_8px_var(--color-brand)]"
                    : "scale-x-0 group-hover:scale-x-100",
                )}
              />
            </Link>
          ))}
        </nav>

        {/* Mobile menu trigger */}
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>

        <ThemeToggle />
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="border-t border-border/40 px-6 py-3 sm:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                "block rounded-lg px-3 py-2 text-sm font-medium",
                isActive(link.href)
                  ? "text-brand bg-brand/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

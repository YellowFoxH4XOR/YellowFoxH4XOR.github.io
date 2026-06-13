"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { navLinks, site } from "@/lib/site";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // A link is active for an exact match, or when the current path is nested
  // under it (e.g. /blog/my-post highlights the "Blog" tab) — but never treat
  // "/" as a prefix of everything.
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-4 z-50 mx-auto w-full max-w-3xl px-4 sm:px-6">
      <div
        className={cn(
          "flex flex-col justify-center px-6 transition-all duration-300 glass-panel shadow-lg hover:shadow-xl hover:border-brand/40",
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
          <nav className="flex flex-col gap-1 border-t border-border/40 pt-3 sm:hidden animate-fade-in-up">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "block rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300 hover:translate-x-1",
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

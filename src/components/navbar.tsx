"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { navLinks, site } from "@/lib/site";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
  const pathname = usePathname();
  const menu = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const close = () => {
      if (menu.current) menu.current.open = false;
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && menu.current?.open) {
        close();
        menu.current?.querySelector("summary")?.focus();
      }
    };
    const desktop = window.matchMedia("(min-width: 769px)");
    desktop.addEventListener("change", close);
    document.addEventListener("keydown", escape);
    return () => {
      desktop.removeEventListener("change", close);
      document.removeEventListener("keydown", escape);
    };
  }, []);
  const links = navLinks.map((link) => (
    <Link
      key={link.href}
      href={link.href}
      className="nav-link"
      aria-current={!link.href.includes("#") && pathname.startsWith(link.href) ? "page" : undefined}
      onClick={() => { if (menu.current) menu.current.open = false; }}
    >
      {link.label}
      <ArrowRight className="mobile-nav-arrow" aria-hidden />
    </Link>
  ));
  return (
    <header className="site-header site-wrap" id="top" data-print-hide>
      <div className="header-inner">
        <Link className="site-brand" href="/" aria-label={`${site.name}, home`}>
          <span className="brand-monogram" aria-hidden>ak.</span>
          <span className="brand-divider" aria-hidden>/</span>
          <span className="brand-name">{site.name}</span>
        </Link>
        <div className="nav-wrap">
          <nav className="desktop-nav" aria-label="Main navigation">
            {links}
          </nav>
          <ThemeToggle />
          <details className="mobile-menu" ref={menu}>
            <summary aria-label="Navigation menu">
              <Menu className="menu-open" aria-hidden />
              <X className="menu-close" aria-hidden />
            </summary>
            <nav className="mobile-nav" aria-label="Mobile navigation">
              {links}
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}

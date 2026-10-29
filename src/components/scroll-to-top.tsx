"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

// Floating "back to top" control that fades in once the user has scrolled a
// screenful — handy on long blog posts.
export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Scroll to top"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      data-print-hide
      onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })}
      className={`fixed bottom-6 right-6 z-50 grid size-10 place-items-center rounded-md border border-border bg-card text-muted-foreground shadow-[0_10px_28px_-14px_oklch(0.25_0.03_55/0.5)] transition-[opacity,transform,border-color,color] duration-200 ease-[cubic-bezier(0.25,1,0.5,1)] hover:-translate-y-1 hover:border-brand/60 hover:text-brand ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <ArrowUp className="size-4" />
    </button>
  );
}

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
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-6 right-6 z-50 grid size-11 place-items-center rounded-full border border-border/60 bg-background/80 text-muted-foreground shadow-lg backdrop-blur-md transition-all duration-300 hover:border-brand/50 hover:text-brand supports-[backdrop-filter]:bg-background/60 ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <ArrowUp className="size-5" />
    </button>
  );
}

"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

// Hydration-safe "are we on the client?" check: false during SSR (so we never
// touch `document`), true after mount — without a setState-in-effect flag.
const emptySubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

// A thin brand-colored bar pinned to the LEFT edge that fills top-to-bottom as
// you scroll the article. The faint track shows the portion still left to read.
//
// Rendered via a portal to <body> on purpose: the article wrapper uses a
// transform-based entrance animation, and a transformed ancestor turns
// `position: fixed` into `absolute` (relative to that ancestor). Portalling to
// body keeps the bar truly viewport-fixed regardless of page layout.
export function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  const mounted = useMounted();

  useEffect(() => {
    const update = () => {
      const scrollTop = window.scrollY;
      const height =
        document.documentElement.scrollHeight - window.innerHeight;
      setProgress(height > 0 ? (scrollTop / height) * 100 : 0);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed left-0 top-0 z-[60] h-screen w-[3px] bg-foreground/10"
      role="progressbar"
      aria-label="Reading progress"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="w-full bg-brand shadow-[0_0_8px_var(--color-brand)] transition-[height] duration-150 ease-out"
        style={{ height: `${progress}%` }}
      />
    </div>,
    document.body,
  );
}

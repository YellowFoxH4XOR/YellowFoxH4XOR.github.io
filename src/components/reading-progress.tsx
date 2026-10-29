"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
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
// A body portal keeps the bar viewport-fixed, independent of article layout.
export function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  const fill = useRef<HTMLDivElement>(null);
  const mounted = useMounted();

  useEffect(() => {
    if (!mounted) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const scrollTop = window.scrollY;
      const height =
        document.documentElement.scrollHeight - window.innerHeight;
      const value = height > 0 ? Math.min(100, Math.max(0, (scrollTop / height) * 100)) : 0;
      if (fill.current) fill.current.style.transform = `scaleY(${value / 100})`;
      // Visual progress is continuous; accessibility state only needs integers.
      setProgress(Math.round(value));
    };
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [mounted]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed left-0 top-0 z-[60] h-screen w-[3px] bg-foreground/10"
      data-print-hide
      role="progressbar"
      aria-label="Reading progress"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        ref={fill}
        className="h-full w-full origin-top bg-brand shadow-[0_0_8px_var(--color-brand)] transition-transform duration-150 ease-out"
        style={{ transform: "scaleY(0)" }}
      />
    </div>,
    document.body,
  );
}

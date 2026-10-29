import type { ReactNode } from "react";

// Editorial content is visible immediately, including without JavaScript.
// Keep the wrapper API for existing page sections, without scroll gates.
export function Reveal({ children, className }: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit a self-contained server bundle (.next/standalone) for a small Docker image.
  output: "standalone",
  async redirects() {
    return [{ source: "/tech-blogs/page/1", destination: "/tech-blogs", permanent: true }];
  },
  // Note: `experimental.viewTransition` was tried and removed. It compiles on
  // Next 16.2 / React 19.2, but React only ships <ViewTransition> on its
  // experimental channel, so `document.startViewTransition` is never called
  // and the flag buys nothing. Revisit when it reaches a stable React release.
};

export default nextConfig;

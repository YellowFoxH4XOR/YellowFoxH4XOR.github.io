import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[55vh] flex-col items-center justify-center text-center">
      <p className="font-mono text-7xl font-bold text-gradient-brand sm:text-8xl">
        404
      </p>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">
        Page not found
      </h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl glass-panel px-4 py-2.5 text-sm font-medium transition-colors hover:border-brand/50 hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back home
        </Link>
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <FileText className="size-4" /> Read the blog
        </Link>
      </div>
    </div>
  );
}

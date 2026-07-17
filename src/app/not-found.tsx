import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SparkIcon } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-start justify-center">
      <p className="eyebrow flex items-center gap-2.5">
        <SparkIcon className="size-3 text-brand" />
        Error 404
      </p>
      <h1 className="mt-6 text-[clamp(3rem,10vw,7rem)] font-bold leading-none tracking-[-0.04em]">
        Lost in the
        <br />
        dark<span className="text-brand">.</span>
      </h1>
      <p className="mt-6 max-w-md text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
        The den is this way.
      </p>
      <div className="mt-9 flex flex-wrap items-center gap-4">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground shadow-[0_10px_30px_-12px_var(--color-brand)] transition-all duration-300 hover:-translate-y-0.5"
        >
          <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
          Back home
        </Link>
        <Link
          href="/blog"
          className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground link-ember hover:text-foreground"
        >
          Read the blog
        </Link>
      </div>
    </div>
  );
}

import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { SparkIcon } from "@/components/icons";
import { navLinks } from "@/lib/site";

// Everything except the home link, which the primary button already covers.
const elsewhere = navLinks.filter((link) => link.href !== "/");

export default function NotFound() {
  return (
    <div className="flex min-h-[62vh] flex-col justify-center">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:items-end lg:gap-14">
        <div>
          <p className="eyebrow flex items-center gap-2.5">
            <SparkIcon className="size-3 text-brand" />
            Error 404
          </p>
          <h1 className="mt-6 text-mega font-bold">
            Lost in the
            <br />
            dark<span className="text-brand">.</span>
          </h1>
        </div>

        <div className="lg:pb-3">
          <p className="max-w-[44ch] text-[0.98rem] leading-7 text-muted-foreground">
            This page does not exist, or it moved and left no forwarding
            address. Nothing is broken, you just took a turn that goes nowhere.
          </p>

          <div className="mt-8">
            <Link
              href="/"
              className="group inline-flex items-center gap-2 rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground shadow-[0_12px_32px_-14px_var(--color-brand)] transition-all duration-200 ease-[cubic-bezier(0.25,1,0.5,1)] hover:-translate-y-0.5 hover:shadow-[0_20px_44px_-16px_var(--color-brand)]"
            >
              <ArrowLeft className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
              Back home
            </Link>
          </div>
        </div>
      </div>

      {/* A dead end is a bad ending. Offer the whole map instead. */}
      <nav
        aria-label="Everywhere else"
        className="mt-14 border-t border-hairline pt-7"
      >
        <p className="eyebrow">Try one of these</p>
        <ul className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
          {elsewhere.map((link) => {
            const external = link.href.startsWith("http");
            const className =
              "group inline-flex items-center gap-1.5 py-1.5 font-mono text-meta uppercase tracking-[0.16em] text-muted-foreground transition-colors duration-200 hover:text-brand";
            return (
              <li key={link.href}>
                {external ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={className}
                  >
                    {link.label}
                    <ArrowUpRight aria-hidden className="size-3" />
                  </a>
                ) : (
                  <Link href={link.href} className={className}>
                    {link.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

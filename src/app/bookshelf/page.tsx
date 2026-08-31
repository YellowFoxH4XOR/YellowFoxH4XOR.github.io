import type { Metadata } from "next";
import Image from "next/image";
import { books } from "@/lib/content";
import { JsonLd } from "@/components/json-ld";
import { Reveal } from "@/components/reveal";
import { PageHeader } from "@/components/page-header";
import { SectionRail } from "@/components/section-rail";
import { bookshelfSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Bookshelf",
  description: "Books I've read and recommend.",
  alternates: { canonical: "/bookshelf" },
};

export default function BookshelfPage() {
  return (
    <div>
      <JsonLd data={bookshelfSchema()} />

      <PageHeader
        eyebrow="The bookshelf"
        title={
          <>
            Books that shaped
            <br />
            how I think<span className="text-brand">.</span>
          </>
        }
        deck={
          <p>
            Systems, randomness, money, and the craft of a software career.
            These are the ones I keep going back to, not everything I have read.
          </p>
        }
        meta={[`${books.length} volumes`, "Re-read, not just read"]}
      />

      {/* The shelf. Covers stand in a row on a rule, tilting off the shelf on
          hover. It is the one place on the site where images lead. */}
      <Reveal className="block-gap">
        <div className="relative">
          <ul className="flex flex-wrap items-end gap-x-6 gap-y-8 pb-5 sm:gap-x-9">
            {books.map((book, index) => (
              <li key={`spine-${book.title}`}>
                <a
                  href={`#book-${index + 1}`}
                  aria-label={`Jump to ${book.title}`}
                  className="block"
                >
                  <Image
                    src={book.cover}
                    alt={`Cover of ${book.title}`}
                    width={132}
                    height={196}
                    priority={index < 3}
                    className="book-3d h-[11.5rem] w-[7.8rem] rounded-[3px] border border-border object-cover shadow-[0_10px_28px_-14px_oklch(0.25_0.03_55/0.55)] sm:h-[13.5rem] sm:w-[9.2rem]"
                  />
                </a>
              </li>
            ))}
          </ul>
          {/* The shelf board itself: a rule with a soft cast shadow above it. */}
          <div
            aria-hidden
            className="h-px w-full bg-gradient-to-r from-border via-brand/40 to-border"
          />
          <p className="mt-3 font-mono text-micro uppercase tracking-[0.2em] text-subtle">
            Hover a cover to pull it off the shelf
          </p>
        </div>
      </Reveal>

      <Reveal className="section-gap">
        <SectionRail
          label="The index"
          meta="Why each one earned its place, in one line."
        >
          <ol className="divide-y divide-hairline border-y border-hairline">
            {books.map((book, index) => (
              <li
                key={book.title}
                id={`book-${index + 1}`}
                className="index-row group grid scroll-mt-28 grid-cols-[2.25rem_minmax(0,1fr)] items-baseline gap-x-4 py-6 sm:grid-cols-[3rem_minmax(0,1fr)] sm:gap-x-8 sm:py-7"
              >
                <span className="font-mono text-meta text-subtle transition-colors duration-200 group-hover:text-brand">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h2 className="text-title font-semibold text-foreground">
                      {book.title}
                    </h2>
                    <p className="font-mono text-meta text-subtle">
                      {book.author}
                    </p>
                  </div>
                  <p className="mt-2.5 max-w-[68ch] text-[0.94rem] leading-7 text-muted-foreground">
                    {book.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </SectionRail>
      </Reveal>
    </div>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import { books } from "@/lib/content";
import { JsonLd } from "@/components/json-ld";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
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

      <header className="opacity-0 animate-fade-in-up [animation-fill-mode:forwards]">
        <p className="eyebrow">The bookshelf</p>
        <h1 className="mt-4 text-[clamp(2.4rem,6vw,4.25rem)] font-bold leading-[1.02] tracking-[-0.03em]">
          Books that shaped
          <br />
          how I think<span className="text-brand">.</span>
        </h1>
        <p className="mt-5 max-w-xl text-muted-foreground">
          Systems, randomness, money, and the craft of a software career. Hover
          a cover to pull it off the shelf.
        </p>
      </header>

      <Reveal className="mt-12">
        <SectionHeading>{books.length} volumes</SectionHeading>
        <ul className="mt-2 divide-y divide-border border-b border-border">
          {books.map((book, index) => (
            <li
              key={book.title}
              className="group grid grid-cols-[2.25rem_5.5rem] items-center gap-x-5 gap-y-4 py-6 sm:grid-cols-[3rem_5.5rem_1fr] sm:gap-x-8 sm:py-7"
            >
              <span className="font-mono text-xs text-muted-foreground/70 transition-colors duration-300 group-hover:text-brand">
                {String(index + 1).padStart(2, "0")}
              </span>
              <Image
                src={book.cover}
                alt={`Cover of ${book.title}`}
                width={88}
                height={128}
                loading="lazy"
                className="h-32 w-[5.5rem] rounded-[3px] border border-border object-cover shadow-sm book-3d"
              />
              <div className="col-span-2 sm:col-span-1">
                <h2 className="text-lg font-semibold tracking-tight text-foreground transition-colors duration-300 group-hover:text-brand sm:text-xl">
                  {book.title}
                </h2>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  {book.author}
                </p>
                <p className="mt-2.5 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {book.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Reveal>
    </div>
  );
}

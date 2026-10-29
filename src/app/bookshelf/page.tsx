import type { Metadata } from "next";
import Image from "next/image";
import { books } from "@/lib/content";
import { JsonLd } from "@/components/json-ld";
import { PageHeader } from "@/components/page-header";
import { bookshelfSchema } from "@/lib/seo";
import { pageMetadata } from "@/lib/page-metadata";
import { Breadcrumbs } from "@/components/breadcrumbs";

export const metadata: Metadata = pageMetadata(
  "Software Engineering & Systems Books",
  "Books on distributed systems, software engineering, randomness, and finance that shaped my thinking.",
  "/bookshelf",
);

export default function BookshelfPage() {
  return (
    <div>
      <JsonLd data={bookshelfSchema()} />
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Bookshelf", path: "/bookshelf" }]} />
      <PageHeader
        eyebrow={`${books.length} books, beyond the screen.`}
        title="Bookshelf."
        deck={
          <p>
            From database internals to the role of chance. Books on engineering,
            decisions, and the way we work.
          </p>
        }
      />
      <section className="book-shelf-grid" data-od-id="book-collection" aria-label="Books on my shelf">
        {books.map((book, index) => (
          <article className="shelf-book" id={`book-${index + 1}`} key={book.title}>
            <div className="shelf-cover">
              <Image
                src={book.cover}
                alt={`Cover of ${book.title}`}
                width={book.width}
                height={book.height}
                priority={index === 0}
                sizes="(max-width: 640px) 115px, 225px"
              />
            </div>
            <h2>{book.title}</h2>
            <p className="book-author">{book.author}</p>
            <p className="book-description">{book.description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import { books } from "@/lib/content";
import { JsonLd } from "@/components/json-ld";
import { bookshelfSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Bookshelf",
  description: "Books I've read and recommend.",
  alternates: { canonical: "/bookshelf" },
};

export default function BookshelfPage() {
  return (
    <div className="space-y-10">
      <JsonLd data={bookshelfSchema()} />
      <header className="animate-fade-in-up opacity-0 [animation-fill-mode:forwards]">
        <h1 className="text-3xl font-bold tracking-tight text-gradient-brand pb-1">Bookshelf</h1>
        <p className="mt-2 text-muted-foreground">
          A few books that shaped how I think.
        </p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2">
        {books.map((book, index) => (
          <li
            key={book.title}
            style={{ animationDelay: `${(index + 1) * 100}ms` }}
            className="flex gap-4 rounded-xl glass-card p-4 animate-fade-in-up opacity-0 [animation-fill-mode:forwards]"
          >
            <Image
              src={book.cover}
              alt={`Cover of ${book.title}`}
              width={56}
              height={80}
              loading="lazy"
              className="h-20 w-14 shrink-0 rounded-md object-cover border border-border/30 book-3d shadow-sm"
            />
            <div>
              <h2 className="font-semibold leading-tight text-foreground">
                {book.title}
              </h2>
              <p className="text-sm text-muted-foreground">by {book.author}</p>
              <p className="mt-2 text-sm text-foreground/80">
                {book.description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

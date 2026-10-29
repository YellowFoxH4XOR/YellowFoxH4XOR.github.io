import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { site } from "@/lib/site";
import { getAllPosts, getPostBySlug, type PostMeta } from "@/lib/blog";
import { extractToc } from "@/lib/toc";
import { formatDate } from "@/lib/utils";
import { postCategory } from "@/lib/post-topics";
import { books, projects } from "@/lib/content";
import { JsonLd } from "@/components/json-ld";
import { HomeHero } from "@/components/home-hero";
import { DeckleGallery } from "@/components/deckle-gallery";
import { personSchema, websiteSchema } from "@/lib/seo";

function PostMetadata({ post }: { post: PostMeta }) {
  return (
    <div className="post-meta">
      <span className="category">{postCategory(post.tags)}</span>
      <time dateTime={post.date}>{formatDate(post.date)}</time>
      <span>{post.readingTime}</span>
    </div>
  );
}

export default function HomePage() {
  const posts = getAllPosts();
  const [featured, ...secondary] = posts.slice(0, 3);
  const tracePost = featured?.slug === "how-dragonfly-outruns-redis"
    ? getPostBySlug(featured.slug)
    : null;
  const traceHeading = tracePost
    ? extractToc(tracePost.content).find((heading) => heading.text.startsWith("Life of SET key val"))
    : null;
  const selectedBooks = [
    "Designing Data-Intensive Applications",
    "Fooled by Randomness",
    "Understanding Distributed Systems",
  ].flatMap((title) => books.filter((book) => book.title === title));
  const deckle = projects.find((project) => project.name === "Deckle")!;

  return (
    <div className="portfolio-home">
      <JsonLd data={personSchema()} />
      <JsonLd data={websiteSchema()} />
      <HomeHero latest={featured} />

      <section
        className="writing-home"
        data-od-id="latest-writing"
        aria-labelledby="writing-heading"
      >
        <div className="section-top">
          <h2 id="writing-heading">Latest writing</h2>
          <Link className="text-link" href="/blog">
            <span>All {posts.length} essays</span><ArrowRight aria-hidden />
          </Link>
        </div>
        {featured ? (
          <div className="writing-grid">
            <article className="writing-feature">
              <PostMetadata post={featured} />
              <h3 className="post-title">
                <Link href={`/blog/${featured.slug}`}>{featured.title}</Link>
              </h3>
              <p>{featured.excerpt}</p>
              {featured.slug === "how-dragonfly-outruns-redis" ? (
                <>
                  <Link
                    className="command-trace"
                    href={`/blog/${featured.slug}${traceHeading ? `#${traceHeading.id}` : ""}`}
                    aria-label="Trace a SET command through Dragonfly’s uncontended single-key fast path"
                  >
                    <code>SET<br />key val</code>
                    <span>One<br />shard</span>
                    <span>Execute<br />inline</span>
                    <code>OK</code>
                  </Link>
                  <p className="trace-note">
                    The uncontended single-key path. Follow it in the source.
                  </p>
                </>
              ) : (
                <Link className="text-link" href={`/blog/${featured.slug}`}>
                  <span>Read the essay</span><ArrowRight aria-hidden />
                </Link>
              )}
            </article>
            <div className="writing-secondary">
              {secondary.map((post) => (
                <article key={post.slug}>
                  <PostMetadata post={post} />
                  <h3 className="post-title">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>
                  <p className="post-tail">{post.excerpt}</p>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <p>No essays yet. Check back soon.</p>
        )}
      </section>

      <section
        className="studio"
        id="studio"
        data-od-id="kelvanic-studio"
        aria-labelledby="studio-heading"
      >
        <div className="studio-top">
          <div className="studio-heading-group">
            <h2 id="studio-heading">{site.studio.name}</h2>
            <p className="studio-label">
              Independent software studio<br />Founder &amp; engineer
            </p>
          </div>
          <a className="text-link" href={site.studio.url} target="_blank" rel="noopener noreferrer">
            <span>Visit the studio</span><ArrowUpRight aria-hidden />
          </a>
        </div>
        <div className="studio-middle">
          <div className="studio-description">
            <h3>Deckle.<br />A softer surface for your Mac.</h3>
            <p>{deckle.homeDescription}</p>
            <div className="studio-engineering">
              <h4>A layer, not a barrier.</h4>
              <p>{deckle.engineeringNote}</p>
              <p className="shipped-note">
                {deckle.impact.replace(/\.$/, "")} for macOS.
              </p>
            </div>
            <a className="text-link" href={deckle.url} target="_blank" rel="noopener noreferrer">
              <span>Explore Deckle</span><ArrowUpRight aria-hidden />
            </a>
          </div>
          <DeckleGallery />
        </div>
      </section>

      <section
        className="books-home"
        data-od-id="home-bookshelf"
        aria-labelledby="books-heading"
      >
        <div className="books-intro">
          <h2 id="books-heading">Off the screen.</h2>
          <p>Systems, uncertainty, and the way we think. A few books from my shelf.</p>
          <Link className="text-link" href="/bookshelf">
            <span>Explore the bookshelf</span><ArrowRight aria-hidden />
          </Link>
        </div>
        <div className="book-selection">
          {selectedBooks.map((book) => {
            const href = `/bookshelf#book-${books.indexOf(book) + 1}`;
            return (
              <article className="selected-book" key={book.title}>
                <Link className="book-cover-link" href={href} aria-label={`About ${book.title}`}>
                  <div className="book-cover">
                    <Image
                      src={book.cover}
                      width={book.width}
                      height={book.height}
                      alt={`Cover of ${book.title}`}
                      sizes="(max-width: 640px) 40vw, 190px"
                    />
                  </div>
                </Link>
                <h3><Link href={href}>{book.title}</Link></h3>
                <p className="book-author">{book.author}</p>
                <p className="book-takeaway">{book.description}</p>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

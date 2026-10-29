import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { site } from "@/lib/site";
import type { PostMeta } from "@/lib/blog";

export function HomeHero({ latest }: { latest?: PostMeta }) {
  return (
    <section
      className="personal-intro"
      data-od-id="home-introduction"
      aria-labelledby="name-heading"
    >
      <div className="identity">
        <h1 id="name-heading">{site.name}</h1>
        <p className="identity-note">
          Engineer. Founder.<br /> Writer.
        </p>
      </div>
      <div className="hero-body">
        <div className="hero-intro">
          <h2>
            Building the systems<br className="desktop-break" /> behind the software.
          </h2>
          <p className="lead">
            <span className="desktop-copy">{site.shortIntro}</span>
            <span className="mobile-copy">
              Senior platform engineer. 7+ years building in Python and Go.
            </span>
          </p>
          <div className="hero-actions">
            <Link className="primary-link" href="/blog">
              Read my writing<ArrowRight aria-hidden />
            </Link>
            <Link className="text-link" href="/resume">
              <span>My work</span><ArrowUpRight aria-hidden />
            </Link>
          </div>
          <div className="current-work">
            <span className="current-dot" aria-hidden />
            <div>
              <h3>Currently at {site.worksFor}</h3>
              <p>
                <span className="desktop-copy">{site.currentWork}</span>
                <span className="mobile-copy">
                  I built the AI developer platform used by 200+ engineers.
                </span>
              </p>
            </div>
          </div>
          {latest && (
            <Link className="mobile-latest" href={`/blog/${latest.slug}`}>
              <small>Latest essay</small>
              <span>{latest.title}</span>
              <ArrowRight aria-hidden />
            </Link>
          )}
        </div>
        <figure className="portrait">
          <Image
            src="/images/profile-portrait.jpg"
            width={1120}
            height={1493}
            alt={`Portrait of ${site.name}`}
            priority
            sizes="(max-width: 640px) 100vw, 330px"
          />
          <figcaption>
            <a href={site.sameAs[0]} target="_blank" rel="noopener noreferrer">
              {site.twitterHandle}<ArrowUpRight aria-hidden />
            </a>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

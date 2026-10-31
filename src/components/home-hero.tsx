import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { site } from "@/lib/site";
import type { PostMeta } from "@/lib/blog";

export function HomeHero({ latest }: { latest?: PostMeta }) {
  return (
    <>
      <section
        className="personal-intro"
        data-od-id="home-introduction"
        aria-labelledby="name-heading"
      >
        <div className="identity">
          <h1 id="name-heading">{site.name}</h1>
        </div>
        <div className="hero-body">
          <div className="hero-intro">
            <p className="hero-statement">
              <span className="desktop-copy">Platform engineer and writer building with Python and Go.</span>
              <span className="mobile-copy">Platform engineer building CBA’s AI developer platform for 200+ engineers.</span>
            </p>
            <div className="hero-actions">
              <Link className="primary-link" href="/blog">
                Read my writing<ArrowRight aria-hidden />
              </Link>
              <Link className="text-link" href="/resume">
                <span>My work</span><ArrowUpRight aria-hidden />
              </Link>
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
              preload
              sizes="(max-width: 640px) calc(100vw - 48px), (max-width: 960px) 34vw, 320px"
            />
            <figcaption>
              <a href={site.sameAs[0]} target="_blank" rel="noopener noreferrer">
                {site.twitterHandle}<ArrowUpRight aria-hidden />
              </a>
            </figcaption>
          </figure>
        </div>
      </section>
      <section className="engineering-profile" aria-labelledby="profile-heading">
        <div className="profile-summary">
          <h2 id="profile-heading">Building the systems behind the software.</h2>
          <p>{site.shortIntro}</p>
        </div>
        <div className="current-work">
          <h3>Currently at {site.worksFor}</h3>
          <p>{site.currentWork}</p>
        </div>
      </section>
    </>
  );
}

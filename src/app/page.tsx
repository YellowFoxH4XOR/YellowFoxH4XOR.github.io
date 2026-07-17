import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { site } from "@/lib/site";
import { getAllPosts } from "@/lib/blog";
import { SocialLinks } from "@/components/social-links";
import { PostCard } from "@/components/post-card";
import { JsonLd } from "@/components/json-ld";
import { HomeHero } from "@/components/home-hero";
import { Marquee } from "@/components/marquee";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { personSchema, websiteSchema } from "@/lib/seo";

// Capability ticker between the hero and the writing index. Short, curated
// labels (presentational only); the full skill list lives on /resume.
const capabilities = [
  "Python",
  "Go",
  "FastAPI",
  "RAG Pipelines",
  "LLM Agents",
  "PostgreSQL",
  "LangChain",
  "Qdrant",
  "gRPC",
  "Kubernetes",
  "AWS",
  "Docker",
];

export default function HomePage() {
  const posts = getAllPosts().slice(0, 3);

  return (
    <div>
      <JsonLd data={personSchema()} />
      <JsonLd data={websiteSchema()} />

      <HomeHero />

      <Reveal>
        <Marquee items={capabilities} />
      </Reveal>

      {/* Latest writing */}
      <Reveal className="mt-20 sm:mt-28">
        <SectionHeading>Latest writing</SectionHeading>

        {posts.length > 0 ? (
          <>
            <div className="mt-2 divide-y divide-border border-b border-border">
              {posts.map((post, i) => (
                <PostCard key={post.slug} post={post} index={i} />
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <Link
                href="/blog"
                className="group inline-flex items-center gap-1.5 font-mono text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-brand"
              >
                All posts
                <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </>
        ) : (
          <p className="mt-6 text-sm text-muted-foreground">
            No posts yet, check back soon.
          </p>
        )}
      </Reveal>

      {/* Projects */}
      <Reveal className="mt-20 sm:mt-28" delay={120}>
        <SectionHeading>Projects</SectionHeading>
        <a
          href="https://projects.akshatkatiyar.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-2 grid gap-5 border-y border-border py-7 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-10"
        >
          <span>
            <span className="eyebrow block">Project index · built by hand</span>
            <span className="mt-3 block text-2xl font-semibold tracking-tight transition-colors duration-300 group-hover:text-brand sm:text-3xl">
              Small tools, made with care.
            </span>
            <span className="mt-2 block max-w-xl text-sm leading-6 text-muted-foreground">
              An index of things I&apos;ve built: small tools, side projects, and
              works in progress.
            </span>
          </span>
          <ArrowUpRight className="size-6 text-muted-foreground transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-brand" />
        </a>
      </Reveal>

      {/* Elsewhere */}
      <Reveal className="mt-20 sm:mt-28" delay={80}>
        <SectionHeading>Elsewhere</SectionHeading>
        <div className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-5">
          <SocialLinks />
          <a
            href={`mailto:${site.email}`}
            className="font-mono text-sm text-muted-foreground link-ember hover:text-foreground"
          >
            {site.email}
          </a>
        </div>
      </Reveal>
    </div>
  );
}

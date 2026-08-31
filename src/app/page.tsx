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
import { SectionRail } from "@/components/section-rail";
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

// What lives on the projects subdomain. Keeps the ink panel from being a
// headline floating in empty space.
const projectKinds = ["CLI tools", "Agents", "Web apps", "Experiments"];

export default function HomePage() {
  const posts = getAllPosts().slice(0, 3);

  return (
    <div>
      <JsonLd data={personSchema()} />
      <JsonLd data={websiteSchema()} />

      <HomeHero />

      <Reveal className="mt-10 sm:mt-12">
        <div className="bleed-flush">
          <Marquee items={capabilities} />
        </div>
      </Reveal>

      {/* Latest writing */}
      <Reveal className="section-gap">
        <SectionRail
          label="Latest writing"
          meta={`${posts.length} of the newest notes on engineering, systems, and craft.`}
          action={
            <Link
              href="/blog"
              className="group inline-flex items-center gap-1.5 font-mono text-micro font-medium uppercase tracking-[0.2em] text-muted-foreground transition-colors duration-200 hover:text-brand"
            >
              All posts
              <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          }
        >
          {posts.length > 0 ? (
            <>
              <div className="divide-y divide-hairline border-y border-hairline">
                {posts.map((post, i) => (
                  <PostCard key={post.slug} post={post} index={i} />
                ))}
              </div>
              <div className="mt-6 flex justify-end lg:hidden">
                <Link
                  href="/blog"
                  className="group inline-flex items-center gap-1.5 font-mono text-micro font-medium uppercase tracking-[0.2em] text-muted-foreground transition-colors duration-200 hover:text-brand"
                >
                  All posts
                  <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              No posts yet, check back soon.
            </p>
          )}
        </SectionRail>
      </Reveal>

      {/* Projects — the page's one anchored dark plane. Everything else is
          warm paper; this is what the paper pushes against. */}
      <Reveal className="section-gap">
        <a
          href="https://projects.akshatkatiyar.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block overflow-hidden ink-panel px-7 py-10 transition-transform duration-200 ease-[cubic-bezier(0.25,1,0.5,1)] hover:-translate-y-1 sm:px-12 sm:py-14"
        >
          {/* Ember hearth: a warm light rising from the lower-right corner
              that intensifies on hover. */}
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -right-24 size-[26rem] rounded-full bg-brand/25 opacity-70 blur-[110px] transition-opacity duration-500 group-hover:opacity-100"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-grain opacity-[0.06]"
          />

          <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-16">
            <div className="min-w-0">
              <span className="flex items-center gap-2.5 font-mono text-micro font-medium uppercase tracking-[0.24em] text-ink-muted">
                <span className="size-1 rounded-full bg-brand" />
                Project index
              </span>

              <span className="mt-6 block max-w-[14ch] text-display font-bold text-ink-foreground">
                Small tools, made with care.
              </span>

              <span className="mt-5 block max-w-[52ch] text-[0.95rem] leading-7 text-ink-muted">
                Side projects, throwaway experiments that stuck around, and
                works still in progress. All of it built by hand, most of it
                still running.
              </span>

              <span className="mt-8 flex flex-wrap gap-2">
                {projectKinds.map((kind) => (
                  <span
                    key={kind}
                    className="rounded-full border border-ink-border px-3 py-1 font-mono text-micro uppercase tracking-[0.14em] text-ink-muted"
                  >
                    {kind}
                  </span>
                ))}
              </span>
            </div>

            <span className="flex shrink-0 items-center gap-4 lg:flex-col lg:items-end lg:gap-5">
              <span className="grid size-16 place-items-center rounded-full border border-ink-border transition-colors duration-200 group-hover:border-brand group-hover:bg-brand sm:size-20">
                <ArrowUpRight className="size-7 text-brand transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-foreground sm:size-8" />
              </span>
              {/* The domain is one unbreakable token; below sm it would force
                  the panel wider than the viewport, so the arrow carries the
                  affordance alone there. */}
              <span className="hidden font-mono text-micro uppercase tracking-[0.18em] text-ink-muted transition-colors duration-200 group-hover:text-brand sm:inline">
                projects.akshatkatiyar.com
              </span>
            </span>
          </div>
        </a>
      </Reveal>

      {/* Elsewhere */}
      <Reveal className="section-gap">
        <SectionRail
          label="Elsewhere"
          meta="Mail is the fastest way to reach me. Everything else is a slower door."
        >
          <div className="border-y border-hairline py-7">
            <a
              href={`mailto:${site.email}`}
              className="group inline-flex items-baseline gap-3 break-all text-lead font-semibold tracking-tight transition-colors duration-200 hover:text-brand sm:text-title"
            >
              {site.email}
              <ArrowUpRight className="size-5 shrink-0 self-center text-muted-foreground transition-all duration-200 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-brand" />
            </a>
            <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-3">
              <SocialLinks />
            </div>
          </div>
        </SectionRail>
      </Reveal>
    </div>
  );
}

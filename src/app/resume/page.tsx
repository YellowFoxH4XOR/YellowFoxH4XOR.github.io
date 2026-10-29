import type { Metadata } from "next";
import { ArrowUpRight, Download } from "lucide-react";
import {
  summary,
  experience,
  skillGroups,
  projects,
  education,
  resumePdfUrl,
} from "@/lib/content";
import { JsonLd } from "@/components/json-ld";
import { Reveal } from "@/components/reveal";
import { PageHeader } from "@/components/page-header";
import { SectionRail } from "@/components/section-rail";
import { resumeSchema } from "@/lib/seo";
import { site } from "@/lib/site";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata(
  "Resume",
  "Senior platform engineer — 7+ years of Python/Go, developer infrastructure, AI tooling, and cloud automation. Experience, skills, open source, and education.",
  "/resume",
);

export default function ResumePage() {
  return (
    <div>
      <JsonLd data={resumeSchema()} />

      {/* Printed resumes leave the site behind, so the paper version needs the
          identity block the navbar normally carries. Hidden on screen. */}
      <div data-print-only className="hidden">
        <p className="text-2xl font-bold tracking-tight">{site.name}</p>
        <p className="mt-1 font-mono text-sm">
          {site.jobTitle} · {site.email} · {site.url.replace(/^https?:\/\//, "")}
        </p>
        <hr className="mt-4 mb-8" />
      </div>

      <PageHeader
        eyebrow="Resume"
        title={
          <>
            Seven years of shipping developer platforms
            <span className="text-brand">.</span>
          </>
        }
        deck={<p className="text-[0.98rem] leading-7">{summary}</p>}
        meta={["Senior Platform Engineer", "AI & developer infrastructure"]}
        action={
          resumePdfUrl ? (
            <a
              href={resumePdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="group inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground shadow-[0_12px_32px_-16px_var(--color-brand)] transition-all duration-200 ease-[cubic-bezier(0.25,1,0.5,1)] hover:-translate-y-0.5 hover:shadow-[0_20px_44px_-18px_var(--color-brand)]"
            >
              <Download className="size-4 transition-transform duration-200 group-hover:translate-y-0.5" />
              Download PDF
            </a>
          ) : undefined
        }
      />

      {/* Experience — dates in their own column, the way a resume is read. */}
      <Reveal className="section-gap">
        <SectionRail
          label="Experience"
          meta="Most recent first. Every line is something that shipped and stayed shipped."
        >
          <div className="divide-y divide-hairline border-y border-hairline">
            {experience.map((job) => (
              <article
                key={`${job.company}-${job.title}`}
                className="grid gap-x-8 gap-y-3 py-8 sm:grid-cols-[9.5rem_minmax(0,1fr)]"
              >
                <div className="sm:pt-1">
                  <p className="font-mono text-meta text-muted-foreground">
                    {job.period}
                  </p>
                  <p className="mt-1.5 font-mono text-micro uppercase tracking-[0.14em] text-subtle">
                    {job.location}
                  </p>
                </div>

                <div className="min-w-0">
                  <h3 className="text-title font-semibold text-foreground">
                    {job.title}
                  </h3>
                  <p className="mt-1.5 font-mono text-meta text-brand">
                    {job.company}
                  </p>
                  {job.team && (
                    <p className="mt-1.5 font-mono text-micro italic text-subtle">
                      {job.team}
                    </p>
                  )}
                  <ul className="mt-4 max-w-[74ch] space-y-2.5 text-[0.94rem] leading-7 text-foreground/85">
                    {job.highlights.map((point) => (
                      <li
                        key={point}
                        className="relative pl-5 before:absolute before:left-0 before:top-[0.72em] before:size-1 before:rounded-full before:bg-brand/70"
                      >
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </SectionRail>
      </Reveal>

      {/* Open source & side projects */}
      <Reveal className="section-gap">
        <SectionRail
          label="Open source"
          meta="Patches sent upstream and tools shipped on the side."
        >
          <div className="divide-y divide-hairline border-y border-hairline">
            {projects.map((project, i) => (
              <article
                key={project.name}
                className="index-row group grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-4 py-6 sm:grid-cols-[3rem_minmax(0,1fr)] sm:gap-x-8"
              >
                <span className="font-mono text-meta text-subtle transition-colors duration-200 group-hover:text-brand">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <h3 className="text-title font-semibold text-foreground">
                    {project.name}
                  </h3>
                  <p className="mt-2 max-w-[68ch] text-[0.94rem] leading-7 text-muted-foreground">
                    {project.description}
                  </p>
                  <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                    <span className="font-mono text-micro text-subtle">
                      {project.stack}
                    </span>
                    <span aria-hidden className="text-subtle">
                      /
                    </span>
                    <span className="font-mono text-micro font-medium text-brand">
                      {project.impact}
                    </span>
                  </p>
                </div>
              </article>
            ))}
          </div>
        </SectionRail>
      </Reveal>

      {/* Skills */}
      <Reveal className="section-gap">
        <SectionRail
          label="Skills"
          meta="Things I have used in production, not things I have read about."
        >
          <div className="space-y-7 border-y border-hairline py-8">
            {skillGroups.map((group) => (
              <div
                key={group.label}
                className="grid gap-3 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-8"
              >
                <h3 className="eyebrow pt-1.5">{group.label}</h3>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-hairline px-3 py-1 font-mono text-micro text-muted-foreground transition-colors duration-200 hover:border-brand/60 hover:text-brand"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SectionRail>
      </Reveal>

      {/* Education */}
      <Reveal className="section-gap">
        <SectionRail label="Education" meta="Degrees and certifications.">
          <div className="divide-y divide-hairline border-y border-hairline">
            {education.map((edu) => (
              <div
                key={edu.degree}
                className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1 py-5"
              >
                <div>
                  <h3 className="font-semibold tracking-tight text-foreground">
                    {edu.degree}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {edu.school}
                  </p>
                </div>
                <span className="font-mono text-meta text-subtle">
                  {edu.period}
                </span>
              </div>
            ))}
          </div>
        </SectionRail>
      </Reveal>

      {/* Contact nudge */}
      <Reveal className="block-gap">
        <p className="text-sm text-muted-foreground">
          Want the full story?{" "}
          <a
            href={`mailto:${site.email}`}
            className="group inline-flex items-center gap-1 font-medium text-brand link-ember"
          >
            Write to me
            <ArrowUpRight className="size-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </p>
      </Reveal>
    </div>
  );
}

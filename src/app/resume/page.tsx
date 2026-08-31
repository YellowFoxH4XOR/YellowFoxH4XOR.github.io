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
import { SectionHeading } from "@/components/section-heading";
import { resumeSchema } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Resume",
  description:
    "Senior platform engineer — 7+ years of Python/Go, developer infrastructure, AI tooling, and cloud automation. Experience, skills, open source, and education.",
  alternates: { canonical: "/resume" },
};

export default function ResumePage() {
  return (
    <div className="mx-auto max-w-3xl">
      <JsonLd data={resumeSchema()} />

      <header className="flex flex-wrap items-end justify-between gap-6 opacity-0 animate-fade-in-up [animation-fill-mode:forwards]">
        <div>
          <p className="eyebrow">Resume</p>
          <h1 className="mt-4 text-[clamp(2.2rem,5.5vw,3.75rem)] font-bold leading-[1.02] tracking-[-0.03em]">
            Seven years of shipping
            <br />
            developer platforms<span className="text-brand">.</span>
          </h1>
          <p className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Senior Platform Engineer · AI &amp; Developer Infrastructure
          </p>
        </div>
        {resumePdfUrl && (
          <a
            href={resumePdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="group inline-flex shrink-0 items-center gap-2 rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground shadow-[0_10px_30px_-14px_var(--color-brand)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-14px_var(--color-brand)]"
          >
            <Download className="size-4 transition-transform duration-300 group-hover:translate-y-0.5" />
            PDF
          </a>
        )}
      </header>

      {/* Summary */}
      <Reveal className="mt-10">
        <p className="max-w-2xl text-base leading-7 text-foreground/85">
          {summary}
        </p>
      </Reveal>

      {/* Experience */}
      <Reveal className="mt-16">
        <SectionHeading>Experience</SectionHeading>
        <div className="relative mt-8 space-y-10 before:absolute before:bottom-1 before:left-[3px] before:top-1 before:w-px before:bg-border">
          {experience.map((job) => (
            <article key={`${job.company}-${job.title}`} className="group relative pl-8">
              <span
                aria-hidden
                className="absolute left-0 top-[7px] size-[7px] rounded-full bg-brand ring-4 ring-background transition-transform duration-300 group-hover:scale-125"
              />
              <h3 className="text-lg font-semibold tracking-tight text-foreground">
                {job.title}
              </h3>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                <span className="text-brand">{job.company}</span> ·{" "}
                {job.location} · {job.period}
                {job.team && (
                  <>
                    {" · "}
                    <em>{job.team}</em>
                  </>
                )}
              </p>
              <ul className="mt-3.5 space-y-2 text-sm leading-6 text-foreground/85">
                {job.highlights.map((point) => (
                  <li
                    key={point}
                    className="relative pl-5 before:absolute before:left-0 before:top-[0.65em] before:size-1 before:rounded-full before:bg-brand/70"
                  >
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Reveal>

      {/* Selected Projects */}
      <Reveal className="mt-16">
        <SectionHeading>Open source &amp; side projects</SectionHeading>
        <div className="mt-2 divide-y divide-border border-b border-border">
          {projects.map((project, i) => (
            <article
              key={project.name}
              className="group grid grid-cols-[2.25rem_1fr] gap-x-4 py-6 sm:grid-cols-[3rem_1fr] sm:gap-x-8"
            >
              <span className="font-mono text-xs text-muted-foreground/70 transition-colors duration-300 group-hover:text-brand">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-semibold tracking-tight text-foreground transition-colors duration-300 group-hover:text-brand">
                  {project.name}
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {project.description}
                </p>
                <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                  <span className="font-mono text-[11px] text-muted-foreground/80">
                    {project.stack}
                  </span>
                  <span aria-hidden className="text-border">/</span>
                  <span className="font-mono text-[11px] font-medium text-brand">
                    {project.impact}
                  </span>
                </p>
              </div>
            </article>
          ))}
        </div>
      </Reveal>

      {/* Skills */}
      <Reveal className="mt-16">
        <SectionHeading>Skills</SectionHeading>
        <div className="mt-8 space-y-6">
          {skillGroups.map((group) => (
            <div
              key={group.label}
              className="grid gap-3 sm:grid-cols-[10rem_1fr] sm:gap-6"
            >
              <h3 className="eyebrow pt-1">{group.label}</h3>
              <div className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-border px-2.5 py-1 font-mono text-[11px] text-muted-foreground transition-colors duration-300 hover:border-brand/60 hover:text-brand"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Education */}
      <Reveal className="mt-16">
        <SectionHeading>Education &amp; certifications</SectionHeading>
        <div className="mt-2 divide-y divide-border border-b border-border">
          {education.map((edu) => (
            <div
              key={edu.degree}
              className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-5"
            >
              <div>
                <h3 className="font-semibold tracking-tight text-foreground">
                  {edu.degree}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {edu.school}
                </p>
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                {edu.period}
              </span>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Contact nudge */}
      <Reveal className="mt-16">
        <p className="border-t border-border pt-8 text-sm text-muted-foreground">
          Want the full story?{" "}
          <a href={`mailto:${site.email}`} className="group inline-flex items-center gap-1 font-medium text-brand link-ember">
            Write to me
            <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </p>
      </Reveal>
    </div>
  );
}

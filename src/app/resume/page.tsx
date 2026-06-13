import type { Metadata } from "next";
import { Download } from "lucide-react";
import {
  summary,
  experience,
  skillGroups,
  projects,
  education,
  resumePdfUrl,
} from "@/lib/content";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Resume",
  description:
    "Senior Backend Engineer (AI & Platform) — 7+ years of Python/Go, GenAI, and DevOps. Experience, skills, projects, and education.",
  alternates: { canonical: "/resume" },
};

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-5 font-mono text-sm font-semibold uppercase tracking-widest text-muted-foreground/80">
      {children}
    </h2>
  );
}

export default function ResumePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-12">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient-brand pb-1">
            Resume
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Senior Backend Engineer — AI &amp; Platform
          </p>
        </div>
        {resumePdfUrl && (
          <a
            href={resumePdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="group inline-flex shrink-0 items-center gap-2 rounded-xl glass-panel px-4 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-300 hover:text-foreground hover:scale-[1.03] hover-glow"
          >
            <Download className="size-4 transition-transform group-hover:translate-y-[1px]" />
            Download PDF
          </a>
        )}
      </header>

      {/* Summary */}
      <section>
        <p className="text-base leading-7 text-foreground/85">{summary}</p>
      </section>

      {/* Experience */}
      <section>
        <SectionHeading>Experience</SectionHeading>
        <div className="space-y-8 relative before:absolute before:left-1 before:top-2 before:bottom-2 before:w-[1px] before:bg-gradient-to-b before:from-brand/60 before:via-brand/30 before:to-border/10">
          {experience.map((job) => (
            <article key={`${job.company}-${job.title}`} className="relative pl-6 group">
              <span className="absolute left-0 top-2.5 size-2.5 rounded-full border border-background bg-brand shadow-[0_0_8px_var(--color-brand)] transition-transform duration-300 group-hover:scale-125" />
              <h3 className="text-lg font-semibold tracking-tight text-foreground transition-colors group-hover:text-brand">
                {job.title} <span className="text-muted-foreground">@</span>{" "}
                {job.company}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {job.location} · {job.period}
                {job.team && (
                  <>
                    {" · "}
                    <em>{job.team}</em>
                  </>
                )}
              </p>
              <ul className="mt-3 space-y-2 text-sm text-foreground/90">
                {job.highlights.map((point) => (
                  <li
                    key={point}
                    className="relative pl-5 before:absolute before:left-1 before:top-2.5 before:size-1.5 before:rounded-full before:bg-brand/70"
                  >
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* Selected Projects */}
      <section>
        <SectionHeading>Selected Projects</SectionHeading>
        <div className="grid gap-4">
          {projects.map((project) => (
            <article
              key={project.name}
              className="rounded-xl glass-card p-5 transition-colors hover:border-brand/40"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <h3 className="font-semibold text-foreground">{project.name}</h3>
                <span className="font-mono text-xs text-muted-foreground">
                  {project.stack}
                </span>
              </div>
              <p className="mt-2 text-sm text-foreground/80">
                {project.description}
              </p>
              <p className="mt-2 text-sm font-medium text-brand">
                {project.impact}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section>
        <SectionHeading>Skills</SectionHeading>
        <div className="space-y-5">
          {skillGroups.map((group) => (
            <div key={group.label}>
              <h3 className="mb-2 text-sm font-medium text-foreground/70">
                {group.label}
              </h3>
              <div className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <Badge
                    key={item}
                    variant="secondary"
                    className="font-mono bg-secondary/60 border border-border/20 backdrop-blur-md transition-colors hover:border-brand/40"
                  >
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section>
        <SectionHeading>Education</SectionHeading>
        <div className="space-y-4">
          {education.map((edu) => (
            <div
              key={edu.degree}
              className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1"
            >
              <div>
                <h3 className="font-semibold text-foreground">{edu.degree}</h3>
                <p className="text-sm text-muted-foreground">{edu.school}</p>
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                {edu.period}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

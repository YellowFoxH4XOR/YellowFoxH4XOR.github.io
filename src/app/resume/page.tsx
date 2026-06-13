import type { Metadata } from "next";
import { Download } from "lucide-react";
import { experience, skills, resumePdfUrl } from "@/lib/content";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Resume",
  description: "Experience and skills.",
  alternates: { canonical: "/resume" },
};

export default function ResumePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-12">
      <header className="flex items-center justify-between gap-4 animate-fade-in-up opacity-0 [animation-fill-mode:forwards]">
        <h1 className="text-3xl font-bold tracking-tight text-gradient-brand pb-1">Resume</h1>
        {resumePdfUrl && (
          <a
            href={resumePdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-xl glass-panel px-4 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-300 hover:text-foreground hover:scale-[1.03] hover-glow"
          >
            <Download className="size-4 transition-transform group-hover:translate-y-[1px]" /> PDF
          </a>
        )}
      </header>

      <section className="animate-fade-in-up opacity-0 animation-delay-100 [animation-fill-mode:forwards]">
        <h2 className="mb-6 font-mono text-sm font-semibold uppercase tracking-widest text-muted-foreground/80">
          Experience
        </h2>
        <div className="space-y-8 relative before:absolute before:left-1 before:top-2 before:bottom-2 before:w-[1px] before:bg-gradient-to-b before:from-brand/60 before:via-brand/30 before:to-border/10">
          {experience.map((job, index) => (
            <article
              key={`${job.company}-${job.title}`}
              style={{ animationDelay: `${(index + 1.5) * 100}ms` }}
              className="relative pl-6 group animate-fade-in-up opacity-0 [animation-fill-mode:forwards]"
            >
              <span className="absolute left-[0px] top-2.5 size-2.5 rounded-full border border-background bg-brand transition-all duration-300 group-hover:scale-130 shadow-[0_0_8px_var(--color-brand)] group-hover:shadow-[0_0_15px_var(--color-brand)]" />
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
                    className="relative pl-5 before:absolute before:left-1 before:top-2.5 before:size-1.5 before:rounded-full before:bg-brand/70 before:shadow-[0_0_6px_var(--color-brand)] hover:before:bg-brand hover:before:scale-125 transition-all duration-200"
                  >
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section
        style={{ animationDelay: `${(experience.length + 2) * 100}ms` }}
        className="animate-fade-in-up opacity-0 [animation-fill-mode:forwards]"
      >
        <h2 className="mb-4 font-mono text-sm font-semibold uppercase tracking-widest text-muted-foreground/80">
          Skills
        </h2>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <Badge
              key={skill}
              variant="secondary"
              className="font-mono bg-secondary/60 border border-border/20 backdrop-blur-md hover:border-brand/40 transition-colors"
            >
              {skill}
            </Badge>
          ))}
        </div>
      </section>
    </div>
  );
}

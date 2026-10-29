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
import { JsonLd } from "@/components/json-ld";
import { PageHeader } from "@/components/page-header";
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
      <div data-print-only className="hidden">
        <p className="text-2xl font-bold tracking-tight">{site.name}</p>
        <p className="mt-1 font-mono text-sm">
          {site.jobTitle} · {site.email} · {site.url.replace(/^https?:\/\//, "")}
        </p>
        <hr className="mb-8 mt-4" />
      </div>
      <PageHeader
        eyebrow={site.jobTitle}
        title="The work."
        deck={<p>{summary}</p>}
        action={resumePdfUrl && (
          <a className="primary-link" href={resumePdfUrl} target="_blank" rel="noopener noreferrer" download>
            <Download className="size-4" aria-hidden />Download PDF
          </a>
        )}
      />

      <section className="resume-section" data-od-id="experience" aria-labelledby="experience-heading">
        <h2 id="experience-heading">Experience</h2>
        <div>
          {experience.map((job) => (
            <article className="resume-job" key={`${job.company}-${job.title}`}>
              <h3>{job.title}</h3>
              <p className="company">{job.company}</p>
              <p className="job-meta">{job.period} · {job.location}</p>
              {job.team && <p className="job-meta">{job.team}</p>}
              <ul>
                {job.highlights.map((point) => <li key={point}>{point}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>
      <section className="resume-section" data-od-id="skills" aria-labelledby="skills-heading">
        <h2 id="skills-heading">Tools of the trade</h2>
        <div>
          {skillGroups.map((group) => (
            <div className="resume-skill-group" key={group.label}>
              <h3>{group.label}</h3>
              <p>{group.items.join(", ")}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="resume-section" data-od-id="open-source" aria-labelledby="open-source-heading">
        <h2 id="open-source-heading">Open source &amp; independent work</h2>
        <div>
          {projects.map((project) => (
            <article className="resume-job" key={project.name}>
              <h3>
                {project.url ? (
                  <a className="link-ember" href={project.url} target="_blank" rel="noopener noreferrer">
                    {project.name}
                  </a>
                ) : project.name}
              </h3>
              <p className="job-meta">{project.stack}</p>
              <p className="mt-4">{project.description} {project.impact}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="resume-section" data-od-id="education" aria-labelledby="education-heading">
        <h2 id="education-heading">Education &amp; credentials</h2>
        <div>
          {education.map((item) => (
            <article className="resume-job" key={item.degree}>
              <h3>{item.degree}</h3>
              <p className="company">{item.school}</p>
              <p className="job-meta">{item.period}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

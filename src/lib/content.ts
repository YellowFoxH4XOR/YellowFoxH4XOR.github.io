// Static content for the resume + bookshelf pages. Kept as data so the pages
// stay presentational. Resume content mirrors akshat_katiyar_resume.pdf.

export const summary =
  "Senior platform engineer with 7+ years building developer infrastructure, automation, and distributed backend systems in Python and Go. Built CBA's internal AI development platform \u2014 coding-agent workspaces, MCP integrations, an LLM compatibility gateway, and evaluation telemetry \u2014 adopted by 200+ engineers.";

export type Job = {
  title: string;
  company: string;
  location: string;
  period: string;
  team?: string;
  highlights: string[];
};

export const experience: Job[] = [
  {
    title: "Senior Software Engineer",
    company: "Commonwealth Bank of Australia (CBA India)",
    location: "Bengaluru",
    period: "May 2023 \u2013 Present",
    highlights: [
      "Built and own CBA's internal AI developer platform, combining Claude Code, Codex and Pi with task routing, LLM gateway routing and automated code review; adopted by 200+ engineers and earned 140 internal GitHub stars.",
      "Built a FastMCP server exposing F5 load-balancer configuration to coding agents through four tools \u2014 read, write, search and validate \u2014 so engineers change and verify config without leaving their development environment.",
      "Built a Node.js/LiteLLM compatibility gateway normalizing agent payloads across AWS Bedrock endpoints, isolating 200+ engineers from provider-specific API changes.",
      "Instrumented agent traffic with Langfuse and HoneyHive to track adoption, evaluation quality, cost and DORA metrics across teams on the platform.",
      "Built a secure self-service deployment platform using Ping OIDC, Vault, Terraform, Ansible, GitHub Actions and Artifactory.",
      "Built network-operations automation \u2014 a stateful LangGraph diagnostic agent plus Python/Go F5 services with cross-site PostgreSQL replication, Airflow orchestration and deployment safety gates.",
    ],
  },
  {
    title: "Software Engineer III",
    company: "AppDynamics (Cisco)",
    location: "Bengaluru",
    period: "Nov 2022 \u2013 May 2023",
    highlights: [
      "Engineered an Ansible role for full agent lifecycle (install, upgrade, rollback, uninstall) across customer fleets of 1,000+ VMs, cloud and on-premise \u2014 cut deployment time 50%+.",
      "Implemented OpenTelemetry instrumentation in the AppDynamics Python agent and built the ZeroMQ IPC channel carrying agent-to-controller traffic.",
    ],
  },
  {
    title: "Senior Software Engineer",
    company: "Societe Generale Solution Center",
    location: "Bengaluru",
    period: "Jan 2019 \u2013 Nov 2022",
    team: "Promoted from Intern (Jan 2019) to Software Engineer (Apr 2019) to Senior Software Engineer (Jul 2022)",
    highlights: [
      "Architected an ML-driven network-troubleshooting platform that reduced MTTR on critical incidents.",
      "Built a global ticket-escalation platform (Angular, Flask, PostgreSQL) used by teams across 6 regions.",
      "Automated over 80% of Cisco, Infoblox and Netshot configuration workflows using Ansible/AWX, reducing DNS-processing time by 70%.",
    ],
  },
];

export type SkillGroup = { label: string; items: string[] };

export const skillGroups: SkillGroup[] = [
  {
    label: "Languages",
    items: ["Python", "Go", "TypeScript / JavaScript", "SQL"],
  },
  {
    label: "AI & Developer Infrastructure",
    items: [
      "Claude Code",
      "Codex",
      "MCP / FastMCP",
      "LangGraph",
      "LiteLLM",
      "Portkey",
      "AWS Bedrock",
      "Langfuse",
      "HoneyHive",
    ],
  },
  {
    label: "Platform & Cloud",
    items: [
      "AWS",
      "Docker",
      "Kubernetes",
      "Terraform",
      "Ansible / AWX",
      "GitHub Actions",
      "Jenkins",
      "Airflow",
      "Vault",
      "OIDC",
      "CI/CD",
      "OpenTelemetry",
    ],
  },
  {
    label: "Backend & Data",
    items: [
      "FastAPI",
      "Node.js",
      "REST",
      "gRPC",
      "PostgreSQL",
      "MongoDB",
      "Redis",
      "RabbitMQ",
      "ZeroMQ",
    ],
  },
];

export type Project = {
  name: string;
  stack: string;
  description: string;
  impact: string;
};

// Open-source contributions and side projects, as listed on the PDF resume.
export const projects: Project[] = [
  {
    name: "vLLM",
    stack: "Python",
    description:
      "Bugfix for multimodal image-size handling in the vLLM inference engine.",
    impact: "Merged upstream.",
  },
  {
    name: "Omnigent",
    stack: "Python, Google IAP",
    description:
      "Agent workspace attachments and Google IAP header authentication.",
    impact: "Merged upstream.",
  },
  {
    name: "Deckle",
    stack: "Swift, SwiftUI, AppKit",
    description:
      "Notarized macOS menu-bar app, distributed through a Homebrew tap.",
    impact: "Shipped and notarized.",
  },
];

export type Education = { degree: string; school: string; period: string };

export const education: Education[] = [
  {
    degree: "M.Tech, Software Engineering",
    school: "BITS Pilani, Rajasthan",
    period: "Jul 2021 \u2013 Jun 2023",
  },
  {
    degree: "B.E., Computer Science",
    school: "PSG College of Technology, Coimbatore",
    period: "Aug 2014 \u2013 May 2019",
  },
  {
    degree: "AWS Certified Solutions Architect \u2013 Associate",
    school: "Amazon Web Services",
    period: "Credential",
  },
];

// Hosted PDF version of the resume (lives in /public). Empty hides the button.
export const resumePdfUrl = "/akshat_katiyar_resume.pdf";

export type Book = {
  title: string;
  author: string;
  cover: string;
  description: string;
};

export const books: Book[] = [
  {
    title: "Fooled by Randomness",
    author: "Nassim Nicholas Taleb",
    cover: "/images/fooled_by_randomness.jpeg",
    description:
      "An examination of the underestimated role of chance in life and the markets, challenging how we think about success and failure.",
  },
  {
    title: "The Psychology of Money",
    author: "Morgan Housel",
    cover: "/images/psychology_of_money.jpeg",
    description:
      "Exploring the complex relationship between money and human behavior through 19 short stories about wealth, greed, and happiness.",
  },
  {
    title: "Database Design and Implementation",
    author: "Edward Sciore",
    cover: "/images/database_design_and_implementation.jpeg",
    description:
      "A comprehensive guide to database system concepts, architecture, and implementation techniques.",
  },
  {
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    cover: "/images/ddia.png",
    description:
      "A deep dive into building scalable, reliable, and maintainable data systems, exploring the principles and practices of modern data architecture.",
  },
  {
    title: "Understanding Distributed Systems",
    author: "Roberto Vitillo",
    cover: "/images/understanding_distributed_systems.jpeg",
    description:
      "A practical guide to the fundamental concepts and patterns behind modern distributed systems.",
  },
  {
    title: "Building a Career in Software",
    author: "Daniel Heller",
    cover: "/images/building_a_career_in_software.jpeg",
    description:
      "A practical handbook for software engineers navigating their career path, from technical growth to professional development.",
  },
];

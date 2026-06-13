// Static content for the resume + bookshelf pages. Kept as data so the pages
// stay presentational. Resume content mirrors akshat_katiyar_resume.pdf.

export const summary =
  "Senior Backend Engineer with 7+ years shipping production Python and Go services, REST APIs, and PostgreSQL-backed platforms end to end. Builds GenAI products (RAG, LLM agents, OpenAI, LiteLLM/Portkey routing, Qdrant) and uses Claude daily to accelerate delivery while maintaining code-review discipline. Proven in global, regulated environments (banking, observability) with strong DevOps and full-stack (Angular) delivery.";

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
    company: "CBA India (Commonwealth Bank)",
    location: "Bengaluru",
    period: "May 2023 – Present",
    highlights: [
      "Prototyped a GenAI network chatbot with LiteLLM multi-model routing and Portkey observability, cutting domain Q&A resolution time by 30% for network operations.",
      "Built and published 'cbapysnow', a reusable Python package for ServiceNow integration that reduced script development time by 25% across teams.",
      "Led backend architecture and API design in Python and Go for business-critical platforms; shipped features through code review, testing, and release cycles.",
      "Delivered an F5 automation POC (FastAPI, Airflow, AWS) end to end, demonstrating a 40% reduction in manual operational tasks.",
      "Shipped F5Portal (Python backend, JavaScript UI) end to end, reducing operational data retrieval time by 30%.",
    ],
  },
  {
    title: "Software Engineer III",
    company: "AppDynamics (Cisco)",
    location: "Bengaluru",
    period: "Nov 2022 – May 2023",
    highlights: [
      "Owned production-quality improvements on the Python Agent, shipping fixes for customer-facing observability at scale.",
      "Built Ansible-based agent lifecycle automation (install/upgrade/rollback/uninstall) across VMs, cutting deployment time by 50%+ and improving release reliability.",
      "Built high-throughput IPC with ZeroMQ between core services, improving data throughput by 20% for real-time monitoring pipelines.",
    ],
  },
  {
    title: "Software Engineering Specialist",
    company: "Societe Generale Solution Center",
    location: "Bengaluru",
    period: "Jan 2019 – Nov 2022",
    highlights: [
      "Promoted to Senior Software Engineer (July 2022) for consistent delivery and technical leadership.",
      "Built and deployed FTS Portal (Angular frontend, Flask REST APIs, PostgreSQL) end to end, used by teams across 6 global regions for ticket escalation and async handoffs.",
      "Architected Alert Management, an ML-driven application for proactive incident detection, reducing MTTR for critical incidents by 25%.",
      "Developed Marley Automation (Ansible-backed APIs, Jenkins CI/CD, Kibana dashboards), automating 80%+ of routine Cisco switch configuration tasks.",
    ],
  },
];

export type SkillGroup = { label: string; items: string[] };

export const skillGroups: SkillGroup[] = [
  {
    label: "Languages",
    items: [
      "Python (FastAPI, Flask, Django, asyncio)",
      "Go",
      "JavaScript",
      "TypeScript",
      "SQL",
    ],
  },
  {
    label: "Backend & Data",
    items: [
      "REST / gRPC APIs",
      "PostgreSQL",
      "SQLAlchemy",
      "MongoDB",
      "Redis",
      "DynamoDB",
      "RabbitMQ",
      "System Design",
    ],
  },
  {
    label: "AI / ML",
    items: [
      "Claude",
      "Cursor",
      "OpenAI",
      "LangChain",
      "LiteLLM",
      "Portkey",
      "RAG",
      "Prompt Engineering",
      "FAISS",
      "Qdrant",
      "MCP",
      "TensorFlow",
      "PyTorch",
    ],
  },
  {
    label: "DevOps & Cloud",
    items: [
      "Docker",
      "Kubernetes",
      "CI/CD (Jenkins, TeamCity, GitHub Actions)",
      "Ansible",
      "Terraform",
      "Airflow",
      "AWS (Lambda, S3, RDS, SQS, EKS, SageMaker, Bedrock)",
    ],
  },
  {
    label: "Observability & Tools",
    items: ["OpenTelemetry", "F5", "LDAP", "ZeroMQ", "Agile / Scrum"],
  },
];

export type Project = {
  name: string;
  stack: string;
  description: string;
  impact: string;
};

export const projects: Project[] = [
  {
    name: "GenAI Document Q&A (RAG)",
    stack: "Python, LangChain, OpenAI, LiteLLM, Portkey, FAISS, Qdrant",
    description:
      "RAG pipeline with LangChain, OpenAI embeddings, FAISS and Qdrant retrieval, and LiteLLM/Portkey for model routing and gateway observability; answer relevance evaluated end to end.",
    impact: "85% better relevance on complex queries; 60% faster retrieval.",
  },
  {
    name: "Scalable Event Processing Service",
    stack: "Go, AWS Lambda, SQS, DynamoDB",
    description:
      "Serverless backend ingesting events via SQS, transforming in Lambda, and persisting to DynamoDB.",
    impact: "100k events/day · sub-200ms latency · 99.99% uptime.",
  },
  {
    name: "Cloud Log Analysis Pipeline",
    stack: "Go, AWS S3, Elasticsearch, Kibana",
    description:
      "Scalable log ingestion and search backend with ELK visualization.",
    impact: "40% faster log queries vs. the prior system.",
  },
];

export type Education = { degree: string; school: string; period: string };

export const education: Education[] = [
  {
    degree: "M.Tech, Software Engineering",
    school: "BITS Pilani, Rajasthan",
    period: "Jul 2021 – Jun 2023",
  },
  {
    degree: "B.E., Computer Science",
    school: "PSG College of Technology, Coimbatore",
    period: "Aug 2014 – May 2019",
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

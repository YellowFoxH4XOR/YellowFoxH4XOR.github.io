// Static content migrated from the old bookshelf.html / resume.html.
// Kept as data so the pages stay presentational.

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
    company: "Commonwealth Bank",
    location: "Bangalore, India",
    period: "May 2023 – Present",
    team: "Secure Network Services",
    highlights: [
      "Built core components for monitoring the network and performing automated changes within it.",
      "Led schema modularization efforts, enabling better maintainability and flexible deployments.",
      "Improved developer tooling with Python-based libraries.",
      "Mentored interns, guiding them through impactful projects.",
    ],
  },
];

export const skills = [
  "Angular",
  "Python",
  "Go",
  "SQL",
  "Compilers",
  "Design",
  "Quick Prototyping",
];

// Optional: link to a hosted PDF version of the resume. Empty hides the button.
export const resumePdfUrl = "";

// Shared, node-free presentation helpers for the homepage and archive.
export const postTopics = [
  { id: "all", label: "Everything" },
  { id: "ai", label: "AI infrastructure" },
  { id: "systems", label: "Systems" },
  { id: "languages", label: "Python & Go" },
] as const;

export function matchesTopic(tags: string[], topic: string) {
  if (topic === "ai") {
    return tags.some((tag) => ["ai", "llm", "agents", "mcp", "rag"].includes(tag));
  }
  if (topic === "systems") {
    return tags.some((tag) => ["systems", "backend", "databases", "postgres"].includes(tag));
  }
  if (topic === "languages") {
    return tags.some((tag) => ["python", "go"].includes(tag));
  }
  return true;
}

export function postCategory(tags: string[]) {
  if (matchesTopic(tags, "ai")) return "AI infrastructure";
  if (matchesTopic(tags, "systems")) return "Distributed systems";
  return "Python & Go";
}

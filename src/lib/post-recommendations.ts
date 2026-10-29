import type { PostMeta } from "./blog";

// Prefer shared, specific subjects over ubiquitous tags such as "architecture".
// Links remain server-rendered and use only existing original articles.
export function relatedPosts(post: PostMeta, posts: PostMeta[], limit = 3) {
  const frequency = new Map<string, number>();
  for (const candidate of posts) {
    for (const tag of new Set(candidate.tags)) frequency.set(tag, (frequency.get(tag) ?? 0) + 1);
  }
  return posts
    .filter((candidate) => candidate.slug !== post.slug)
    .map((candidate) => ({
      post: candidate,
      score: [...new Set(candidate.tags)].reduce((score, tag) =>
        score + (post.tags.includes(tag) ? 1 / (frequency.get(tag) ?? 1) : 0), 0),
    }))
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score || b.post.date.localeCompare(a.post.date) || a.post.slug.localeCompare(b.post.slug))
    .slice(0, Math.max(0, limit))
    .map((candidate) => candidate.post);
}

// Fail clearly instead of publishing fabricated dates or empty search snippets.
export function validatePostFrontmatter(data: Record<string, unknown>, slug: string) {
  const fail = (field: string): never => {
    throw new Error(`Invalid ${field} in content/blog/${slug}: check the post frontmatter.`);
  };
  const title = typeof data.title === "string" ? data.title.trim() : "";
  const excerpt = typeof data.excerpt === "string" ? data.excerpt.trim() : "";
  if (!title) fail("title");
  if (!excerpt) fail("excerpt");
  const date = data.date instanceof Date && !Number.isNaN(data.date.valueOf())
    ? data.date.toISOString().slice(0, 10)
    : typeof data.date === "string" ? data.date.trim() : "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) fail("publication date");
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== date) fail("publication date");
  if (!Array.isArray(data.tags) || !data.tags.every((tag) => typeof tag === "string" && tag.trim())) fail("tags");
  const tags = [...new Set((data.tags as string[]).map((tag) => tag.trim()))];
  return { title, excerpt, date, tags };
}

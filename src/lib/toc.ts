import GithubSlugger from "github-slugger";

export type TocItem = {
  /** Matches the id rehype-slug puts on the rendered heading. */
  id: string;
  text: string;
  depth: 2 | 3;
};

/**
 * Strip the inline markdown a heading might carry, so the text we slug matches
 * the text content rehype-slug sees after the markdown is rendered.
 *
 * Order matters: links are unwrapped before emphasis, so `[**x**](url)` ends
 * up as `x` rather than `**x**`.
 */
function plainText(raw: string): string {
  return raw
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1") // images -> alt
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links -> label
    .replace(/`([^`]+)`/g, "$1") // inline code
    .replace(/(\*\*|__)(.*?)\1/g, "$2") // bold
    .replace(/(\*|_)(.*?)\1/g, "$2") // italic
    .replace(/~~(.*?)~~/g, "$1") // strikethrough
    .replace(/<[^>]+>/g, "") // stray inline html
    .trim();
}

/**
 * Build a table of contents from raw post markdown.
 *
 * The slugger is fed every heading level, not just the ones we return, because
 * GithubSlugger dedupes by appending `-1`, `-2`, and rehype-slug walks the
 * whole document. Skipping h1 here would drift the suffixes out of sync with
 * the ids actually rendered into the page.
 *
 * Fenced code blocks are skipped so a `# comment` inside a shell sample never
 * becomes a heading.
 */
export function extractToc(markdown: string): TocItem[] {
  const slugger = new GithubSlugger();
  const items: TocItem[] = [];
  let fence: string | null = null;

  for (const line of markdown.split("\n")) {
    const fenceMatch = /^\s{0,3}(`{3,}|~{3,})/.exec(line);
    if (fenceMatch) {
      const marker = fenceMatch[1][0];
      if (fence === null) fence = marker;
      else if (fence === marker) fence = null;
      continue;
    }
    if (fence !== null) continue;

    const heading = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!heading) continue;

    const depth = heading[1].length;
    const text = plainText(heading[2]);
    if (!text) continue;

    const id = slugger.slug(text);
    if (depth === 2 || depth === 3) items.push({ id, text, depth });
  }

  return items;
}

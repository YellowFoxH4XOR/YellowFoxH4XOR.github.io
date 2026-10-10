// Aggregates recent posts from big-tech engineering blogs via their RSS/Atom
// feeds and writes one JSON file per company to docs-tech-blogs/. Stores only
// metadata (title, link, date, short summary) and links out to the original —
// no article text is reproduced. Run with: node scripts/fetch-tech-blogs.mjs
// (or `npm run fetch-tech-blogs`). A scheduled GitHub Action runs this and
// commits the output; `next build` only ever reads the committed JSON.
import { XMLParser } from "fast-xml-parser";
import { writeFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";

// Curated big-tech engineering blogs. Adding/removing a company is a one-line
// edit here. Feeds marked VERIFY are lower-confidence URLs that may drift — a
// dead feed is logged and skipped (see the per-feed try/catch), never fatal.
const SOURCES = [
  { company: "Airbnb", companySlug: "airbnb", feedUrl: "https://medium.com/feed/airbnb-engineering", homepage: "https://medium.com/airbnb-engineering" },
  { company: "Meta", companySlug: "meta", feedUrl: "https://engineering.fb.com/feed/", homepage: "https://engineering.fb.com" },
  { company: "Netflix", companySlug: "netflix", feedUrl: "https://medium.com/feed/netflix-techblog", homepage: "https://netflixtechblog.com" },
  { company: "Cloudflare", companySlug: "cloudflare", feedUrl: "https://blog.cloudflare.com/rss/", homepage: "https://blog.cloudflare.com" },
  { company: "GitHub", companySlug: "github", feedUrl: "https://github.blog/feed/", homepage: "https://github.blog" },
  { company: "AWS", companySlug: "aws", feedUrl: "https://aws.amazon.com/blogs/aws/feed/", homepage: "https://aws.amazon.com/blogs/aws" },
  { company: "Spotify", companySlug: "spotify", feedUrl: "https://engineering.atspotify.com/feed/", homepage: "https://engineering.atspotify.com" },
  { company: "Pinterest", companySlug: "pinterest", feedUrl: "https://medium.com/feed/pinterest-engineering", homepage: "https://medium.com/pinterest-engineering" },
  { company: "Microsoft", companySlug: "microsoft", feedUrl: "https://devblogs.microsoft.com/feed/", homepage: "https://devblogs.microsoft.com" },
  { company: "Apple", companySlug: "apple", feedUrl: "https://machinelearning.apple.com/rss.xml", homepage: "https://machinelearning.apple.com" },
  { company: "Mozilla", companySlug: "mozilla", feedUrl: "https://hacks.mozilla.org/feed/", homepage: "https://hacks.mozilla.org" },
  { company: "Slack", companySlug: "slack", feedUrl: "https://slack.engineering/feed/", homepage: "https://slack.engineering" },
  { company: "Lyft", companySlug: "lyft", feedUrl: "https://medium.com/feed/lyft-engineering", homepage: "https://eng.lyft.com" },
  { company: "Yelp", companySlug: "yelp", feedUrl: "https://engineeringblog.yelp.com/feed.xml", homepage: "https://engineeringblog.yelp.com" },
  { company: "Hugging Face", companySlug: "huggingface", feedUrl: "https://huggingface.co/blog/feed.xml", homepage: "https://huggingface.co/blog" },
  { company: "NVIDIA", companySlug: "nvidia", feedUrl: "https://developer.nvidia.com/blog/feed/", homepage: "https://developer.nvidia.com/blog" },
  { company: "Google", companySlug: "google", feedUrl: "https://blog.research.google/feeds/posts/default?alt=rss", homepage: "https://research.google/blog" },
  { company: "Grab", companySlug: "grab", feedUrl: "https://engineering.grab.com/feed.xml", homepage: "https://engineering.grab.com" },
  { company: "Instacart", companySlug: "instacart", feedUrl: "https://medium.com/feed/tech-at-instacart", homepage: "https://tech.instacart.com" },
  { company: "Salesforce", companySlug: "salesforce", feedUrl: "https://engineering.salesforce.com/feed/", homepage: "https://engineering.salesforce.com" },
  // VERIFY — lower-confidence feed URLs; kept best-effort.
  { company: "OpenAI", companySlug: "openai", feedUrl: "https://openai.com/news/rss.xml", homepage: "https://openai.com/news" }, // VERIFY
  { company: "Stripe", companySlug: "stripe", feedUrl: "https://stripe.com/blog/feed.rss", homepage: "https://stripe.com/blog" }, // VERIFY
  { company: "Discord", companySlug: "discord", feedUrl: "https://discord.com/blog/rss.xml", homepage: "https://discord.com/blog" }, // VERIFY
  { company: "Dropbox", companySlug: "dropbox", feedUrl: "https://dropbox.tech/feed", homepage: "https://dropbox.tech" }, // VERIFY
  { company: "Etsy", companySlug: "etsy", feedUrl: "https://www.etsy.com/codeascraft/rss", homepage: "https://www.etsy.com/codeascraft" }, // VERIFY
  { company: "PayPal", companySlug: "paypal", feedUrl: "https://medium.com/feed/paypal-tech", homepage: "https://medium.com/paypal-tech" }, // VERIFY
  { company: "GitLab", companySlug: "gitlab", feedUrl: "https://about.gitlab.com/atom.xml", homepage: "https://about.gitlab.com/blog" }, // VERIFY

  // --- AI labs (Anthropic / Meta AI / Cohere / Mistral have no working public
  // RSS as of this writing — omitted rather than shipped broken) ---
  { company: "Google DeepMind", companySlug: "deepmind", feedUrl: "https://deepmind.google/blog/rss.xml", homepage: "https://deepmind.google/discover/blog" },
  { company: "Microsoft Research", companySlug: "msft-research", feedUrl: "https://www.microsoft.com/en-us/research/feed/", homepage: "https://www.microsoft.com/en-us/research" },
  { company: "BAIR (Berkeley)", companySlug: "bair", feedUrl: "https://bair.berkeley.edu/blog/feed.xml", homepage: "https://bair.berkeley.edu/blog" },
  { company: "Stanford AI Lab", companySlug: "stanford-ai", feedUrl: "https://ai.stanford.edu/blog/feed.xml", homepage: "https://ai.stanford.edu/blog" },

  // AI labs without a native public RSS — syndicated via Google News scoped to
  // their domain. Links resolve through a news.google.com redirect to the real
  // post; titles have Google's " - <Source>" suffix stripped (googleNews flag).
  { company: "Anthropic", companySlug: "anthropic", feedUrl: "https://news.google.com/rss/search?q=site:anthropic.com/news%20when:365d&hl=en-US&gl=US&ceid=US:en", homepage: "https://www.anthropic.com/news", googleNews: true },
  { company: "Mistral AI", companySlug: "mistral", feedUrl: "https://news.google.com/rss/search?q=site:mistral.ai/news%20when:365d&hl=en-US&gl=US&ceid=US:en", homepage: "https://mistral.ai/news", googleNews: true },
  { company: "Cohere", companySlug: "cohere", feedUrl: "https://news.google.com/rss/search?q=site:cohere.com/blog%20when:365d&hl=en-US&gl=US&ceid=US:en", homepage: "https://cohere.com/blog", googleNews: true },

  // --- Latest AI research: arXiv export API (Atom), sorted by submission date.
  // The export API always returns recent papers, unlike the rss.arxiv.org feeds
  // which are empty between daily announcements.
  { company: "arXiv · AI", companySlug: "arxiv-ai", feedUrl: "https://export.arxiv.org/api/query?search_query=cat:cs.AI&sortBy=submittedDate&sortOrder=descending&max_results=50", homepage: "https://arxiv.org/list/cs.AI/recent" },
  { company: "arXiv · ML", companySlug: "arxiv-ml", feedUrl: "https://export.arxiv.org/api/query?search_query=cat:cs.LG&sortBy=submittedDate&sortOrder=descending&max_results=50", homepage: "https://arxiv.org/list/cs.LG/recent" },
  { company: "arXiv · NLP", companySlug: "arxiv-nlp", feedUrl: "https://export.arxiv.org/api/query?search_query=cat:cs.CL&sortBy=submittedDate&sortOrder=descending&max_results=50", homepage: "https://arxiv.org/list/cs.CL/recent" },
];

const MAX_PER_COMPANY = 50; // newest N kept per company, accumulated across runs
const SUMMARY_MAX_CHARS = 220;
const FETCH_TIMEOUT_MS = 12_000;
const OUT_DIR = path.join(process.cwd(), "docs-tech-blogs");

// fast-xml-parser handles CDATA and namespace-prefixed tags (content:encoded)
// that a regex would choke on. parseTagValue:false keeps everything a string so
// dates/numbers aren't coerced.
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  parseTagValue: false,
  trimValues: true,
});

// Many feeds return a single <item> as an object rather than a one-element
// array; this normalizes both shapes.
const asArray = (x) => (Array.isArray(x) ? x : x == null ? [] : [x]);

function stripHtml(html) {
  if (!html) return "";
  const text = String(html)
    .replace(/<[^>]+>/g, " ") // drop tags
    .replace(/&[a-z]+;|&#\d+;/gi, " ") // drop entities
    .replace(/\s+/g, " ")
    .trim();
  return text.length > SUMMARY_MAX_CHARS
    ? text.slice(0, SUMMARY_MAX_CHARS).trimEnd() + "…"
    : text;
}

function normalizeDate(raw) {
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

// Atom <link> may be a string, an object, or an array of {@_href,@_rel}.
// Prefer rel="alternate" (the human-readable page), else the first href.
function atomLink(link) {
  const links = asArray(link);
  const alt = links.find((l) => l && l["@_rel"] === "alternate" && l["@_href"]);
  const any = links.find((l) => l && l["@_href"]);
  return (alt && alt["@_href"]) || (any && any["@_href"]) || "";
}

// Title/summary fields can be a plain string or { "#text": "..." } (when they
// carry attributes like type="html").
const textOf = (v) => (v && typeof v === "object" ? v["#text"] ?? "" : v ?? "");

function parseFeed(xml) {
  const obj = parser.parse(xml);

  if (obj?.rss?.channel) {
    return asArray(obj.rss.channel.item).map((item) => ({
      title: textOf(item.title),
      url: typeof item.link === "string" ? item.link : textOf(item.link),
      dateRaw: item.pubDate ?? item["dc:date"] ?? item.date,
      summaryRaw: item.description ?? item["content:encoded"] ?? "",
    }));
  }

  if (obj?.feed?.entry) {
    return asArray(obj.feed.entry).map((entry) => ({
      title: textOf(entry.title),
      url: atomLink(entry.link),
      dateRaw: entry.published ?? entry.updated,
      summaryRaw: textOf(entry.summary) || textOf(entry.content) || "",
    }));
  }

  throw new Error("not a recognized RSS or Atom feed");
}

async function fetchAndParse(source) {
  const res = await fetch(source.feedUrl, {
    headers: {
      "User-Agent":
        "akshatkatiyar.com-feed-aggregator/1.0 (+https://akshatkatiyar.com)",
      Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const xml = await res.text();

  return parseFeed(xml)
    .map((e) => {
      let title = String(e.title ?? "").replace(/\s+/g, " ").trim();
      // Google News appends " - <Source>" to every title (the source name may
      // itself contain hyphens, e.g. "www-cdn.anthropic.com"), so split on the
      // " - " separator and drop the last segment rather than regex-trimming.
      if (source.googleNews) {
        const parts = title.split(" - ");
        if (parts.length > 1) title = parts.slice(0, -1).join(" - ").trim();
      }
      return {
        company: source.company,
        companySlug: source.companySlug,
        title,
        url: String(e.url ?? "").trim(),
        date: normalizeDate(e.dateRaw),
        // Google News descriptions just echo the title — blank them so cards
        // aren't redundant; the title carries the signal.
        summary: source.googleNews ? "" : stripHtml(e.summaryRaw),
      };
    })
    .filter((e) => e.title && e.url && e.date) // drop incomplete entries
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, MAX_PER_COMPANY);
}

// Read a company's previously-committed entries (empty if first run).
async function readExisting(p) {
  try {
    return JSON.parse(await readFile(p, "utf8"));
  } catch {
    return [];
  }
}

// Dedupe by URL with the query string stripped — Medium/Google News append
// per-fetch tracking params that would otherwise make the same article look new
// on every run and flood the merge with duplicates.
const dedupeKey = (e) => String(e.url || "").split("?")[0];

// Accumulate: new entries take precedence, then prior ones, deduped, newest
// first, capped at MAX_PER_COMPANY. This grows the archive toward the cap
// instead of overwriting it with each run's rolling window.
function mergeEntries(existing, fresh) {
  const byKey = new Map();
  for (const e of [...fresh, ...existing]) {
    const k = dedupeKey(e);
    if (k && !byKey.has(k)) byKey.set(k, e);
  }
  return [...byKey.values()]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, MAX_PER_COMPANY);
}

// --- main -------------------------------------------------------------------

// Fail loud on a config mistake rather than silently overwriting one company's
// file with another's.
const slugs = new Set();
for (const s of SOURCES) {
  if (slugs.has(s.companySlug)) throw new Error(`duplicate companySlug: ${s.companySlug}`);
  slugs.add(s.companySlug);
}

await mkdir(OUT_DIR, { recursive: true });

let ok = 0;
let failed = 0;
let totalEntries = 0;

// Sequential (not Promise.all) to avoid hammering hosts and tripping rate limits.
for (const source of SOURCES) {
  try {
    const fresh = await fetchAndParse(source);
    if (fresh.length === 0) {
      console.warn(`[WARN] ${source.company}: 0 usable entries (feed empty or unparsed)`);
    }
    const outPath = path.join(OUT_DIR, `${source.companySlug}.json`);
    const merged = mergeEntries(await readExisting(outPath), fresh);
    await writeFile(outPath, JSON.stringify(merged, null, 2) + "\n", "utf8");
    totalEntries += merged.length;
    ok++;
    console.log(`[OK]  ${source.company}: ${merged.length} kept (${fresh.length} fetched)`);
  } catch (err) {
    failed++;
    console.error(`[ERR] ${source.company} (${source.feedUrl}): ${err.message}`);
  }
}

console.log(
  `\nDone. ${ok}/${SOURCES.length} feeds OK, ${failed} failed, ${totalEntries} entries written to docs-tech-blogs/.`,
);

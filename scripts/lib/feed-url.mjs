// Feed links may be relative to the feed's final URL. Never publish them as
// local portfolio paths, or accept executable/non-web schemes from a feed.
// These two feed hosts were checked to serve their article paths over HTTPS.
// Do not assume an HTTPS equivalent exists for every third-party HTTP URL.
const HTTPS_FEED_HOSTS = new Set(["bair.berkeley.edu", "blog.research.google"]);

export function normalizeFeedURL(raw, baseURL) {
  if (typeof raw !== "string" || !raw.trim()) return null;
  try {
    const url = new URL(raw.trim(), baseURL);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) return null;
    if (url.protocol === "http:" && !url.port && HTTPS_FEED_HOSTS.has(url.hostname)) url.protocol = "https:";
    return url.href;
  } catch {
    return null;
  }
}

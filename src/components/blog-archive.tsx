"use client";

import Link from "next/link";
import { useRef, useSyncExternalStore } from "react";
import { Search } from "lucide-react";
import type { PostMeta } from "@/lib/blog";
import { formatDate } from "@/lib/utils";
import { matchesTopic, postCategory, postTopics } from "@/lib/post-topics";

function subscribe(callback: () => void) {
  window.addEventListener("popstate", callback);
  window.addEventListener("archive-filters", callback);
  return () => {
    window.removeEventListener("popstate", callback);
    window.removeEventListener("archive-filters", callback);
  };
}
const snapshot = () => window.location.search;
const serverSnapshot = () => "";

export function BlogArchive({ posts }: { posts: PostMeta[] }) {
  // The server snapshot includes every post. After hydration, URL state is
  // restored without replacing the crawlable archive with a loading fallback.
  const params = new URLSearchParams(
    useSyncExternalStore(subscribe, snapshot, serverSnapshot),
  );
  const query = params.get("q") ?? "";
  const topic = postTopics.find((item) => item.id === params.get("topic"))?.id ?? "all";
  const search = useRef<HTMLInputElement>(null);
  const update = (q: string, selected: string) => {
    const url = new URL(window.location.href);
    if (q) url.searchParams.set("q", q);
    else url.searchParams.delete("q");
    if (selected === "all") url.searchParams.delete("topic");
    else url.searchParams.set("topic", selected);
    window.history.replaceState(null, "", url);
    window.dispatchEvent(new Event("archive-filters"));
  };
  const filtered = posts.filter((post) =>
    matchesTopic(post.tags, topic) &&
    [post.title, post.excerpt, postCategory(post.tags), ...post.tags]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase().trim()),
  );

  return (
    <section data-od-id="writing-archive" aria-label="All essays">
      <div className="archive-tools">
        <div className="archive-filters" role="group" aria-label="Filter essays by topic">
          {postTopics.map((item) => (
            <button
              className="archive-filter"
              key={item.id}
              type="button"
              aria-pressed={topic === item.id}
              onClick={() => update(query, item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <label className="archive-search">
          <Search aria-hidden className="size-5 shrink-0" />
          <span className="sr-only">Search essays by title, topic or keyword</span>
          <input
            ref={search}
            type="search"
            placeholder="Search essays"
            value={query}
            onChange={(event) => update(event.target.value, topic)}
            aria-controls="post-list"
          />
        </label>
      </div>
      <div className="archive-summary">
        <span role="status" aria-live="polite" aria-atomic="true">
          {filtered.length === posts.length
            ? `${posts.length} essays`
            : `${filtered.length} of ${posts.length} essays`}
        </span>
        <span>Newest first</span>
      </div>
      <div id="post-list">
        {filtered.map((post) => (
          <article className="archive-row" key={post.slug}>
            <time className="archive-date" dateTime={post.date}>
              {formatDate(post.date)}
            </time>
            <div>
              <h2><Link href={`/blog/${post.slug}`}>{post.title}</Link></h2>
              <p>{post.excerpt}</p>
            </div>
            <p className="archive-category">
              {postCategory(post.tags)}<br />
              <span className="text-muted-foreground">{post.readingTime}</span>
            </p>
          </article>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="archive-empty">
          <h2>No matching essays</h2>
          <p>Try another keyword or clear the filters to see everything.</p>
          <button
            className="primary-link"
            type="button"
            onClick={() => { update("", "all"); search.current?.focus(); }}
          >
            Clear filters
          </button>
        </div>
      )}
    </section>
  );
}

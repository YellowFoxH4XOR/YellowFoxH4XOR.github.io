import Link from "next/link";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SparkIcon } from "@/components/icons";
import { TechBlogCard } from "@/components/tech-blog-card";
import { TechBlogPagination } from "@/components/tech-blog-pagination";
import { TECH_BLOG_PAGE_SIZE, techBlogSearchPath } from "@/lib/tech-blog-pagination";
import type { TechBlogEntry, CompanyFacet } from "@/lib/tech-blogs";

type Props = {
  entries: TechBlogEntry[];
  companies: CompanyFacet[];
  totalEntries: number;
  totalResults: number;
  page: number;
  totalPages: number;
  query?: string;
  source?: string;
};

// Only the visible slice is rendered, and no full-archive prop is serialized
// into a Client Component. The GET form and source/page links also work with JS off.
export function TechBlogList({ entries, companies, totalEntries, totalResults, page, totalPages, query = "", source = "" }: Props) {
  const active = companies.find((company) => company.slug === source);
  const railItem = (selected: boolean) => cn(
    "group flex min-h-9 w-full items-center gap-2 py-1 text-left font-mono text-meta transition-colors duration-200",
    selected ? "text-brand" : "text-muted-foreground hover:text-foreground",
  );
  const first = totalResults === 0 ? 0 : (page - 1) * TECH_BLOG_PAGE_SIZE + 1;
  const last = (page - 1) * TECH_BLOG_PAGE_SIZE + entries.length;

  return (
    <div className="spread">
      <div className="spread-rail">
        <div className="flex items-center gap-3">
          <SparkIcon className="size-3 shrink-0 text-brand" />
          <h2 className="eyebrow shrink-0">Sources</h2>
          <span aria-hidden className="h-px flex-1 bg-hairline lg:hidden" />
        </div>
        <nav aria-label="Engineering blog sources" className="mt-4 hidden max-h-[calc(100vh-13rem)] overflow-y-auto pr-2 lg:block">
          <Link href={techBlogSearchPath({ query })} prefetch={false} className={railItem(!source)} aria-current={!source ? "page" : undefined}>
            <span className="min-w-0 flex-1">All sources</span><span className="text-subtle">{totalEntries}</span>
          </Link>
          {companies.map((company) => (
            <Link key={company.slug} href={techBlogSearchPath({ query, source: company.slug })} prefetch={false} className={railItem(source === company.slug)} aria-current={source === company.slug ? "page" : undefined}>
              <span className="min-w-0 flex-1">{company.name}</span><span className="text-subtle">{company.count}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="min-w-0">
        <form action="/tech-blogs/search" method="get" role="search" className="mb-5 flex flex-wrap items-center gap-3">
          <div className="w-full lg:hidden">
            <label htmlFor="feed-source" className="sr-only">Filter by source</label>
            <select id="feed-source" name="source" defaultValue={source} className="min-h-11 w-full rounded-md border border-border bg-card px-3 py-2 font-mono text-meta text-foreground">
              <option value="">All sources ({totalEntries})</option>
              {companies.map((company) => <option key={company.slug} value={company.slug}>{company.name} ({company.count})</option>)}
            </select>
          </div>
          <label className="archive-search min-w-0 flex-1">
            <Search aria-hidden className="size-5 shrink-0" />
            <span className="sr-only">Search tech blogs</span>
            <input name="q" type="search" placeholder="Search all articles" defaultValue={query} maxLength={200} />
          </label>
          <button type="submit" className="primary-link">Search</button>
          {query && (
            <Link href={techBlogSearchPath({ source })} prefetch={false} aria-label="Clear search" className="grid size-11 place-items-center rounded-full border border-border">
              <X aria-hidden className="size-4" />
            </Link>
          )}
        </form>
        <p role="status" className="mb-4 font-mono text-meta text-muted-foreground">
          {totalResults > 0 ? `${first}–${last} of ${totalResults} articles` : "0 matching articles"}
          {active ? ` from ${active.name}` : ""}{query ? ` matching “${query}”` : ", newest first"}
        </p>
        {entries.length > 0 ? (
          <div className="divide-y divide-hairline border-y border-hairline" data-feed-results>
            {entries.map((entry) => <TechBlogCard key={`${entry.companySlug}-${entry.url}`} entry={entry} />)}
          </div>
        ) : (
          <div className="archive-empty">
            <h2>No matching articles</h2>
            <p>Try another keyword or source.</p>
            <Link href="/tech-blogs" className="primary-link">Reset filters</Link>
          </div>
        )}
        <TechBlogPagination page={page} totalPages={totalPages} query={query} source={source} />
      </div>
    </div>
  );
}

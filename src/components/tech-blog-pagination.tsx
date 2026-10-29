import Link from "next/link";
import { paginationNumbers, techBlogSearchPath } from "@/lib/tech-blog-pagination";

export function TechBlogPagination({ page, totalPages, query = "", source = "" }: {
  page: number;
  totalPages: number;
  query?: string;
  source?: string;
}) {
  if (totalPages < 2) return null;
  const href = (target: number) => techBlogSearchPath({ page: target, query, source });
  const numbers = paginationNumbers(page, totalPages);

  return (
    <nav className="feed-pagination" aria-label="Article archive pages">
      <div className="flex flex-wrap items-center gap-2">
        {page > 1 && <Link href={href(page - 1)} prefetch={false} rel="prev">Previous</Link>}
        {numbers.map((number, index) => (
          <span key={number} className="inline-flex items-center gap-2">
            {index > 0 && number - numbers[index - 1] > 1 && <span aria-hidden>…</span>}
            <Link href={href(number)} prefetch={false} aria-label={`Page ${number}`} aria-current={page === number ? "page" : undefined}>
              {number}
            </Link>
          </span>
        ))}
        {page < totalPages && <Link href={href(page + 1)} prefetch={false} rel="next">Next</Link>}
      </div>
      <p>Page {page} of {totalPages}</p>
    </nav>
  );
}

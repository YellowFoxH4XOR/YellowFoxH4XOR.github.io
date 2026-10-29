import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema } from "@/lib/seo";
import { site } from "@/lib/site";

export function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  return (
    <>
      <JsonLd data={breadcrumbSchema(items.map((item) => ({ name: item.name, url: `${site.url}${item.path}` })))} />
      <nav aria-label="Breadcrumb" className="mb-5 font-mono text-meta text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {items.map((item, index) => (
            <li key={item.path} className="inline-flex min-h-8 items-center gap-2">
              {index > 0 && <ChevronRight className="size-3" aria-hidden />}
              {index === items.length - 1 ? (
                <span aria-current="page">{item.name}</span>
              ) : (
                <Link href={item.path} className="inline-flex min-h-8 items-center hover:text-foreground">{item.name}</Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

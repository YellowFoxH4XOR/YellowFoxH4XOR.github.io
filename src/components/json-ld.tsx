// Renders a schema.org JSON-LD block. Server-rendered into the static HTML so
// crawlers and AI engines see it without executing JS.
export function JsonLd({ data }: { data: object }) {
  // Escape `<` so a value containing "</script>" can't break out of the tag —
  // the standard safe-injection pattern for JSON-LD.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

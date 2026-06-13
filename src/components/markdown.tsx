import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import "highlight.js/styles/github-dark.css";

// Renders post markdown to HTML at build time (this is a server component).
// remark-gfm: tables/strikethrough/task lists. rehype-highlight: code blocks.
// rehype-slug: heading ids for anchor links.
export function Markdown({ content }: { content: string }) {
  return (
    <div className="article">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, rehypeHighlight]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

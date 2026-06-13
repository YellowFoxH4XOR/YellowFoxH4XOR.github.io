---
title: "How I Write Posts"
date: "2026-06-10"
excerpt: "A quick reference for the markdown features supported on this blog — code, tables, and more."
tags: ["meta", "markdown"]
---

Every post is a markdown file in `content/blog/`. Here's what's supported.

## Frontmatter

Each file starts with a YAML block:

```yaml
---
title: "Your title"
date: "2026-06-10"
excerpt: "One-line summary shown in lists."
tags: ["go", "systems"]
---
```

Set `draft: true` to keep a post out of production builds while you work on it.

## Code blocks

Fenced code is syntax-highlighted automatically:

```go
func main() {
    fmt.Println("hello from a Coolify-hosted blog")
}
```

## Tables and lists

| Feature | Supported |
| ------- | --------- |
| Tables  | ✅        |
| Task lists | ✅     |

- [x] GitHub-flavored markdown
- [x] Syntax highlighting
- [ ] Your next post

Push the file, Coolify rebuilds, and it's live.

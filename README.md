# akshatkatiyar.com

Personal site + blog, built with **Next.js 16 (App Router)**, **Tailwind v4**, and
**shadcn/ui**. Blog posts are markdown files; pushing one to GitHub rebuilds the
site and publishes the post. Deployed via **Docker** on **Coolify**.

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve the production build
```

## Writing a blog post

1. Create a markdown file in `content/blog/`, e.g. `content/blog/my-post.md`.
2. Add frontmatter at the top:

   ```yaml
   ---
   title: "My Post Title"
   date: "2026-06-13"
   excerpt: "One-line summary shown in post lists."
   tags: ["go", "systems"]
   ---
   ```

   - The **filename** (minus `.md`) becomes the URL: `/blog/my-post`.
   - Add `draft: true` to keep a post out of production builds while drafting.
3. Write the body in markdown (GitHub-flavored: tables, task lists, fenced code
   with syntax highlighting all work).
4. Commit and push. Coolify rebuilds and the post goes live.

## Editing site content

- **Name, intro, nav, social links** — `src/lib/site.ts`
- **Resume (experience, skills) and bookshelf** — `src/lib/content.ts`
- **Images / favicons** — `public/images`, `public/favicon`
- **Theme colors** — `src/app/globals.css` (`--brand` is the accent)

## Deploying on Coolify

The app builds into a self-contained image via the multi-stage `Dockerfile`
(`output: "standalone"` in `next.config.ts`).

1. In Coolify: **+ New** → **Application** → connect this GitHub repo.
2. **Build Pack:** select **Dockerfile** (Coolify auto-detects the `Dockerfile`).
3. **Port:** set the exposed port to **3000**.
4. (Optional) **Environment variables:** set `NEXT_PUBLIC_SITE_URL` to your
   canonical public URL (e.g. `https://akshatkatiyar.com`) and make it available
   as a **build-time** variable in Coolify. The Dockerfile passes this build
   argument to `next build`, which generates the canonical URLs, metadata, RSS,
   and sitemap. A runtime-only variable will not update prerendered pages.
5. **Deploy.** Coolify builds the image and starts the container.

### Custom domain

1. In Coolify, set the application's domain to `https://www.akshatkatiyar.com`
   (Coolify provisions HTTPS via Let's Encrypt automatically).
2. At your DNS provider, point the domain at the Coolify server:
   - `A` record for the server's IP, **or** a `CNAME` to the Coolify host.
3. Remove any old GitHub Pages DNS / Pages settings for this domain.

> Note: the old `CNAME` file (a GitHub Pages artifact) was removed — Coolify
> manages the domain in its dashboard, not via a file in the repo.

### Auto-deploy on push

Enable Coolify's GitHub webhook (or "Automatic Deployment") on the application
so every push to the default branch rebuilds and redeploys — which is what makes
"push a markdown file → post goes live" work.

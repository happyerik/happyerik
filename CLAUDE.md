# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is happyerik's personal website/blog, customized from the Astrofy template. It is a **pure static site (SSG)** built with Astro 4 and TailwindCSS, with no SSR adapter. Content is authored in Markdown and managed via Astro Content Collections (Zod schemas). There are no tests, no linting tools, and no CI checks — only a deploy workflow.

The repo also contains `AGENTS.md` and `CodeArch.md` from the upstream Astrofy template. **These are stale**: they describe a `store` content collection, `cv.astro`/`services.astro` pages, and a sitemap integration that have all since been removed from this fork. Trust this file and the actual source tree over those two documents.

## Package Manager & Commands

- **Package manager**: `pnpm` (lockfile: `pnpm-lock.yaml`)
- `pnpm install` — install dependencies
- `pnpm dev` / `pnpm start` — development server
- `pnpm build` — static build (output to `dist/`)
- `pnpm preview` — preview production build locally

## Deployment

`.github/workflows/deploy.yml` builds and deploys to GitHub Pages automatically on every push to `main` (also triggerable via `workflow_dispatch`). **There is no staging step** — pushing to `main` ships to the live site.

The site is served at `https://happyerik.github.io/happyerik` — `astro.config.mjs` sets `site` to `https://happyerik.github.io` and `base` to `/happyerik`. Because of the non-root `base`, every internal link, nav href, and asset path must be prefixed with `import.meta.env.BASE_URL` rather than hardcoded as root-relative (e.g. `/blog`). The established pattern, repeated across pages/components, is:

```js
const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
```

then building hrefs as `` `${base}blog/` `` etc. See `BaseHead.astro`, `Header.astro`, `SideBar.astro`, `SideBarMenu.astro`, `404.astro`, `index.astro`, `PostLayout.astro`, and the blog route files for existing usages. Forgetting this prefix is the most common way to silently break links/images in production while they still work in `pnpm dev`.

There is no `@astrojs/sitemap` integration configured currently (despite `public/robots.txt` having a commented-out `Sitemap:` line and a domain TODO) — sitemap generation was removed from this fork.

## Architecture

### Content Collections (Zod schemas)

Content is defined in `src/content/config.ts`. Only one collection exists: `blog`, sourced from `src/content/blog/*.md`. Schema: `title`, `description`, `pubDate` (coerced date), `updatedDate?`, `heroImage?` (validated via the `image()` helper, not a plain string), `badge?`, `tags?` (array, must be unique — enforced by a Zod `.refine`).

There is no `store` collection in this fork (it existed in the upstream Astrofy template and is still referenced by the stale `AGENTS.md`/`CodeArch.md`).

### Routing & Slug Behavior

File-based routing under `src/pages/`: `index.astro`, `projects.astro`, `404.astro`, `rss.xml.js`, and the blog routes below. There is no `cv.astro` or `services.astro` (removed from the upstream template).

- `src/pages/blog/[...page].astro` — paginated blog list (pageSize: 10).
- `src/pages/blog/[slug].astro` — individual blog post.
- `src/pages/blog/tag/[tag]/[...page].astro` — tag-filtered blog list.

**Slug generation**: `src/lib/createSlug.ts` generates URL slugs from post titles (kebab-case), gated by `GENERATE_SLUG_FROM_TITLE` in `src/config.ts`. If the title is entirely non-ASCII (e.g. pure Chinese) and produces an empty slug, it falls back to the file-based Astro slug. Dynamic routes implement `getStaticPaths()` and `paginate()` for pre-rendering.

### Layout Hierarchy

- `BaseLayout.astro` — root layout: HTML skeleton, conditional `<ViewTransitions />` (gated by `TRANSITION_API` in `src/config.ts`), DaisyUI drawer-based responsive sidebar, header, footer.
- `PostLayout.astro` — wraps blog posts in `BaseLayout` with hero image, title, date, tags, and prose styling.

There is no `StoreItemLayout.astro` in this fork.

**Active sidebar item**: Pages pass `sideBarActiveItemID` to `BaseLayout`, forwarded to `SideBarMenu`. Nav only has three items today (`home`, `projects`, `blog` — see `SideBarMenu.astro`); the item with a matching `id` gets `bg-base-300` applied via a client-side script using `define:vars`.

### Configuration

- `src/config.ts` — `SITE_TITLE`, `SITE_DESCRIPTION`, `GENERATE_SLUG_FROM_TITLE`, `TRANSITION_API`.
- `astro.config.mjs` — `site`, `base` (see Deployment above), integrations: `mdx()`, `tailwind()` only.
- `tailwind.config.cjs` — DaisyUI with `themes: true`, `darkTheme: "dark"`, `@tailwindcss/typography`.
- `tsconfig.json` — path aliases: `@components/*` → `src/components/*`, `@layouts/*` → `src/layouts/*` (used inconsistently; relative imports are also common).

### Styling & Theming

- TailwindCSS utility classes throughout; DaisyUI component classes (`btn`, `badge`, `drawer`, `card`, etc.).
- Theme is set via `data-theme="lofi"` on `<html>` in `BaseLayout.astro`. Change it there to switch the DaisyUI theme site-wide.
- Colors use DaisyUI semantic variables (`bg-base-100`, `bg-base-200`, `text-base-content`).

### Images

Use `astro:assets` `<Image />` with explicit `width`, `height`, and `format="webp"`. Sharp is the configured image service. Blog `heroImage` is validated through the content collection's `image()` helper, so it must resolve to a real image relative to the content file.

### RSS

`src/pages/rss.xml.js` generates an RSS feed from the blog collection using `import.meta.env.SITE`.

## Important Notes

- No test framework, linter, or CI checks are configured — only the GitHub Pages deploy workflow.
- Blog pagination uses dynamic route parameters and is incompatible with SSR deploy configs; this site must stay static (GitHub Pages currently).
- Content is primarily Chinese-language; respect existing tone/voice when editing copy.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Astrofy is a personal portfolio website template built with Astro 4 and TailwindCSS. It is a **pure static site (SSG)** with no SSR adapter. Content is authored in Markdown and managed via Astro Content Collections (Zod schemas). There are no tests, no linting tools, and no CI configured.

## Package Manager & Commands

- **Package manager**: `pnpm` (lockfile: `pnpm-lock.yaml`)
- All commands use `pnpm`:
  - `pnpm install` — install dependencies
  - `pnpm dev` / `pnpm start` — development server
  - `pnpm build` — static build (output to `dist/`)
  - `pnpm preview` — preview production build locally

## Architecture

### Content Collections (Zod schemas)

Content is defined in `src/content/config.ts` and lives under `src/content/`:

- `blog` — posts in `src/content/blog/*.md`. Schema: `title`, `description`, `pubDate`, `updatedDate?`, `heroImage?`, `badge?`, `tags?` (unique array).
- `store` — items in `src/content/store/*.md`. Schema: `title`, `description`, `custom_link_label`, `custom_link?`, `updatedDate`, `pricing?`, `oldPricing?`, `badge?`, `checkoutUrl?`, `heroImage?`.

### Routing & Slug Behavior

File-based routing under `src/pages/`. Key dynamic routes:

- `src/pages/blog/[...page].astro` — paginated blog list (pageSize: 10).
- `src/pages/blog/[slug].astro` — individual blog post.
- `src/pages/blog/tag/[tag]/[...page].astro` — tag-filtered blog list.
- `src/pages/store/[...page].astro` — paginated store list.
- `src/pages/store/[slug].astro` — individual store item.

**Slug generation**: `src/lib/createSlug.ts` generates URL slugs from post titles (kebab-case). This is gated by `GENERATE_SLUG_FROM_TITLE` in `src/config.ts`. When `true`, the title-derived slug is used; when `false`, the file-based Astro slug is used.

Dynamic routes implement `getStaticPaths()` and `paginate()` for pre-rendering.

### Layout Hierarchy

- `BaseLayout.astro` — root layout with HTML skeleton, `<ViewTransitions />`, DaisyUI drawer-based responsive sidebar, header, and footer.
- `PostLayout.astro` — wraps blog posts in `BaseLayout` with hero image, title, date, tags, and prose styling.
- `StoreItemLayout.astro` — wraps store items in `BaseLayout`.

**Active sidebar item**: Pages pass `sideBarActiveItemID` to `BaseLayout`, which forwards it to `SideBarMenu`. The menu item with a matching `id` gets a highlight class applied via a client-side script using `define:vars`.

### Configuration

- `src/config.ts` — site-wide constants: `SITE_TITLE`, `SITE_DESCRIPTION`, `GENERATE_SLUG_FROM_TITLE`, `TRANSITION_API`.
- `astro.config.mjs` — `site` URL and integrations (`mdx`, `sitemap`, `tailwind`).
- `tailwind.config.cjs` — DaisyUI with `themes: true`, `darkTheme: "dark"`, and `@tailwindcss/typography`.
- `tsconfig.json` — path aliases: `@components/*` → `src/components/*`, `@layouts/*` → `src/layouts/*`.

### Styling & Theming

- TailwindCSS utility classes throughout.
- DaisyUI provides component classes (`btn`, `badge`, `drawer`, `card`, etc.).
- Theme is set via `data-theme="lofi"` on the `<html>` tag in `BaseLayout.astro`. Changing this value switches the DaisyUI theme site-wide.
- Colors use DaisyUI semantic variables (`bg-base-100`, `bg-base-200`, `text-base-content`).

### Images

Use `astro:assets` `<Image />` component with explicit `width`, `height`, and `format="webp"`. Sharp is the configured image service.

### RSS & Sitemap

- `src/pages/rss.xml.js` generates an RSS feed from the blog collection.
- `@astrojs/sitemap` generates `sitemap-index.xml` and `sitemap-0.xml` at build time.
- Update `public/robots.txt` with the correct domain when changing the site URL.

## Important Notes

- This project has **no test framework** configured.
- Blog pagination uses dynamic route parameters and is **incompatible with SSR deploy configs**. Use static deployment only (Netlify, Vercel, GitHub Pages, etc.).
- There is already an `AGENTS.md` and `CodeArch.md` in the repo with additional project context and a Chinese-language architecture deep-dive.

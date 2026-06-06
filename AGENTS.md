# Astrofy — Agent Context

> This file is intended for AI coding agents. It describes the project structure, conventions, and commands needed to work with this codebase.

## Project Overview

Astrofy is a free and open-source personal portfolio website template built with [Astro](https://astro.build) and [TailwindCSS](https://tailwindcss.com/). It includes a Blog, CV, Project Section, Store, and RSS Feed. The project is configured for **static site generation (SSG)** and is deployed as a fully static site.

- **Name**: `astrofy`
- **Version**: `3.0.0`
- **License**: MIT
- **Package Manager**: `pnpm` (lockfile is `pnpm-lock.yaml`)
- **Language**: TypeScript / Astro / Markdown

## Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | Astro `^4.0.2` |
| Styling | TailwindCSS `^3.3.5` |
| UI Components | DaisyUI `^4.4.10` |
| Content | Markdown + Astro Content Collections (Zod schemas) |
| MDX | `@astrojs/mdx` |
| RSS | `@astrojs/rss` |
| Sitemap | `@astrojs/sitemap` |
| Images | `astro:assets` + `sharp` |
| Dates | `dayjs` |
| Typography | `@tailwindcss/typography` |

## Build & Development Commands

All commands use `pnpm`:

```bash
# Install dependencies
pnpm install

# Start the development server
pnpm run dev
# or
pnpm start

# Build the static site (output goes to `dist/`)
pnpm run build

# Preview the production build locally
pnpm run preview

# Run Astro CLI directly
pnpm astro
```

## Project Structure

```
├── public/                    # Static assets copied to build output as-is
│   ├── favicon.svg
│   ├── profile.webp
│   ├── post_img.webp
│   ├── itemPreview.webp
│   ├── social_img.webp
│   └── robots.txt
├── src/
│   ├── components/            # Reusable Astro components
│   │   ├── BaseHead.astro     # <head> metadata (SEO, OG, Twitter)
│   │   ├── Header.astro       # Mobile sticky header / navbar
│   │   ├── Footer.astro       # Site footer
│   │   ├── SideBar.astro      # Sidebar wrapper (avatar + menu + footer)
│   │   ├── SideBarMenu.astro  # Navigation links + active state logic
│   │   ├── SideBarFooter.astro# Social icon links (SVGs)
│   │   ├── Card.astro         # Vertical card (used sparingly)
│   │   ├── HorizontalCard.astro  # Horizontal card (blog, projects, services)
│   │   ├── HorizontalShopItem.astro # Store item card with pricing
│   │   └── cv/
│   │       └── TimeLine.astro # CV timeline element
│   ├── content/               # Astro Content Collections
│   │   ├── blog/              # Markdown blog posts
│   │   ├── store/             # Markdown store items
│   │   └── config.ts          # Zod schemas for collections
│   ├── layouts/               # Page layouts
│   │   ├── BaseLayout.astro   # Root layout (sidebar, header, footer)
│   │   ├── PostLayout.astro   # Blog post layout (prose, hero image, tags)
│   │   └── StoreItemLayout.astro # Store item detail layout
│   ├── lib/                   # Utilities
│   │   └── createSlug.ts      # Slug generator from post title
│   ├── pages/                 # File-based routing
│   │   ├── index.astro        # Homepage
│   │   ├── cv.astro           # Resume / CV page
│   │   ├── projects.astro     # Projects showcase
│   │   ├── services.astro     # Services showcase
│   │   ├── 404.astro          # Not found page
│   │   ├── rss.xml.js         # RSS feed endpoint
│   │   ├── blog/
│   │   │   ├── [...page].astro    # Paginated blog list (10 per page)
│   │   │   ├── [slug].astro       # Individual blog post
│   │   │   └── tag/[tag]/[...page].astro  # Tag-filtered blog list
│   │   └── store/
│   │       ├── [...page].astro    # Paginated store list (10 per page)
│   │       └── [slug].astro       # Individual store item
│   ├── styles/
│   │   └── global.css         # Minimal global styles (timeline fix)
│   ├── config.ts              # Site-wide constants
│   └── env.d.ts               # Astro client types
├── astro.config.mjs           # Astro configuration
├── tailwind.config.cjs        # Tailwind + DaisyUI configuration
├── tsconfig.json              # TypeScript configuration
└── package.json
```

## Configuration Files

### `src/config.ts`
Global site constants imported throughout the site:

- `SITE_TITLE` — default page title.
- `SITE_DESCRIPTION` — default meta description.
- `GENERATE_SLUG_FROM_TITLE` — when `true`, blog post URLs are generated from the post title rather than the file slug.
- `TRANSITION_API` — toggles Astro's `<ViewTransitions />`.

### `astro.config.mjs`
- Sets `site: 'https://astrofy-template.netlify.app'`.
- Integrations: `mdx()`, `sitemap()`, `tailwind()`.
- No SSR adapter is configured — this is a pure static site.

### `tailwind.config.cjs`
- Content glob covers Astro, HTML, JSX, MD, MDX, Svelte, TS, TSX, Vue files.
- Plugins: `@tailwindcss/typography`, `daisyui`.
- DaisyUI config: `themes: true`, `darkTheme: "dark"`, `logs: false`.

### `tsconfig.json`
- Extends `astro/tsconfigs/base`.
- Path aliases:
  - `@components/*` → `src/components/*`
  - `@layouts/*` → `src/layouts/*`

## Content Collections

Content is managed via Astro Content Collections with Zod schemas in `src/content/config.ts`.

### Blog (`src/content/blog/`)
Schema fields:
- `title` (string)
- `description` (string)
- `pubDate` (coerced date)
- `updatedDate` (string, optional)
- `heroImage` (string, optional)
- `badge` (string, optional)
- `tags` (array of unique strings, optional)

Frontmatter example:
```md
---
title: "Demo Post 1"
description: "..."
pubDate: "Sep 10 2022"
heroImage: "/post_img.webp"
tags: ["tokio"]
---
```

### Store (`src/content/store/`)
Schema fields:
- `title` (string)
- `description` (string)
- `custom_link_label` (string)
- `custom_link` (string, optional)
- `updatedDate` (coerced date)
- `pricing` (string, optional)
- `oldPricing` (string, optional)
- `badge` (string, optional)
- `checkoutUrl` (string, optional)
- `heroImage` (string, optional)

## Code Style & Conventions

- **Component files**: `.astro` extension with a frontmatter code fence (`---`) for script logic.
- **Props**: Destructure from `Astro.props`. Use TypeScript interfaces when needed.
- **Images**: Always use `astro:assets` `<Image />` component with explicit `width`, `height`, and `format="webp"`.
- **Imports**: Prefer relative imports for nearby files; path aliases (`@components/`, `@layouts/`) are available but used inconsistently.
- **Static paths**: Dynamic routes implement `getStaticPaths()` to pre-render pages at build time.
- **Slug logic**: `src/lib/createSlug.ts` normalizes titles to kebab-case unless `GENERATE_SLUG_FROM_TITLE` is `false`.
- **Active sidebar item**: Pages pass `sideBarActiveItemID` to `BaseLayout`, which is forwarded to `SideBarMenu`. The menu item with a matching `id` gets `bg-base-300` applied via a client-side script.
- **Theming**: The `data-theme="lofi"` attribute is set on the `<html>` tag in `BaseLayout.astro`. Change it there to switch DaisyUI themes.

## Testing

There is **no test framework** configured in this project. There are no unit tests, integration tests, or E2E tests.

## Deployment

- The site is built as a static output (`dist/`).
- A sitemap is auto-generated at build time by `@astrojs/sitemap`.
- `public/robots.txt` points to the sitemap; update the domain inside `robots.txt` if you change the site URL.
- Suitable hosts: Netlify, Vercel, GitHub Pages, Cloudflare Pages, etc.
- **Important**: The blog pagination uses dynamic route parameters in filenames. Per the README, this format is **incompatible with SSR deploy configs**. Use the default static deploy options.

## Security Considerations

- This is a read-only static site. There is no backend, authentication, or user data handling.
- External links frequently use `target="_blank"` without `rel="noopener noreferrer"` in some places. If security hardening is required, audit links in components.
- `robots.txt` currently allows all crawlers.

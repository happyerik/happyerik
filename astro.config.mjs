import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  // TODO: Update this with your actual domain (e.g. https://yourname.github.io)
  site: 'https://example.com',
  integrations: [mdx(), tailwind()]
});

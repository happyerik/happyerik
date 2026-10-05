import rss from "@astrojs/rss";
import { SITE_TITLE, SITE_DESCRIPTION } from "../config";
import { getSortedPosts } from "../lib/posts";
import createSlug from "../lib/createSlug";

export async function GET(context) {
  const posts = await getSortedPosts();
  const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: new URL(base, context.site).href,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      // 与 blog/[slug].astro 的路由保持一致，并带上 base 前缀
      link: `${base}blog/${createSlug(post.data.title, post.slug)}/`,
    })),
    customData: "<language>zh-CN</language>",
  });
}

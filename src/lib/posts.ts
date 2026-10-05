import { getCollection, type CollectionEntry } from "astro:content";

export type BlogPost = CollectionEntry<"blog">;

/** 按发布时间倒序获取全部文章 */
export async function getSortedPosts(): Promise<BlogPost[]> {
  const posts = await getCollection("blog");
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/** 粗略估算阅读时长：中文按 400 字/分钟，英文按 200 词/分钟 */
export function readingMinutes(body: string): number {
  const text = body.replace(/```[\s\S]*?```/g, "").replace(/!\[.*?\]\(.*?\)/g, "");
  const cjk = (text.match(/[一-鿿]/g) || []).length;
  const words = (text.replace(/[一-鿿]/g, " ").match(/[A-Za-z0-9]+/g) || []).length;
  return Math.max(1, Math.round(cjk / 400 + words / 200));
}

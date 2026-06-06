import { z, defineCollection } from "astro:content";

const blogCollection = defineCollection({
    schema: ({ image }) => z.object({
        title: z.string(),
        description: z.string(),
        pubDate: z.coerce.date(),
        updatedDate: z.string().optional(),
        heroImage: image().optional(),
        badge: z.string().optional(),
        tags: z.array(z.string()).refine(items => new Set(items).size === items.length, {
            message: '标签必须唯一',
        }).optional(),
    }),
});

export type BlogSchema = z.infer<typeof blogCollection.schema>;

export const collections = {
    'blog': blogCollection,
}

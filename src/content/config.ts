import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.string(),
    reading: z.string(),
    tag: z.string(),
    excerpt: z.string(),
    deck: z.string(),
    featured: z.boolean().default(false),
  }),
});

const work = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    year: z.string(),
    tag: z.string(),
    venue: z.string(),
    note: z.string(),
    order: z.number(),
    featured: z.boolean().default(false),
  }),
});

export const collections = { posts, work };

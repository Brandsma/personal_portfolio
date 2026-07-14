import { describe, it, expect } from 'vitest';
import { z } from 'astro/zod';

/**
 * Mirrors the schemas from src/content/config.ts to validate
 * that our content frontmatter contracts are enforced correctly.
 */

const postSchema = z.object({
  title: z.string(),
  date: z.string(),
  reading: z.string(),
  tag: z.string(),
  excerpt: z.string(),
  deck: z.string(),
  featured: z.boolean().default(false),
});

const workSchema = z.object({
  title: z.string(),
  year: z.string(),
  tag: z.string(),
  venue: z.string(),
  note: z.string(),
  order: z.number(),
  featured: z.boolean().default(false),
});

describe('Post content schema', () => {
  const validPost = {
    title: 'Test Post Title',
    date: '2024-03-15',
    reading: '5 min read',
    tag: 'essay',
    excerpt: 'A short summary of the post content.',
    deck: 'The subtitle or deck of the post.',
  };

  it('accepts valid post frontmatter', () => {
    const result = postSchema.safeParse(validPost);
    expect(result.success).toBe(true);
  });

  it('rejects post missing title', () => {
    const { title, ...incomplete } = validPost;
    const result = postSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });

  it('rejects post missing date', () => {
    const { date, ...incomplete } = validPost;
    const result = postSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });

  it('rejects post missing reading', () => {
    const { reading, ...incomplete } = validPost;
    const result = postSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });

  it('rejects post missing tag', () => {
    const { tag, ...incomplete } = validPost;
    const result = postSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });

  it('rejects post missing excerpt', () => {
    const { excerpt, ...incomplete } = validPost;
    const result = postSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });

  it('rejects post missing deck', () => {
    const { deck, ...incomplete } = validPost;
    const result = postSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });

  it('defaults featured to false when omitted', () => {
    const result = postSchema.safeParse(validPost);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.featured).toBe(false);
  });

  it('accepts featured: true', () => {
    const result = postSchema.safeParse({ ...validPost, featured: true });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.featured).toBe(true);
  });

  it('rejects non-boolean featured', () => {
    const result = postSchema.safeParse({ ...validPost, featured: 'true' });
    expect(result.success).toBe(false);
  });

  it('rejects post with numeric title', () => {
    const result = postSchema.safeParse({ ...validPost, title: 42 });
    expect(result.success).toBe(false);
  });

  it('accepts post with empty string fields (not undefined)', () => {
    const emptyStrings = {
      title: '',
      date: '',
      reading: '',
      tag: '',
      excerpt: '',
      deck: '',
    };
    const result = postSchema.safeParse(emptyStrings);
    expect(result.success).toBe(true);
  });

  it('rejects completely empty object', () => {
    const result = postSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('Work content schema', () => {
  const validWork = {
    title: 'Project Title',
    year: '2024',
    tag: 'research',
    venue: 'academic',
    note: 'some description of tech stack',
    order: 1,
  };

  it('accepts valid work frontmatter', () => {
    const result = workSchema.safeParse(validWork);
    expect(result.success).toBe(true);
  });

  it('rejects work missing title', () => {
    const { title, ...incomplete } = validWork;
    const result = workSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });

  it('rejects work missing year', () => {
    const { year, ...incomplete } = validWork;
    const result = workSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });

  it('rejects work missing order', () => {
    const { order, ...incomplete } = validWork;
    const result = workSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });

  it('rejects work with string order (must be number)', () => {
    const result = workSchema.safeParse({ ...validWork, order: '1' });
    expect(result.success).toBe(false);
  });

  it('accepts work with order 0', () => {
    const result = workSchema.safeParse({ ...validWork, order: 0 });
    expect(result.success).toBe(true);
  });

  it('accepts work with negative order', () => {
    const result = workSchema.safeParse({ ...validWork, order: -1 });
    expect(result.success).toBe(true);
  });

  it('defaults featured to false when omitted', () => {
    const result = workSchema.safeParse(validWork);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.featured).toBe(false);
  });

  it('accepts featured: true', () => {
    const result = workSchema.safeParse({ ...validWork, featured: true });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.featured).toBe(true);
  });

  it('rejects non-boolean featured', () => {
    const result = workSchema.safeParse({ ...validWork, featured: 'true' });
    expect(result.success).toBe(false);
  });

  it('rejects work with null values', () => {
    const result = workSchema.safeParse({ ...validWork, title: null });
    expect(result.success).toBe(false);
  });

  it('rejects completely empty object', () => {
    const result = workSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('allows extra properties (Zod strips them by default)', () => {
    const result = workSchema.safeParse({ ...validWork, extraField: 'hello' });
    expect(result.success).toBe(true);
  });
});

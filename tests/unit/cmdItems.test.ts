import { describe, it, expect } from 'vitest';

/**
 * Tests the command palette item generation logic.
 * Mirrors the logic in src/pages/index.astro that builds cmdItems.
 */

interface WorkEntry {
  data: { title: string; order: number };
  slug: string;
}

interface PostEntry {
  data: { title: string; date: string };
  slug: string;
}

interface CmdItem {
  kind: string;
  title: string;
  href: string;
}

function buildCmdItems(work: WorkEntry[], posts: PostEntry[]): CmdItem[] {
  return [
    ...work.map((w) => ({ kind: 'work', title: w.data.title, href: `/work/${w.slug}` })),
    ...posts.map((p) => ({ kind: 'writing', title: p.data.title, href: `/posts/${p.slug}` })),
    { kind: 'page', title: 'all projects', href: '/work/' },
    { kind: 'page', title: 'all writing', href: '/posts/' },
    { kind: 'page', title: 'about', href: '/#about' },
    { kind: 'page', title: 'contact', href: '/#contact' },
  ];
}

const mockWork: WorkEntry[] = [
  { data: { title: 'DSS Handwriting', order: 2 }, slug: 'dss-handwriting' },
  { data: { title: 'GraphRAG', order: 1 }, slug: 'graphrag' },
  { data: { title: 'Invertible Flows', order: 3 }, slug: 'invertible-flows' },
  { data: { title: 'Game Jam Projects', order: 4 }, slug: 'gamejam-projects' },
];

const mockPosts: PostEntry[] = [
  { data: { title: 'Hello World', date: '2024-01-01' }, slug: 'hello' },
  {
    data: { title: 'Acceleration of Acceleration', date: '2024-03-15' },
    slug: 'acceleration-of-acceleration',
  },
  { data: { title: 'Incentives of AI', date: '2024-02-10' }, slug: 'incentives-of-ai' },
];

describe('buildCmdItems', () => {
  it('produces correct number of items (work + posts + 4 static pages)', () => {
    const items = buildCmdItems(mockWork, mockPosts);
    expect(items).toHaveLength(mockWork.length + mockPosts.length + 4);
  });

  it('work items come first', () => {
    const items = buildCmdItems(mockWork, mockPosts);
    const workItems = items.filter((i) => i.kind === 'work');
    expect(workItems).toHaveLength(mockWork.length);
    // first items should all be work
    for (let i = 0; i < mockWork.length; i++) {
      expect(items[i].kind).toBe('work');
    }
  });

  it('post items come after work items', () => {
    const items = buildCmdItems(mockWork, mockPosts);
    for (let i = mockWork.length; i < mockWork.length + mockPosts.length; i++) {
      expect(items[i].kind).toBe('writing');
    }
  });

  it('static pages (all projects, all writing, about, contact) are always last', () => {
    const items = buildCmdItems(mockWork, mockPosts);
    const lastFour = items.slice(-4);
    expect(lastFour[0]).toEqual({ kind: 'page', title: 'all projects', href: '/work/' });
    expect(lastFour[1]).toEqual({ kind: 'page', title: 'all writing', href: '/posts/' });
    expect(lastFour[2]).toEqual({ kind: 'page', title: 'about', href: '/#about' });
    expect(lastFour[3]).toEqual({ kind: 'page', title: 'contact', href: '/#contact' });
  });

  it('generates correct hrefs for work items', () => {
    const items = buildCmdItems(mockWork, mockPosts);
    const workItems = items.filter((i) => i.kind === 'work');
    expect(workItems[0].href).toBe('/work/dss-handwriting');
    expect(workItems[1].href).toBe('/work/graphrag');
  });

  it('generates correct hrefs for post items', () => {
    const items = buildCmdItems(mockWork, mockPosts);
    const postItems = items.filter((i) => i.kind === 'writing');
    expect(postItems[0].href).toBe('/posts/hello');
    expect(postItems[1].href).toBe('/posts/acceleration-of-acceleration');
  });

  it('handles empty work array', () => {
    const items = buildCmdItems([], mockPosts);
    expect(items).toHaveLength(mockPosts.length + 4);
    expect(items[0].kind).toBe('writing');
  });

  it('handles empty posts array', () => {
    const items = buildCmdItems(mockWork, []);
    expect(items).toHaveLength(mockWork.length + 4);
    expect(items[items.length - 5].kind).toBe('work');
  });

  it('handles both empty arrays', () => {
    const items = buildCmdItems([], []);
    expect(items).toHaveLength(4);
    expect(items[0].title).toBe('all projects');
    expect(items[1].title).toBe('all writing');
    expect(items[2].title).toBe('about');
    expect(items[3].title).toBe('contact');
  });

  it('preserves order of input arrays', () => {
    const items = buildCmdItems(mockWork, mockPosts);
    const workItems = items.filter((i) => i.kind === 'work');
    expect(workItems.map((w) => w.title)).toEqual(mockWork.map((w) => w.data.title));
  });

  it('all items have required fields', () => {
    const items = buildCmdItems(mockWork, mockPosts);
    for (const item of items) {
      expect(item).toHaveProperty('kind');
      expect(item).toHaveProperty('title');
      expect(item).toHaveProperty('href');
      expect(typeof item.kind).toBe('string');
      expect(typeof item.title).toBe('string');
      expect(typeof item.href).toBe('string');
    }
  });
});

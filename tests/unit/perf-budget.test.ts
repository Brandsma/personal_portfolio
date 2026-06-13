import { describe, it, expect } from 'vitest';
import { readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

function getDirSize(dirPath: string): { total: number; byExt: Record<string, number> } {
  let total = 0;
  const byExt: Record<string, number> = {};

  function walk(dir: string) {
    let entries: string[];
    try {
      entries = readdirSync(dir);
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = join(dir, entry);
      let s: { size: number; isDirectory: () => boolean };
      try {
        s = statSync(full);
      } catch {
        continue;
      }
      if (s.isDirectory()) {
        walk(full);
      } else {
        total += s.size;
        const ext = entry.includes('.') ? entry.slice(entry.lastIndexOf('.')) : '(no ext)';
        byExt[ext] = (byExt[ext] || 0) + s.size;
      }
    }
  }

  walk(dirPath);
  return { total, byExt };
}

function getFilesByExt(dirPath: string): Record<string, { path: string; size: number }[]> {
  const byExt: Record<string, { path: string; size: number }[]> = {};

  function walk(dir: string) {
    let entries: string[];
    try {
      entries = readdirSync(dir);
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = join(dir, entry);
      let s: { size: number; isDirectory: () => boolean };
      try {
        s = statSync(full);
      } catch {
        continue;
      }
      if (s.isDirectory()) {
        walk(full);
      } else {
        const ext = entry.includes('.') ? entry.slice(entry.lastIndexOf('.')) : '(no ext)';
        if (!byExt[ext]) byExt[ext] = [];
        byExt[ext].push({ path: full, size: s.size });
      }
    }
  }

  walk(dirPath);
  return byExt;
}

const KB = 1024;
const MB = 1024 * KB;

describe('Performance Budget', () => {
  const distDir = join(process.cwd(), 'dist');

  it('should have a dist directory (run npm run build first)', () => {
    expect(existsSync(distDir)).toBe(true);
  });

  it('total JS size should be under 200 KB', () => {
    if (!existsSync(distDir)) return;
    const { byExt } = getDirSize(distDir);
    const jsSize = byExt['.js'] || 0;
    console.log(`  JS: ${(jsSize / KB).toFixed(1)} KB`);
    expect(jsSize).toBeLessThan(200 * KB);
  });

  it('total CSS size should be under 50 KB', () => {
    if (!existsSync(distDir)) return;
    const { byExt } = getDirSize(distDir);
    const cssSize = byExt['.css'] || 0;
    console.log(`  CSS: ${(cssSize / KB).toFixed(1)} KB`);
    expect(cssSize).toBeLessThan(50 * KB);
  });

  it('total image size should be under 2 MB', () => {
    if (!existsSync(distDir)) return;
    const { byExt } = getDirSize(distDir);
    const imgExts = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico', '.avif'];
    const imgSize = Object.entries(byExt)
      .filter(([ext]) => imgExts.includes(ext))
      .reduce((acc, [, size]) => acc + size, 0);
    console.log(`  Images: ${(imgSize / MB).toFixed(2)} MB`);
    expect(imgSize).toBeLessThan(2 * MB);
  });

  it('total dist size should be under 5 MB', () => {
    if (!existsSync(distDir)) return;
    const { total } = getDirSize(distDir);
    console.log(`  Total: ${(total / MB).toFixed(2)} MB`);
    expect(total).toBeLessThan(5 * MB);
  });

  it('no single JS chunk should exceed 100 KB', () => {
    if (!existsSync(distDir)) return;
    const files = getFilesByExt(distDir);
    const jsFiles = files['.js'] || [];
    for (const f of jsFiles) {
      console.log(`  ${f.path.replace(distDir, '')}: ${(f.size / KB).toFixed(1)} KB`);
      expect(f.size).toBeLessThan(100 * KB);
    }
  });
});

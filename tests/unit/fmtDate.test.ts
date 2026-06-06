import { describe, it, expect } from 'vitest';

/**
 * Unit test for the date formatting logic used on the homepage.
 * Mirrors the fmtDate function in src/pages/index.astro.
 */
function fmtDate(s: string): string {
  return new Date(s)
    .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    .toLowerCase();
}

describe('fmtDate', () => {
  it('formats a date string correctly', () => {
    const result = fmtDate('2024-03-15');
    expect(result).toMatch(/15 mar 2024/);
  });

  it('handles ISO date strings', () => {
    const result = fmtDate('2023-12-01T00:00:00Z');
    expect(result).toMatch(/01 dec 2023/);
  });

  it('returns lowercase output', () => {
    const result = fmtDate('2024-01-20');
    expect(result).toBe(result.toLowerCase());
  });
});

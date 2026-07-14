import { describe, it, expect } from 'vitest';
import { fmtDate } from '../../src/lib/format';

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

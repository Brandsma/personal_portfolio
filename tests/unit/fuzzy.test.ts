import { describe, it, expect } from 'vitest';
import { fuzzyMatch, fuzzyFilter } from '../../src/lib/fuzzy';

describe('fuzzyMatch', () => {
  it('matches everything on an empty query with score 0', () => {
    expect(fuzzyMatch('', 'anything at all')).toEqual({ matched: true, score: 0 });
    expect(fuzzyMatch('   ', 'anything at all')).toEqual({ matched: true, score: 0 });
  });

  it('matches exact substrings', () => {
    expect(fuzzyMatch('graphrag', 'graphrag reimplementation').matched).toBe(true);
  });

  it('matches subsequences (fuzzy)', () => {
    expect(fuzzyMatch('gjam', 'game jam projects').matched).toBe(true);
    expect(fuzzyMatch('invflows', 'invertible flows').matched).toBe(true);
  });

  it('rejects when a character is missing', () => {
    expect(fuzzyMatch('xyz', 'graphrag').matched).toBe(false);
    expect(fuzzyMatch('grapx', 'graphrag').matched).toBe(false);
  });

  it('is case-insensitive both ways', () => {
    expect(fuzzyMatch('GRAPH', 'graphrag').matched).toBe(true);
    expect(fuzzyMatch('graph', 'GraphRAG').matched).toBe(true);
  });

  it('requires all whitespace-separated terms to match', () => {
    expect(fuzzyMatch('flows invertible', 'invertible flows for imaging').matched).toBe(true);
    expect(fuzzyMatch('flows missing', 'invertible flows').matched).toBe(false);
  });

  it('matched:false always carries score 0', () => {
    expect(fuzzyMatch('zz', 'graphrag')).toEqual({ matched: false, score: 0 });
  });

  it('scores word-boundary acronyms (dss → dead sea scrolls)', () => {
    const result = fuzzyMatch('dss', 'dead sea scrolls');
    expect(result.matched).toBe(true);
    expect(result.score).toBeGreaterThan(0);
  });

  it('ranks consecutive runs above scattered matches', () => {
    const tight = fuzzyMatch('graph', 'graphrag').score;
    const scattered = fuzzyMatch('graph', 'go ra pi hu').score;
    expect(tight).toBeGreaterThan(scattered);
  });

  it('ranks word-start hits above mid-word hits', () => {
    const wordStart = fuzzyMatch('f', 'invertible flows').score;
    const midWord = fuzzyMatch('f', 'affine').score;
    expect(wordStart).toBeGreaterThan(midWord);
  });
});

describe('fuzzyFilter', () => {
  const items = [
    { title: 'physics-informed invertible neural networks' },
    { title: 'graphrag reimplementation from scratch' },
    { title: 'game jam projects' },
  ];
  const byTitle = (i: { title: string }) => i.title;

  it('returns all items in original order for an empty query', () => {
    expect(fuzzyFilter('', items, byTitle)).toEqual(items);
  });

  it('drops non-matching items', () => {
    const hits = fuzzyFilter('graphrag', items, byTitle);
    expect(hits).toHaveLength(1);
    expect(hits[0].title).toContain('graphrag');
  });

  it('sorts best match first', () => {
    const hits = fuzzyFilter('game', [{ title: 'endgame notes' }, { title: 'game jam' }], byTitle);
    expect(hits[0].title).toBe('game jam');
  });

  it('handles an empty item list', () => {
    expect(fuzzyFilter('anything', [], byTitle)).toEqual([]);
  });
});

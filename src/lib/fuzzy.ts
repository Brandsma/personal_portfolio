/**
 * Tiny dependency-free fuzzy matcher.
 *
 * The query is split on whitespace; every term must match the text as a
 * case-insensitive subsequence (so terms can be typed in any order).
 * Scoring favors word-boundary hits and consecutive runs over scattered
 * characters, so "graph" ranks "graphrag" above an incidental g…r…a…p…h.
 */

export interface FuzzyResult {
  matched: boolean;
  score: number;
}

const BOUNDARY = /[^a-z0-9]/;

/** Greedy subsequence match of a single lowercase term. null = no match. */
function matchTerm(term: string, text: string): number | null {
  let score = 0;
  let prev = -1;
  for (const ch of term) {
    const pos = text.indexOf(ch, prev + 1);
    if (pos === -1) return null;
    if (pos === prev + 1 && prev !== -1) {
      score += 3; // continues a run
    } else if (pos === 0 || BOUNDARY.test(text[pos - 1])) {
      score += 2; // starts a word
    } else {
      score += 1; // lone mid-word hit
    }
    if (prev !== -1) {
      score -= Math.min((pos - prev - 1) * 0.1, 1); // small gap penalty
    }
    prev = pos;
  }
  return score;
}

export function fuzzyMatch(query: string, text: string): FuzzyResult {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return { matched: true, score: 0 };
  const hay = text.toLowerCase();
  let score = 0;
  for (const term of terms) {
    const termScore = matchTerm(term, hay);
    if (termScore === null) return { matched: false, score: 0 };
    score += termScore;
  }
  return { matched: true, score };
}

/** Matching items sorted best-first; ties keep the input order. */
export function fuzzyFilter<T>(
  query: string,
  items: readonly T[],
  getText: (item: T) => string,
): T[] {
  return items
    .map((item) => ({ item, result: fuzzyMatch(query, getText(item)) }))
    .filter(({ result }) => result.matched)
    .sort((a, b) => b.result.score - a.result.score)
    .map(({ item }) => item);
}

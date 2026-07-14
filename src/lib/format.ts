/** '2024-03-15' → '15 mar 2024' (en-GB, lowercase) */
export function fmtDate(s: string): string {
  return new Date(s)
    .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    .toLowerCase();
}

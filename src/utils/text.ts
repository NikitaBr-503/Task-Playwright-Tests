/** Escape a string for safe use inside a `RegExp`. */
export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Anchored, whitespace-tolerant matcher for `hasText` filters.
 *
 * Playwright's `hasText` is a substring match, which makes "Tech" match
 * "Technology" and "Date" match "Creation Date". This pins the match to the
 * whole trimmed string instead.
 */
export function exactText(value: string): RegExp {
  return new RegExp(`^\\s*${escapeRegExp(value)}\\s*$`);
}

/** Collapse runs of whitespace and trim — for comparing rendered text. */
export function normalize(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

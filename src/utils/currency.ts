/**
 * Format an amount the way Precoro's document tables render it: thousands
 * separators and exactly two decimals, e.g. `1000` -> `1,000.00`.
 *
 * Assertions compare against this rather than the raw number, so a price of
 * 1000 is matched as it actually appears on screen.
 */
export function formatAmount(amount: number): string {
  return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

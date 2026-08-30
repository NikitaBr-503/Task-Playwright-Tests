/**
 * Date helpers.
 */

/**
 * Left-pad a day or month to two digits: `5` -> `"05"`.
 *
 * The delivery-date input is a strict `dd.mm.yyyy` mask, so a single-digit
 * value would be mis-parsed — typing `1.9.2026` does not yield 1 September.
 * `Date` hands back exactly those single digits: `getDate()` returns 1-31 and
 * `getMonth()` 0-11, which is also why the caller adds 1 to the month.
 */
function pad(value: number): string {
  return String(value).padStart(2, '0');
}

/** Format a date as `dd.MM.yyyy`, e.g. `30.08.2026`. */
function formatDate(date: Date): string {
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
}

/** Today in `dd.MM.yyyy`. */
export function today(): string {
  return formatDate(new Date());
}

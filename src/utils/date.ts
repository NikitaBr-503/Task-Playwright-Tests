/**
 * Date helpers.
 *
 * Precoro renders and accepts dates as `dd.MM.yyyy` (the delivery-date input
 * placeholder is literally `dd.mm.yyyy`), so that is the only format the tests
 * ever need.
 */

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

/** Format a date as `dd.MM.yyyy`, e.g. `30.08.2026`. */
export function formatDate(date: Date): string {
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
}

/** Today in `dd.MM.yyyy`. */
export function today(): string {
  return formatDate(new Date());
}

/** A date offset from today, in `dd.MM.yyyy`. */
export function daysFromToday(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

/**
 * Helpers for generating unique, traceable test data.
 *
 * Every generated value carries a shared prefix so leftovers are easy to find
 * and clean up in the application under test.
 */
const PREFIX = process.env.TEST_DATA_PREFIX ?? 'e2e';

/** Short, collision-resistant suffix: `<base36 timestamp><random>`. */
export function uniqueSuffix(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

/** e.g. `e2e-supplier-lx8k1a-9f2c` */
export function uniqueName(entity: string): string {
  return `${PREFIX}-${entity}-${uniqueSuffix()}`;
}

/** e.g. `e2e+lx8k1a9f2c@example.com` */
export function uniqueEmail(domain = 'example.com'): string {
  return `${PREFIX}+${uniqueSuffix()}@${domain}`;
}

/** ISO date offset from today, formatted as `YYYY-MM-DD`. */
export function dateFromToday(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

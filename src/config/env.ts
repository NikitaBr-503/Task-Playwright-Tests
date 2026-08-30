import path from 'node:path';
import dotenv from 'dotenv';

/**
 * Single source of truth for environment configuration.
 *
 * Loading is idempotent — dotenv never overwrites variables that are already
 * set, so real CI environment variables always win over the local `.env` file.
 */
dotenv.config({ path: path.resolve(__dirname, '../../.env'), quiet: true });

class MissingEnvError extends Error {
  constructor(name: string) {
    super(
      `Missing required environment variable "${name}". ` +
        `Copy .env.example to .env and fill it in (or export it in your CI secrets).`,
    );
    this.name = 'MissingEnvError';
  }
}

/*
 * Readers that turn `process.env` (always `string | undefined`) into typed,
 * validated values. Going through them rather than reading `process.env`
 * directly is what lets the rest of the suite treat `env.timeouts.action` as a
 * real `number` and `env.isCI` as a real `boolean`.
 */

/**
 * A variable the suite cannot run without.
 *
 * Fails loudly at the point of use with an actionable message. Without this a
 * missing password is typed into the login form as `undefined`, and the run
 * reports "login failed" 30 seconds later — pointing at the wrong problem.
 */
function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new MissingEnvError(name);
  return value;
}

/**
 * A variable with a sensible default.
 *
 * `||` rather than `??` on purpose: a blank `BASE_URL=` line should fall back
 * to the default, whereas `??` would treat the empty string as a real value.
 * The trim guards against trailing whitespace in `.env`, which would otherwise
 * produce an invalid URL.
 */
function optional(name: string, fallback: string): string {
  return process.env[name]?.trim() || fallback;
}

/**
 * A numeric variable.
 *
 * Env values are strings, and Playwright's config expects real numbers — a
 * string timeout misbehaves anywhere it is used in arithmetic. The
 * `Number.isFinite` guard means a typo (`ACTION_TIMEOUT=3o`) falls back to the
 * default instead of poisoning the config with `NaN`.
 */
function number(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * A boolean variable, parsed from the usual truthy spellings.
 *
 * The classic env footgun: every variable is a non-empty string, so
 * `Boolean('false')` is `true` — `HEADLESS=false` would silently keep running
 * headless. Anything not in the truthy list reads as false.
 */
function boolean(name: string, fallback: boolean): boolean {
  const raw = process.env[name]?.trim().toLowerCase();
  if (!raw) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(raw);
}

export const isCI = boolean('CI', false);

/** A sign-in identity. `env.credentials` satisfies this. */
export interface Credentials {
  email: string;
  password: string;
}

export const env = {
  /** Base URL of the application under test. */
  baseURL: optional('BASE_URL', 'https://app.precoro.com'),

  /**
   * Credentials are exposed through getters so that merely importing this
   * module (e.g. from playwright.config.ts) never throws — the error surfaces
   * only when a test actually needs a credential.
   */
  credentials: {
    get email(): string {
      return required('PRECORO_EMAIL');
    },
    get password(): string {
      return required('PRECORO_PASSWORD');
    },
  },

  timeouts: {
    action: number('ACTION_TIMEOUT', 15_000),
    navigation: number('NAVIGATION_TIMEOUT', 45_000),
    expect: number('EXPECT_TIMEOUT', 10_000),
    test: number('TEST_TIMEOUT', 60_000),
  },

  runner: {
    headless: boolean('HEADLESS', true),
    slowMo: number('SLOW_MO', 0),
    retries: number('RETRIES', isCI ? 2 : 0),
    workers: process.env.WORKERS?.trim() ? number('WORKERS', 1) : undefined,
  },

  isCI,
} as const;

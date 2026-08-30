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

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new MissingEnvError(name);
  return value;
}

function optional(name: string, fallback: string): string {
  return process.env[name]?.trim() || fallback;
}

function number(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function boolean(name: string, fallback: boolean): boolean {
  const raw = process.env[name]?.trim().toLowerCase();
  if (!raw) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(raw);
}

export const isCI = boolean('CI', false);

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

  /** Optional second role — handy once approval-flow suites are added. */
  approver: {
    get email(): string {
      return required('PRECORO_APPROVER_EMAIL');
    },
    get password(): string {
      return required('PRECORO_APPROVER_PASSWORD');
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

export type Env = typeof env;

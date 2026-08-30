import path from 'node:path';

/** Absolute paths used by config, fixtures and setup projects. */
const ROOT_DIR = path.resolve(__dirname, '../..');

export const AUTH_DIR = path.join(ROOT_DIR, '.auth');

/**
 * Storage state produced by `tests/setup/auth.setup.ts`.
 *
 * One entry per signed-in role; add a key here (and a matching setup step) when
 * a second role is needed.
 */
export const STORAGE_STATE = {
  user: path.join(AUTH_DIR, 'user.json'),
} as const;

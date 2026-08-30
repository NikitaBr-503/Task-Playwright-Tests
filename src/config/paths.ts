import path from 'node:path';

/** Absolute paths used by config, fixtures and setup projects. */
export const ROOT_DIR = path.resolve(__dirname, '../..');

export const AUTH_DIR = path.join(ROOT_DIR, '.auth');

/** Storage state produced by `tests/setup/auth.setup.ts`. */
export const STORAGE_STATE = {
  user: path.join(AUTH_DIR, 'user.json'),
  approver: path.join(AUTH_DIR, 'approver.json'),
} as const;

export type StorageStateRole = keyof typeof STORAGE_STATE;

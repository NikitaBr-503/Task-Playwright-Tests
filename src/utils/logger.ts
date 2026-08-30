/* eslint-disable no-console */

type Level = 'debug' | 'info' | 'warn' | 'error';

const LEVELS: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };
const threshold = LEVELS[(process.env.LOG_LEVEL as Level) ?? 'info'] ?? LEVELS.info;

function log(level: Level, message: string, ...args: unknown[]): void {
  if (LEVELS[level] < threshold) return;
  const stamp = new Date().toISOString();
  console[level === 'debug' ? 'log' : level](
    `[${stamp}] ${level.toUpperCase()} ${message}`,
    ...args,
  );
}

export const logger = {
  debug: (message: string, ...args: unknown[]) => log('debug', message, ...args),
  info: (message: string, ...args: unknown[]) => log('info', message, ...args),
  warn: (message: string, ...args: unknown[]) => log('warn', message, ...args),
  error: (message: string, ...args: unknown[]) => log('error', message, ...args),
};

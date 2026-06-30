import { LoggerLevelValues, devOnlyLevels } from './levelMap';
import { teledex } from './teledex';

export type LoggerLevel =
  | 'silly'
  | 'debug'
  | 'verbose'
  | 'info'
  | 'success'
  | 'warn'
  | 'error';

export type LoggerLogFunction = (...data: unknown[]) => void;
export type LoggerLogFactory = (scope?: string, level?: LoggerLevel) => LoggerLogFunction;

export interface LoggerLevelFunctions extends Record<LoggerLevel, LoggerLogFunction> {
  scope?: string;
}

export type LoggerLevelFactory = (scope?: string) => LoggerLevelFunctions;
export type LoggerInstance = Omit<LoggerLevelFunctions, 'scope'> & LoggerLevelFactory;

const __DEV__ = process.env.NODE_ENV === 'development';

const ALL_LEVELS: LoggerLevel[] = [
  'silly',
  'debug',
  'verbose',
  'info',
  'success',
  'warn',
  'error',
];

/** Console-printable iff it's not a dev-only level, or we're in a dev build. */
const consolePrintable = (level: LoggerLevel): boolean => (
  !devOnlyLevels.includes(level) || __DEV__
);

const consoleMethod = (level: LoggerLevel): 'log' | 'info' | 'warn' | 'error' => {
  switch (level) {
    case 'warn': {
      return 'warn';
    }

    case 'error': {
      return 'error';
    }

    case 'verbose':
    case 'info': {
      return 'info';
    }

    default: {
      return 'log';
    }
  }
};

const emit = (scope: string, level: LoggerLevel, data: unknown[]): void => {
  try {
    const printable = consolePrintable(level);
    const capturable = teledex.shouldCapture(level);

    // bail before any work when this log will neither print nor be captured (prod's silly firehose)
    if (!printable && !capturable) {
      return;
    }

    // 1) console output (existing `__DEV__`/devOnly gating)
    if (printable) {
      const method = consoleMethod(level);
      // eslint-disable-next-line no-console
      (console[method] || console.log)(`[${scope || '?'}]`, `(${level})`, ...data);
    }

    // 2) teledex sink -- synchronous so the in-memory trail is complete at crash time
    // (further gating, incl. dev-only handling, lives inside teledex.capture())
    teledex.capture(level, scope, data);
  } catch { /* logging must never break the app */ }
};

const buildFns = (scope = ''): LoggerLevelFunctions => ALL_LEVELS.reduce((acc, level) => {
  acc[level] = (...data: unknown[]) => emit(scope, level, data);

  return acc;
}, { scope } as LoggerLevelFunctions);

export const logger = ((scope = '') => buildFns(scope)) as LoggerInstance;

ALL_LEVELS.forEach((level) => {
  (logger as unknown as Record<string, LoggerLogFunction>)[level] = (
    ...data: unknown[]
  ) => emit('', level, data);
});

export { LoggerLevelValues };

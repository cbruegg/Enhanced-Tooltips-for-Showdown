import { type LoggerLevel } from './logger';

/** logger level -> numeric severity (pino-compatible; higher = more severe). */
export const LoggerLevelValues: Record<LoggerLevel, number> = {
  silly: 10,
  debug: 20,
  verbose: 25,
  info: 30,
  success: 35,
  warn: 40,
  error: 50,
};

/** Levels that only fire when `__DEV__` OR `developerMode` (console-print stays `__DEV__`-only). */
export const devOnlyLevels: readonly LoggerLevel[] = ['silly', 'debug', 'verbose'] as const;

/** The levels pino doesn't ship by default, registered via `customLevels`. */
export const pinoCustomLevels: Record<'silly' | 'verbose' | 'success', number> = {
  silly: LoggerLevelValues.silly,
  verbose: LoggerLevelValues.verbose,
  success: LoggerLevelValues.success,
};

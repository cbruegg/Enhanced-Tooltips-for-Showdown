import { describe, expect, it } from 'vitest';
import { LoggerLevelValues, devOnlyLevels, pinoCustomLevels } from './levelMap';

describe('levelMap', () => {
  it('maps all 7 logger levels to ascending pino values', () => {
    expect(LoggerLevelValues).toMatchObject({
      silly: 10, debug: 20, verbose: 25, info: 30, success: 35, warn: 40, error: 50,
    });
  });

  it('flags only silly/debug/verbose as dev-only', () => {
    expect([...devOnlyLevels].sort()).toEqual(['debug', 'silly', 'verbose']);
  });

  it('exposes the non-standard levels pino needs as customLevels', () => {
    expect(pinoCustomLevels).toMatchObject({ silly: 10, verbose: 25, success: 35 });
    expect(pinoCustomLevels).not.toHaveProperty('info'); // info/debug/warn/error are pino built-ins
  });
});

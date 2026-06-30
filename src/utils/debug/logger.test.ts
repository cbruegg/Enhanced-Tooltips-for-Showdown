import {
 describe, expect, it, vi, beforeEach,
} from 'vitest';

const capture = vi.fn();
vi.mock('./teledex', () => ({ teledex: { capture: (...a: unknown[]) => capture(...a) } }));

const { logger } = await import('./logger');

describe('logger() facade', () => {
  beforeEach(() => capture.mockClear());

  it('preserves the API: scope + 7 level methods', () => {
    const l = logger('@showdex/test');
    expect(l.scope).toBe('@showdex/test');
    (['silly', 'debug', 'verbose', 'info', 'success', 'warn', 'error'] as const)
      .forEach((lvl) => expect(typeof l[lvl]).toBe('function'));
  });

  it('forwards every level call to teledex.capture(level, scope, args)', () => {
    const l = logger('@showdex/test');
    l.warn('uh oh', { x: 1 });
    expect(capture).toHaveBeenCalledWith('warn', '@showdex/test', ['uh oh', { x: 1 }]);
  });

  it('module-level aliases work without a scope', () => {
    logger.info('hello');
    expect(capture).toHaveBeenCalledWith('info', expect.any(String), ['hello']);
  });
});

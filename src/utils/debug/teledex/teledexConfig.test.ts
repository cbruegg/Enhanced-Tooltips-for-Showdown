import { describe, expect, it } from 'vitest';
import { resolveTeledexConfig } from './teledexConfig';

describe('resolveTeledexConfig()', () => {
  it('reads defaults from env (.env has TELEDEX_* set)', () => {
    const cfg = resolveTeledexConfig();
    expect(cfg.enabled).toBe(true);
    expect(cfg.maxRecords).toBe(5000);
    expect(cfg.maxAge).toEqual({ hours: 24 });
  });

  it('honors overrides (for callers/tests)', () => {
    const cfg = resolveTeledexConfig({ maxRecords: 10, maxAge: { minutes: 5 } });
    expect(cfg.maxRecords).toBe(10);
    expect(cfg.maxAge).toEqual({ minutes: 5 });
  });
});

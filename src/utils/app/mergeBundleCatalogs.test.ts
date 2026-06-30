import { describe, expect, it } from 'vitest';
import { mergeBundleCatalogs } from './mergeBundleCatalogs';

/**
 * Tiny factory for a bundle catalog entry; only the bits `mergeBundleCatalogs()` cares about.
 */
const bun = (id: string, updated: string, extra: Record<string, unknown> = {}) => ({
  id,
  ntt: 'presets' as const,
  updated,
  ...extra,
});

// the actual bug: a freshly-baked bundle that only exists in the prebundled catalog
const CHAMPIONS = '4a0f6bd0-52a2-4322-9adc-3258a74b6f68';
const VGC = 'd45db13d-567e-4b41-91d4-268cc83e1ce6';

describe('mergeBundleCatalogs()', () => {
  it('surfaces a bundle that only exists in the prebundled catalog', () => {
    const prebundle = { presets: { [CHAMPIONS]: bun(CHAMPIONS, '2026-06-28T04:41:56.443Z') } };
    const online = { presets: { [VGC]: bun(VGC, '2025-08-14T06:37:44.128Z') } };

    const { buns, sources } = mergeBundleCatalogs(prebundle, online);

    expect(Object.keys(buns.presets)).toEqual(expect.arrayContaining([CHAMPIONS, VGC]));
    expect(buns.presets[CHAMPIONS]).toBeDefined();
    expect(sources.presets[CHAMPIONS]).toBe('prebundle');
  });

  it('keeps the prebundled entry when it has the fresher updated date', () => {
    const prebundle = { presets: { [VGC]: bun(VGC, '2026-06-28T04:41:56.443Z', { label: 'fresh' }) } };
    const online = { presets: { [VGC]: bun(VGC, '2025-08-14T06:37:44.128Z', { label: 'stale' }) } };

    const { buns, sources } = mergeBundleCatalogs(prebundle, online);

    expect(buns.presets[VGC].label).toBe('fresh');
    expect(sources.presets[VGC]).toBe('prebundle');
  });

  it('keeps the online entry when it has the fresher updated date', () => {
    const prebundle = { presets: { [VGC]: bun(VGC, '2025-08-14T06:37:44.128Z', { label: 'stale' }) } };
    const online = { presets: { [VGC]: bun(VGC, '2026-09-01T00:00:00.000Z', { label: 'fresh' }) } };

    const { buns, sources } = mergeBundleCatalogs(prebundle, online);

    expect(buns.presets[VGC].label).toBe('fresh');
    expect(sources.presets[VGC]).toBe('online');
  });

  it('prefers online on an exact date tie (canonical published source)', () => {
    const same = '2026-06-28T04:41:56.443Z';
    const prebundle = { presets: { [VGC]: bun(VGC, same, { label: 'pre' }) } };
    const online = { presets: { [VGC]: bun(VGC, same, { label: 'onl' }) } };

    const { buns, sources } = mergeBundleCatalogs(prebundle, online);

    expect(buns.presets[VGC].label).toBe('onl');
    expect(sources.presets[VGC]).toBe('online');
  });

  it('includes online-only bundles tagged as the online source', () => {
    const prebundle = { presets: {} };
    const online = { presets: { [VGC]: bun(VGC, '2025-08-14T06:37:44.128Z') } };

    const { buns, sources } = mergeBundleCatalogs(prebundle, online);

    expect(buns.presets[VGC]).toBeDefined();
    expect(sources.presets[VGC]).toBe('online');
  });

  it('falls back to the prebundled catalog entirely when there is no online catalog', () => {
    const prebundle = {
      presets: { [CHAMPIONS]: bun(CHAMPIONS, '2026-06-28T04:41:56.443Z') },
      players: { p1: bun('p1', '2025-01-01T00:00:00.000Z') },
    };

    const { buns, sources } = mergeBundleCatalogs(prebundle, undefined);

    expect(buns.presets[CHAMPIONS]).toBeDefined();
    expect(sources.presets[CHAMPIONS]).toBe('prebundle');
    expect(buns.players.p1).toBeDefined();
    expect(sources.players.p1).toBe('prebundle');
  });

  it('merges across multiple namespaces independently', () => {
    const prebundle = {
      presets: { [CHAMPIONS]: bun(CHAMPIONS, '2026-06-28T04:41:56.443Z') },
      supporters: { s1: bun('s1', '2026-06-28T00:00:00.000Z', { label: 'pre' }) },
    };
    const online = {
      presets: { [VGC]: bun(VGC, '2025-08-14T06:37:44.128Z') },
      supporters: { s1: bun('s1', '2024-01-01T00:00:00.000Z', { label: 'onl' }) },
    };

    const { buns, sources } = mergeBundleCatalogs(prebundle, online);

    expect(Object.keys(buns.presets)).toEqual(expect.arrayContaining([CHAMPIONS, VGC]));
    expect(buns.supporters.s1.label).toBe('pre'); // prebundle fresher
    expect(sources.supporters.s1).toBe('prebundle');
  });
});

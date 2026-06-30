import {
 describe, expect, it, vi,
} from 'vitest';

// mock the two sub-transformers so we test ONLY the shape-based routing (not their Dex-dependent guts)
vi.mock('./transformFormatStatsResponse', () => ({
  transformFormatStatsResponse: vi.fn(() => [{ name: 'Showdown Usage', source: 'usage' }]),
}));
vi.mock('./transformFormatPresetResponse', () => ({
  transformFormatPresetResponse: vi.fn(() => [{ name: 'Some Set', source: 'bundle' }]),
}));

const { transformBundlePresetResponse } = await import('./transformBundlePresetResponse');
const { transformFormatStatsResponse } = await import('./transformFormatStatsResponse');
const { transformFormatPresetResponse } = await import('./transformFormatPresetResponse');

const args = { gen: 9, format: 'championsou' } as never;

describe('transformBundlePresetResponse()', () => {
  it('routes a usage-stats-shaped payload ({ pokemon: {...} }) to the stats transformer', () => {
    const out = transformBundlePresetResponse(
      { pokemon: { Garchomp: { usage: { weighted: 0.5 }, abilities: { 'Rough Skin': 1 } } } } as never,
      null,
      args,
    );

    expect(transformFormatStatsResponse).toHaveBeenCalledOnce();
    expect(transformFormatPresetResponse).not.toHaveBeenCalled();
    expect(out[0].source).toBe('usage');
  });

  it('routes a sets-shaped payload ({ [mon]: { [setName]: set } }) to the preset transformer', () => {
    const out = transformBundlePresetResponse(
      { Venusaur: { 'Sun Sleep Offense': { ability: 'Chlorophyll', moves: ['Leaf Storm'] } } } as never,
      null,
      args,
    );

    expect(transformFormatPresetResponse).toHaveBeenCalledOnce();
    expect(out[0].source).toBe('bundle');
  });

  it('treats an empty payload as sets (no spurious usage routing)', () => {
    transformBundlePresetResponse({} as never, null, args);
    expect(transformFormatPresetResponse).toHaveBeenCalledOnce();
  });

  it('folds mega/primal/X-Y formes onto their base forme in Randoms (item distinguishes them)', () => {
    vi.mocked(transformFormatPresetResponse).mockReturnValueOnce([
      { name: 'Fast Support', speciesForme: 'Glimmora', source: 'bundle' },
      { name: 'Fast Attacker', speciesForme: 'Glimmora-Mega', source: 'bundle' },
      { name: 'Bulky', speciesForme: 'Charizard-Mega-X', source: 'bundle' },
      { name: 'Sun', speciesForme: 'Groudon-Primal', source: 'bundle' },
      { name: 'Z', speciesForme: 'Necrozma-Ultra', source: 'bundle' }, // NOT a held-stone mega -> stays
      { name: 'Speed', speciesForme: 'Yanmega', source: 'bundle' }, // 'mega' substring, no '-Mega' -> stays
    ] as never);

    const out = transformBundlePresetResponse(
      { Glimmora: { 'Fast Support': {} } } as never,
      null,
      { gen: 9, format: 'gen9championsrandombattle' } as never,
    );

    expect(out.map((p) => p.speciesForme)).toEqual([
      'Glimmora', 'Glimmora', 'Charizard', 'Groudon', 'Necrozma-Ultra', 'Yanmega',
    ]);
  });

  it('leaves mega/primal formes split in non-Randoms formats', () => {
    vi.mocked(transformFormatPresetResponse).mockReturnValueOnce([
      { name: 'Fast Attacker', speciesForme: 'Glimmora-Mega', source: 'bundle' },
    ] as never);

    const out = transformBundlePresetResponse(
      { 'Glimmora-Mega': { 'Fast Attacker': {} } } as never,
      null,
      { gen: 9, format: 'gen9championsou' } as never,
    );

    expect(out[0].speciesForme).toBe('Glimmora-Mega');
  });
});

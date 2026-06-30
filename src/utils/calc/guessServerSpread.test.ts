import { describe, expect, it } from 'vitest';
import { calcPokemonStat } from './calcPokemonStat';
import { guessServerSpread } from './guessServerSpread';

const CHAMPS = 'gen9championsrandombattle';

// Cam's L48 Kommo-o base stats
const KOMMO_O = {
 hp: 75, atk: 110, def: 125, spa: 100, spd: 105, spe: 85,
};
const STATS = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'] as const;

// build a server-stats table from a known Champions stat-point spread (using the corrected formula)
const serverStatsFrom = (points, nature, level) => Object.fromEntries(
  STATS.map((s) => [s, calcPokemonStat(CHAMPS, s, KOMMO_O[s], 31, points[s], level, nature)]),
) as Showdown.StatsTable;

describe('guessServerSpread() — Champions', () => {
  it('recovers a spread that reproduces the server stats (incl. a 10-pt stat that step-4 would skip)', () => {
    // 10 HP pts is the screenshot case: 10 % 4 !== 0, so the old `ev += 4` loop could never match it
    const points = {
 hp: 10, atk: 20, def: 0, spa: 0, spd: 6, spe: 30,
}; // sum 66 (valid budget)
    const level = 48;
    const serverStats = serverStatsFrom(points, 'Adamant', level);

    const pokemon = {
      speciesForme: 'Kommo-o', source: 'server', level, baseStats: KOMMO_O, serverStats,
    } as unknown as Parameters<typeof guessServerSpread>[1];

    const guess = guessServerSpread(CHAMPS, pokemon, 'Adamant');

    expect(guess).toBeTruthy();
    expect(guess.nature).toBe('Adamant');
    // the guessed spread must REPRODUCE every server stat (points may differ where truncation aliases them)
    for (const s of STATS) {
      const got = calcPokemonStat(CHAMPS, s, KOMMO_O[s], 31, guess.evs[s], level, guess.nature);
      expect(got, `stat ${s}`).toBe(serverStats[s]);
      expect(guess.evs[s], `pts ${s} in 0..32`).toBeLessThanOrEqual(32);
    }
  });
});

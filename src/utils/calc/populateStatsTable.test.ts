import { describe, expect, it } from 'vitest';
import { populateStatsTable } from './populateStatsTable';

describe('populateStatsTable()', () => {
  it('fills omitted EVs with the standard 0 default for non-random formats', () => {
    const out = populateStatsTable({ hp: 252, def: 252, spd: 4 }, { spread: 'ev', format: 'gen9ou' });

    expect(out).toStrictEqual({
 hp: 252, atk: 0, def: 252, spa: 0, spd: 4, spe: 0,
});
  });

  it('fills omitted Champions randbats stat points with 0 (not the randoms 85)', () => {
    // mirrors NCP/randbats Ampharos: a special attacker that omits atk -> atk should be 0 stat points,
    // NOT 85 (which would give it a huge physical Attack it should never have)
    const out = populateStatsTable(
      {
 hp: 11, def: 11, spa: 11, spd: 11, spe: 11,
},
      { spread: 'ev', format: 'gen9championsrandombattle' },
    );

    expect(out.atk).toBe(0);
    expect(out).toStrictEqual({
 hp: 11, atk: 0, def: 11, spa: 11, spd: 11, spe: 11,
});
  });

  it('still fills omitted EVs with the randoms 85 default for normal randbats', () => {
    const out = populateStatsTable({ spa: 85, spe: 85 }, { spread: 'ev', format: 'gen9randombattle' });

    expect(out.atk).toBe(85);
  });
});

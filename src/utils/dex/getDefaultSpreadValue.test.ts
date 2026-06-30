import { describe, expect, it } from 'vitest';
import { getDefaultSpreadValue } from './getDefaultSpreadValue';

describe('getDefaultSpreadValue()', () => {
  // also doubles as a guard that the .env config actually loaded under test
  it('returns the randoms EV default (85) for normal random formats', () => {
    expect(getDefaultSpreadValue('ev', 'gen9randombattle')).toBe(85);
  });

  it('returns the standard EV default (0) for non-random formats', () => {
    expect(getDefaultSpreadValue('ev', 'gen9ou')).toBe(0);
  });

  it('does NOT treat Champions randbats as randoms (stat points default to 0, not 85)', () => {
    // gen9championsrandombattle matches .includes('random') but uses Champions stat points,
    // whose unallocated slots default to 0 -- a randoms 85 would wildly inflate them
    expect(getDefaultSpreadValue('ev', 'gen9championsrandombattle')).toBe(0);
  });

  it('returns 0 for non-random Champions formats too', () => {
    expect(getDefaultSpreadValue('ev', 'gen9championsvgc2026')).toBe(0);
  });

  it('still returns the standard IV default (31) for Champions formats', () => {
    expect(getDefaultSpreadValue('iv', 'gen9championsrandombattle')).toBe(31);
  });
});

import { describe, expect, it } from 'vitest';
import { calcPokemonStat } from './calcPokemonStat';

// Champions stat formula (PS `champions` mod w/ levelclausemod): the standard level-scaled formula with
// floor(EV/4) replaced by max(2*statPoints - 1, 0) & a fixed 31 IV. The flat L50 form (base+pts+20/75) is
// just this evaluated at level 50 -- so VGC (fixed L50) must stay unchanged while other levels get corrected.
const CHAMPS = 'gen9championsrandombattle';

describe('calcPokemonStat() — Champions', () => {
  // Cam's L48 Kommo-o (base HP 75, Atk 110) — the screenshot's "Yours" set
  it('HP scales with level (L48 Kommo-o, base 75, 10 pts) = 154', () => {
    expect(calcPokemonStat(CHAMPS, 'hp', 75, 31, 10, 48)).toBe(154);
  });

  it('neutral Atk at L48 (base 110, 0 pts) = 125', () => {
    expect(calcPokemonStat(CHAMPS, 'atk', 110, 31, 0, 48, 'Hardy')).toBe(125);
  });

  it('+Atk (Adamant) at L48 (base 110, 0 pts) = 137', () => {
    expect(calcPokemonStat(CHAMPS, 'atk', 110, 31, 0, 48, 'Adamant')).toBe(137);
  });

  it('+Atk (Adamant) at L48 (base 110, 32 pts) = 170', () => {
    expect(calcPokemonStat(CHAMPS, 'atk', 110, 31, 32, 48, 'Adamant')).toBe(170);
  });

  // L50 regressions — must equal the old flat formula (base + pts + 75 / base + pts + 20)
  it('HP at L50 (base 75, 10 pts) = 160 (== flat base+pts+75)', () => {
    expect(calcPokemonStat(CHAMPS, 'hp', 75, 31, 10, 50)).toBe(160);
  });

  it('+Atk (Adamant) at L50 (base 110, 0 pts) = 143 (== flat (base+pts+20)*1.1)', () => {
    expect(calcPokemonStat(CHAMPS, 'atk', 110, 31, 0, 50, 'Adamant')).toBe(143);
  });

  it('Shedinja HP (base 1) stays 1', () => {
    expect(calcPokemonStat(CHAMPS, 'hp', 1, 31, 0, 50)).toBe(1);
  });

  // "floating" stat points (e.g. 10.5, from EV 80 via the 1st-pt=4EVs/rest=8EVs rule) are legit & must be
  // handled cleanly: 2*pts-1 stays integer for half-points, & the result matches the EV-80 standard stat.
  it('handles fractional (floating) stat points distinctly from their floor', () => {
    // at L100 the *level/100 factor is 1, so the half-point difference is visible (no truncation aliasing)
    expect(calcPokemonStat(CHAMPS, 'atk', 100, 31, 10, 100, 'Hardy')).toBe(255); // (200+31+19)+5
    expect(calcPokemonStat(CHAMPS, 'atk', 100, 31, 10.5, 100, 'Hardy')).toBe(256); // (200+31+20)+5 — EV-80 equiv
  });
});

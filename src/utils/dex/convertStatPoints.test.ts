import { describe, expect, it } from 'vitest';
import { evToStatPoint, statPointToEv } from './convertStatPoints';

describe('evToStatPoint()', () => {
  it('maps clean EVs to integer points (1st pt = 4 EVs, rest = 8)', () => {
    expect(evToStatPoint(0)).toBe(0);
    expect(evToStatPoint(4)).toBe(1);
    expect(evToStatPoint(132)).toBe(17);
    expect(evToStatPoint(116)).toBe(15);
    expect(evToStatPoint(252)).toBe(32);
  });

  it('rounds to the nearest integer point for EVs not of the form 8N-4 (Champions points are integers)', () => {
    expect(evToStatPoint(248)).toBe(32); // Cam's case: 248 HP -> 31.5 -> 32 (no more "31.5 SPs" lol)
    expect(evToStatPoint(8)).toBe(2); // 1.5 -> 2
    expect(evToStatPoint(80)).toBe(11); // 10.5 -> 11
    expect(evToStatPoint(84)).toBe(11); // 11 exactly (8*11-4)
  });

  it('clamps to 32 & floors negatives to 0', () => {
    expect(evToStatPoint(508)).toBe(32);
    expect(evToStatPoint(-4)).toBe(0);
  });
});

describe('statPointToEv()', () => {
  it('inverts evToStatPoint for integer points', () => {
    expect(statPointToEv(0)).toBe(0);
    expect(statPointToEv(1)).toBe(4);
    expect(statPointToEv(17)).toBe(132);
    expect(statPointToEv(32)).toBe(252);
  });

  it('inverts fractional points', () => {
    expect(statPointToEv(10.5)).toBe(80);
  });
});

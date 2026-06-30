import { describe, expect, it } from 'vitest';
import { TeledexBuffer } from './teledexBuffer';
import { buildTeledexRecord } from './teledexRecord';

const rec = (level, scope, args = [], ts = 0) => buildTeledexRecord(level, scope, args, ts);

describe('TeledexBuffer', () => {
  it('evicts oldest (FIFO) past the cap', () => {
    const b = new TeledexBuffer(2);
    b.push(rec('info', 'a', [], 1));
    b.push(rec('info', 'b', [], 2));
    b.push(rec('info', 'c', [], 3));
    expect(b.size()).toBe(2);
    expect(b.all().map((r) => r.scope)).toEqual(['b', 'c']);
  });

  it('tail(n) returns the most recent n in order', () => {
    const b = new TeledexBuffer(10);
    ['a', 'b', 'c'].forEach((s, i) => b.push(rec('info', s, [], i)));
    expect(b.tail(2).map((r) => r.scope)).toEqual(['b', 'c']);
  });

  it('filters by min level value, scope substring, and text', () => {
    const b = new TeledexBuffer(10);
    b.push(rec('debug', 'useBattlePresets', ['usages'], 1)); // value 20
    b.push(rec('warn', 'selectPreset', ['fmt mismatch'], 2)); // value 40
    expect(b.filter({ level: 40 }).map((r) => r.scope)).toEqual(['selectPreset']);
    expect(b.filter({ scope: 'battle' }).map((r) => r.scope)).toEqual(['useBattlePresets']);
    expect(b.filter({ text: 'mismatch' }).map((r) => r.scope)).toEqual(['selectPreset']);
  });

  it('setMax shrinks in place; clear empties', () => {
    const b = new TeledexBuffer(10);
    [1, 2, 3].forEach((i) => b.push(rec('info', `s${i}`, [], i)));
    b.setMax(1);
    expect(b.all().map((r) => r.scope)).toEqual(['s3']);
    b.clear();
    expect(b.size()).toBe(0);
  });
});

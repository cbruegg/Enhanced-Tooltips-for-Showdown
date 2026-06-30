import { describe, expect, it } from 'vitest';
import { boundedStringify, safeStringify } from './safeStringify';

describe('boundedStringify()', () => {
  it('stringifies plain values like JSON.stringify', () => {
    expect(boundedStringify({ a: 1, b: 'x' })).toBe('{"a":1,"b":"x"}');
    expect(boundedStringify([1, 2, 3])).toBe('[1,2,3]');
    expect(boundedStringify('hi')).toBe('"hi"');
  });

  it('does NOT throw on circular references (the live-battle Showdown object case)', () => {
    const circular: Record<string, unknown> = { name: 'battle' };
    circular.self = circular;

    expect(() => boundedStringify(circular)).not.toThrow();
    expect(boundedStringify(circular)).toContain('[Circular]');
    expect(boundedStringify(circular)).toContain('battle');
  });

  it('bails at maxLength (so a huge graph cannot OOM)', () => {
    const huge = { blob: 'x'.repeat(100_000) };
    const out = boundedStringify(huge, 200);

    expect(out.length).toBeLessThanOrEqual(201); // 200 + the trailing '…'
    expect(out.endsWith('…')).toBe(true);
  });

  it('stops descending past maxDepth', () => {
    const deep = { a: { b: { c: { d: { e: 'too deep' } } } } };
    const out = boundedStringify(deep, 10_000, 2);

    expect(out).toContain('[…]');
    expect(out).not.toContain('too deep');
  });

  it('never throws on functions/symbols/bigints', () => {
    expect(() => boundedStringify({ fn: () => {}, sym: Symbol('s'), big: 10n })).not.toThrow();
  });
});

describe('safeStringify()', () => {
  it('round-trips normal payloads', () => {
    expect(JSON.parse(safeStringify({ a: 1, list: [1, 2] }))).toEqual({ a: 1, list: [1, 2] });
  });
});

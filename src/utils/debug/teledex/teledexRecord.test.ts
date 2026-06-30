import { describe, expect, it } from 'vitest';
import { buildTeledexRecord, teledexSession } from './teledexRecord';

describe('buildTeledexRecord()', () => {
  it('builds a structured record with a numeric level + session + monotonic-ish id', () => {
    const r = buildTeledexRecord('warn', '@showdex/x', ['oops', { a: 1 }], 1000);
    expect(r).toMatchObject({
 ts: 1000, level: 'warn', value: 40, scope: '@showdex/x', args: ['oops', { a: 1 }], session: teledexSession,
});
    expect(typeof r.id).toBe('string');
    expect(r.id.length).toBeGreaterThan(0);
  });

  it('gives distinct ids to records at the same ts', () => {
    const a = buildTeledexRecord('info', 's', [], 1);
    const b = buildTeledexRecord('info', 's', [], 1);
    expect(a.id).not.toBe(b.id);
  });
});

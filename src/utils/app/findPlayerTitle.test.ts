import { describe, expect, it } from 'vitest';
import { findPlayerTitle } from './findPlayerTitle';

// minimal title/tier fixtures — donor "Paid Pal" precedes the patreon titles in the array (as in the real data)
const titles = [
  { title: 'Paid Pal', supporterId: 'donor', userIds: ['someuser'] },
  { title: 'Blaziken Patron', supporterId: 'patreon-tier-01', userIds: ['someuser'] },
  { title: 'Pop Bomb Patron', supporterId: 'patreon-tier-02', userIds: [] },
] as unknown as Parameters<typeof findPlayerTitle>[1]['titles'];

// `???` (no-username) members resolve via their tier; James G is in BOTH donor & T.2 patron tiers
const tiers = [
  { id: 'donor', members: [{ name: 'James G' }] },
  { id: 'patreon-tier-02', members: [{ name: 'James G' }] },
] as unknown as Parameters<typeof findPlayerTitle>[1]['tiers'];

describe('findPlayerTitle()', () => {
  it('prefers the Patreon title over the donor title (??? member in both tiers)', () => {
    const got = findPlayerTitle('James G', { showdownUser: false, titles, tiers });
    expect(got?.title).toBe('Pop Bomb Patron');
  });

  it('prefers the Patreon title over donor for a Showdown user in both', () => {
    const got = findPlayerTitle('Some User', { showdownUser: true, titles, tiers });
    expect(got?.title).toBe('Blaziken Patron'); // patreon-tier-01 > donor
  });

  it('returns the only matching title when there is no conflict', () => {
    const onlyDonor = [titles[0]] as typeof titles;
    expect(findPlayerTitle('Some User', { showdownUser: true, titles: onlyDonor, tiers })?.title).toBe('Paid Pal');
  });
});

/**
 * @file `pokemon-ability.d.ts` - Adapted from `pokemon-showdown-client/play.pokemonshowdown.com/src/battle-dex-data.ts`.
 * @author Keith Choison <keith@tize.io>
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 * @since 0.1.0
 */

declare namespace Showdown {
  interface AbilityFlags {
    /** Can be suppressed by Mold Breaker & related effects. */
    breakable?: 1;
    /** Ability can't be suppressed by e.g. Gastro Acid or Neutralizing Gas. */
    cantsuppress?: 1;
    /** Role Play fails if target has this Ability. */
    failroleplay?: 1;
    /** Skill Swap fails if either the user or target has this Ability. */
    failskillswap?: 1;
    /** Entrainment fails if user has this Ability. */
    noentrain?: 1;
    /** Receiver and Power of Alchemy will not activate if an ally faints with this Ability. */
    noreceiver?: 1;
    /** Trace cannot copy this Ability. */
    notrace?: 1;
    /** Disables the Ability if the user is Transformed. */
    notransform?: 1;
  }

  class Ability implements Effect {
    public readonly effectType = 'Ability' as const;
    public readonly id: ID;
    public readonly name: string;
    public readonly gen: number;
    public readonly exists: boolean;
    public readonly num: number;
    public readonly desc: string;
    public readonly shortDesc: string;
    public readonly rating: number;
    public readonly flags: AbilityFlags;
    public readonly isNonstandard: boolean;

    public constructor(id: ID, name: string, data: unknown);
  }

  /** Adapted from `pokemon-showdown-client/build-tools/build-indexes`. */
  interface BattleAbilities {
    [abilityId: string]: Ability;
  }
}

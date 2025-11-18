/**
 * @file `battle-move.d.ts` - Adapted from `pokemon-showdown-client/play.pokemonshowdown.com/src/battle-dex-data.ts`.
 * @author Keith Choison <keith@tize.io>
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license MIT
 * @since 0.1.0
 */

declare namespace Showdown {
  interface MoveFlags {
    /** The move has an animation when used on an ally. */
    allyanim?: 1 | 0;
    /** Power is multiplied by 1.5 when used by a Pokemon with the Strong Jaw Ability. */
    bite?: 1 | 0;
    /** Has no effect on Pokemon with the Bulletproof Ability. */
    bullet?: 1 | 0;
    /** Ignores a target's substitute. */
    bypasssub?: 1 | 0;
    /** The user is unable to make a move between turns. */
    charge?: 1 | 0;
    /** Makes contact. */
    contact?: 1 | 0;
    /** When used by a Pokemon, other Pokemon with the Dancer Ability can attempt to execute the same move. */
    dance?: 1 | 0;
    /** Thaws the user if executed successfully while the user is frozen. */
    defrost?: 1 | 0;
    /** Can target a Pokemon positioned anywhere in a Triple Battle. */
    distance?: 1 | 0;
    /** Prevented from being executed or selected during Gravity's effect. */
    gravity?: 1 | 0;
    /** Prevented from being executed or selected during Heal Block's effect. */
    heal?: 1 | 0;
    /** Can be copied by Mirror Move. */
    mirror?: 1 | 0;
    /** Prevented from being executed or selected in a Sky Battle. */
    nonsky?: 1 | 0;
    /** Has no effect on Grass-type Pokemon, Pokemon with the Overcoat Ability, and Pokemon holding Safety Goggles. */
    powder?: 1 | 0;
    /** Blocked by Detect, Protect, Spiky Shield, and if not a Status move, King's Shield. */
    protect?: 1 | 0;
    /** Power is multiplied by 1.5 when used by a Pokemon with the Mega Launcher Ability. */
    pulse?: 1 | 0;
    /** Power is multiplied by 1.2 when used by a Pokemon with the Iron Fist Ability. */
    punch?: 1 | 0;
    /** If this move is successful, the user must recharge on the following turn and cannot make a move. */
    recharge?: 1 | 0;
    /** Bounced back to the original user by Magic Coat or the Magic Bounce Ability. */
    reflectable?: 1 | 0;
    /** Can be stolen from the original user and instead used by another Pokemon using Snatch. */
    snatch?: 1 | 0;
    /** Has no effect on Pokemon with the Soundproof Ability. */
    sound?: 1 | 0;
  }

  type MoveTarget =
    // single-target
    | 'normal'
    | 'any'
    | 'adjacentAlly'
    | 'adjacentFoe'
    | 'adjacentAllyOrSelf'
    // single-target, automatic
    | 'self'
    | 'randomNormal'
    // spread
    | 'allAdjacent'
    | 'allAdjacentFoes'
    // side & field
    | 'allySide'
    | 'foeSide'
    | 'all';

  type MoveCategory =
    | 'Physical'
    | 'Special'
    | 'Status';

  class Move implements Effect {
    public readonly effectType = 'Move' as const;
    public readonly id: ID;
    public readonly name: string;
    public readonly gen: number;
    public readonly exists: boolean;
    public readonly basePower: number;
    public readonly accuracy: number | true;
    public readonly pp: number;
    public readonly type: TypeName;
    public readonly category: MoveCategory;
    public readonly priority: number;
    public readonly target: MoveTarget;
    public readonly pressureTarget: MoveTarget;
    public readonly flags: Readonly<MoveFlags>;
    public readonly critRatio: number;
    public readonly damage?: number | 'level' | false;
    public readonly desc: string;
    public readonly shortDesc: string;
    public readonly isNonstandard?: string = null;
    public readonly isZ: ID;
    public readonly zMove?: { basePower?: number; effect?: string; boost?: StatsTable; };
    public readonly isMax: boolean | string;
    public readonly maxMove: { basePower: number; };
    public readonly ohko?: true | 'Ice';
    public readonly recoil?: number[];
    public readonly heal?: number[];
    public readonly multihit?: number | number[];
    public readonly hasCrashDamage: boolean;
    public readonly basePowerCallback: boolean;
    public readonly noPPBoosts: boolean;
    public readonly status: string;
    public readonly secondaries: ReadonlyArray<unknown>;
    public readonly num: number;

    public constructor(id: ID, name: string, data: unknown);
  }

  /** Adapted from `pokemon-showdown-client/build-tools/build-indexes`. */
  interface BattleMovedex {
    [moveId: string]: Move;
  }
}

/**
 * @file `pokemon-effect.d.ts` - Adapted from `pokemon-showdown-client/play.pokemonshowdown.com/src/battle-dex-data.ts`.
 * @author Keith Choison <keith@tize.io>
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license MIT
 * @since 0.1.0
 */

declare namespace Showdown {
  type EffectType =
    | 'Item'
    | 'Move'
    | 'Ability'
    | 'Species'
    | 'PureEffect';

  interface Effect {
    readonly id: ID;
    readonly name: string;
    readonly gen: number;
    readonly effectType: EffectType;
    /**
     * Do we have data on this item/move/ability/species?
     *
     * @warning Always `false` if the relevant data files aren't loaded.
     */
    readonly exists: boolean;
  }

  class PureEffect implements Effect {
    public readonly effectType = 'PureEffect' as const;
    public readonly id: ID;
    public readonly name: string;
    public readonly gen: number;
    public readonly exists: boolean;

    public constructor(id: ID, name: string);
  }

  interface Type extends Effect {
    damageTaken?: Record<string, unknown>;
    HPivs?: Partial<Showdown.StatsTable>;
    HPdvs?: Partial<Showdown.StatsTable>;
  }
}

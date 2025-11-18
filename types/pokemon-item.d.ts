/**
 * @file `pokemon-item.d.ts` - Adapted from `pokemon-showdown-client/play.pokemonshowdown.com/src/battle-dex-data.ts`.
 * @author Keith Choison <keith@tize.io>
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license MIT
 * @since 0.1.0
 */

declare namespace Showdown {
  class Item implements Effect {
    public readonly effectType = 'Item' as const;
    public readonly id: ID;
    public readonly name: string;
    public readonly gen: number;
    public readonly exists: boolean;
    public readonly num: number;
    public readonly spritenum: number;
    public readonly desc: string;
    public readonly shortDesc: string;
    public readonly megaStone: string;
    public readonly megaEvolves: string;
    public readonly zMove?: string | true;
    public readonly zMoveType: TypeName | '';
    public readonly zMoveFrom: string;
    public readonly zMoveUser?: readonly string[];
    public readonly onPlate: TypeName;
    public readonly onMemory: TypeName;
    public readonly onDrive: TypeName;
    public readonly fling: unknown;
    public readonly naturalGift: { basePower: number; type: TypeName; };
    public readonly isPokeball: boolean;
    public readonly itemUser?: readonly string[];

    public constructor(id: ID, name: string, data: unknown);
  }
}

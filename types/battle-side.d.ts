/**
 * @file `battle-side.d.ts` - Adapted from `pokemon-showdown-client/play.pokemonshowdown.com/src/battle.ts`.
 * @author Keith Choison <keith@tize.io>
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license MIT
 */

declare namespace Showdown {
  /** Adapted from `addSideCondition()` in `pokemon-showdown-client/play.pokemonshowdown.com/js/battle.js`. */
  type SideConditionName =
    | 'auroraveil'
    | 'firepledge'
    | 'gmaxcannonade'
    | 'gmaxsteelsurge'
    | 'gmaxvinelash'
    | 'gmaxvolcalith'
    | 'gmaxwildfire'
    | 'grasspledge'
    | 'lightscreen'
    | 'luckychant'
    | 'mist'
    | 'reflect'
    | 'safeguard'
    | 'spikes'
    | 'stealthrock'
    | 'stickyweb'
    | 'tailwind'
    | 'toxicspikes'
    | 'waterpledge';

  type SideConditionState = [
    effectName: string,
    levels: number,
    minDuration: number,
    maxDuration: number,
  ];

  class Side {
    public battle: Battle;
    public name = '';
    public id = '';
    public sideid: SideID;
    public n: number;
    public isFar: boolean;
    public foe?: Side;
    public ally?: Side;
    public avatar = 'unknown';
    public rating = '';
    public totalPokemon = 6;
    public x = 0;
    public y = 0;
    public z = 0;
    public missedPokemon?: Pokemon = null;
    public wisher?: Pokemon = null;
    public active: Pokemon[] = [null];
    public lastPokemon?: Pokemon = null;
    public pokemon: Pokemon[] = [];

    /** `[effectName, levels, minDuration, maxDuration]` */
    public sideConditions: Partial<Record<SideConditionName, SideConditionState>> = {};
    public faintCounter = 0;

    public constructor(battle: Battle, n: number);

    public destroy(): void;
    public reset(): void;

    public rollTrainerSprites(): void;
    public behindx(offset: number): number;
    public behindy(offset: number): number;
    public leftof(offset: number): number;
    public behind(offset: number): number;
    public clearPokemon(): void;
    public setAvatar(avatar: string): void;
    public setName(name: string, avatar?: string): void;
    public addSideCondition(effect: Effect): void;
    public removeSideCondition(condition: string): void;
    public addPokemon(name: string, ident: string, details: string, replaceSlot?: number): Pokemon;
    public switchIn(pokemon: Pokemon, slot?: number): void;
    public dragIn(pokemon: Pokemon, slot?: number): void;
    public replace(pokemon: Pokemon, slot?: number): void;
    public switchOut(pokemon: Pokemon, slot?: number): void;
    public swapTo<T extends Record<string, unknown>>(pokemon: Pokemon, slot: number, kwArgs?: T): void;
    public swapWith<T extends Record<string, unknown>>(pokemon: Pokemon, target: Pokemon, kwArgs?: T): void;
    public faint(pokemon: Pokemon, slot?: number): void;
  }
}

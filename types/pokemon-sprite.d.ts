/**
 * @file `pokemon-sprite.d.ts` - Adapted from `pokemon-showdown-client/play.pokemonshowdown.com/src/battle-animations.ts`.
 * @author Keith Choison <keith@tize.io>
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license MIT
 * @since 0.1.0
 */

declare namespace Showdown {
  class PokemonSprite extends Sprite {
    protected static statusTable: { [id: string]: [string, 'good' | 'neutral' | 'bad'] | string; };
    public forme = '';
    public cryurl?: string;
    public subsp?: SpriteData;
    public $sub?: JQuery<HTMLElement>;
    public $statbar: JQuery<HTMLElement>;
    public isSubActive = false;
    public isFrontSprite?: boolean;
    public isMissedPokemon = false;
    /**
     * If the Pokemon is transformed, `sprite.sp` will be the transformed `SpriteData` & * `sprite.oldsp` will hold
     * the original form's `SpriteData`.
     */
    public oldsp?: SpriteData;
    public statbarLeft = 0;
    public statbarTop = 0;
    public left = 0;
    public top = 0;
    public effects: { [id: string]: Sprite[]; } = {};

    private static getEffectTag(id: string): string;

    public constructor(spriteData?: SpriteData, pos: InitScenePos, scene: BattleScene, isFrontSprite: boolean);
    public reset(pokemon: Pokemon): void;
    public destroy(): void;
    public delay(time: number): PokemonSprite;
    public anim(end: ScenePos, transition?: string): PokemonSprite;
    public behindx(offset: number): number;
    public behindy(offset: number): number;
    public leftof(offset: number): number;
    public behind(offset: number): number;
    public removeTransform(): void;
    public animSub(instant?: boolean, noAnim?: boolean): void;
    public animSubFade(instant?: boolean): void;
    public beforeMove(): boolean;
    public afterMove(): boolean;
    public removeSub(): void;
    public animReset(): void;
    public recalculatePos(slot: number): void;
    public animSummon(pokemon: Pokemon, slot: number, instant?: boolean): void;
    public animDragIn(pokemon: Pokemon, slot: number): void;
    public animDragOut(pokemon: Pokemon): void;
    public animUnsummon(pokemon: Pokemon, instant?: boolean): void;
    public animFaint(pokemon: Pokemon): void;
    public animTransform(pokemon: Pokemon, isCustomAnim?: boolean, isPermanent?: boolean): void;
    public pokeEffect(id: string): void;
    public addEffect(id: string, instant?: boolean): void;
    public removeEffect(id: string, instant?: boolean): void;
    public clearEffects(): void;
    public dogarsCheck(pokemon: Pokemon): void;
    public getStatbarHTML(pokemon: Pokemon): string;
    public resetStatbar(pokemon: Pokemon, startHidden?: boolean): void;
    public updateStatbarIfExists(pokemon: Pokemon, updatePrevhp?: boolean, updateHp?: boolean): void;
    public updateStatbar(pokemon: Pokemon, updatePrevhp?: boolean, updateHp?: boolean): void;
    public updateHPText(pokemon: Pokemon): void;
  }
}

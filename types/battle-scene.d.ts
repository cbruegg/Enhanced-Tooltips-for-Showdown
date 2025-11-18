/**
 * @file `battle-scene.d.ts` - Adapted from `pokemon-showdown-client/play.pokemonshowdown.com/src/battle-animations.ts`.
 * @author Keith Choison <keith@tize.io>
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license MIT
 * @since 0.1.0
 */

declare namespace Showdown {
  class BattleScene implements BattleSceneStub {
    public battle: Battle;
    public log: BattleLog;
    public animating = true;
    public acceleration = 1;
    /**
     * Note: Not the actual generation of the battle, but the generation of the sprites/background.
     *
     * @default 7
     */
    public gen = 7;
    public mod = '';
    /**
     * * `1` = singles.
     * * `2` = doubles.
     * * `3` = triples.
     *
     * @default 1
     */
    public activeCount = 1;
    public numericId = 0;

    public $frame: JQuery<HTMLElement>;
    public $battle?: JQuery<HTMLElement> = null;
    public $options?: JQuery<HTMLElement> = null;
    public $terrain?: JQuery<HTMLElement> = null;
    public $weather?: JQuery<HTMLElement> = null;
    public $bgEffect?: JQuery<HTMLElement> = null;
    public $bg?: JQuery<HTMLElement> = null;
    public $sprite?: JQuery<HTMLElement> = null;
    public $sprites: [JQuery<HTMLElement>?, JQuery<HTMLElement>?] = [null, null];
    public $spritesFront: [JQuery<HTMLElement>?, JQuery<HTMLElement>?] = [null, null];
    public $stat?: JQuery<HTMLElement> = null;
    public $fx?: JQuery<HTMLElement> = null;
    public $leftbar?: JQuery<HTMLElement> = null;
    public $rightbar?: JQuery<HTMLElement> = null;
    public $turn?: JQuery<HTMLElement> = null;
    public $messagebar?: JQuery<HTMLElement> = null;
    public $delay?: JQuery<HTMLElement> = null;
    public $hiddenMessage?: JQuery<HTMLElement> = null;
    public $tooltips?: JQuery<HTMLElement> = null;

    public tooltips: BattleTooltips;
    public sideConditions: [{ [id: string]: Sprite[]; }, { [id: string]: Sprite[]; }] = [{}, {}];
    public preloadDone = 0;
    public preloadNeeded = 0;
    public bgm?: BattleBGM;
    public bgmNum = 0;
    public backdropImage = '';
    public preloadCache: { [url: string]: HTMLImageElement; } = {};
    public messagebarOpen = false;
    public customControls = false;
    public interruptionCount = 1;
    public curWeather = '';
    public curTerrain = '';

    public timeOffset = 0;
    public pokemonTimeOffset = 0;
    public minDelay = 0;
    /** jQuery objects that need to finish animating. */
    public activeAnimations: JQuery<HTMLElement> = $();

    public static getHPColor(pokemon: { hp: number; maxhp: number; }): HPColor;

    public constructor(battle: Battle, $frame: JQuery<HTMLElement>, $logFrame: JQuery<HTMLElement>);

    public reset(): void;
    public destroy(): void;

    public animationOn(): void;
    public animationOff(): void;
    public stopAnimation(): void;
    public pause(): void;
    public resume(): void;
    public setMute(muted: boolean): void;
    public wait(time: number): void;

    public addSprite(sprite: PokemonSprite): void;
    public showEffect(effect: string | SpriteData, start: ScenePos, end: ScenePos, transition: string, after?: string): void;
    public backgroundEffect(bg: string, duration: number, opacity?: number, delay?: number): void;

    /**
     * Converts a Showdown location (x, y, z, scale, xscale, yscale, opacity) to a
     * jQuery position (top, left, width, height, opacity).
     *
     * * Suitable for passing into `jQuery#css` or `jQuery#animate`.
     * * Display property is passed through if it exists.
     */
    public pos(loc: ScenePos, obj: SpriteData): {
      top: number;
      left: number;
      width: number;
      height: number;
      opacity: number;
    };

    /**
     * Converts a Showdown location to a jQuery transition map (see `pos`).
     *
     * * Suitable for passing into `jQuery#animate`.
     * * `oldLoc` is required for ballistic (jumping) animations.
     */
    public posT(loc: ScenePos, obj: SpriteData, transition?: string, oldLoc?: ScenePos): {
      top: [number, 'linear' | 'ballistic' | 'ballisticUnder' | 'ballistic2' | 'ballistic2Back' | 'ballistic2Under' | 'swing' | 'quadUp' | 'quadDown'];
      left: [number, 'linear' | 'ballistic' | 'ballisticUnder' | 'ballistic2' | 'ballistic2Back' | 'ballistic2Under' | 'swing' | 'quadUp' | 'quadDown'];
      width: [number, 'linear' | 'ballistic' | 'ballisticUnder' | 'ballistic2' | 'ballistic2Back' | 'ballistic2Under' | 'swing' | 'quadUp' | 'quadDown'];
      height: [number, 'linear' | 'ballistic' | 'ballisticUnder' | 'ballistic2' | 'ballistic2Back' | 'ballistic2Under' | 'swing' | 'quadUp' | 'quadDown'];
      opacity: [number, 'linear' | 'ballistic' | 'ballisticUnder' | 'ballistic2' | 'ballistic2Back' | 'ballistic2Under' | 'swing' | 'quadUp' | 'quadDown'];
    };

    public waitFor<T extends HTMLElement = HTMLElement>(elem: JQuery<T>): void;
    public startAnimations(): void;
    public finishAnimations(): void;
    public preemptCatchup(): void;
    public message(message: string): void;
    public maybeCloseMessagebar(args: Args, kwArgs: KwArgs): boolean;
    public closeMessagebar(): boolean;

    public runMoveAnim(moveid: ID, participants: Pokemon[]): void;
    public runOtherAnim(moveid: ID, participants: Pokemon[]): void;
    public runStatusAnim(moveid: ID, participants: Pokemon[]): void;
    public runResidualAnim(moveid: ID, pokemon: Pokemon): void;
    public runPrepareAnim(moveid: ID, attacker: Pokemon, defender: Pokemon): void;

    public updateGen(): void;
    public getDetailsText(pokemon: Pokemon): string;
    public getSidebarHTML(side: Side, posStr: string): string;
    public updateSidebar(side: Side): void;
    public updateLeftSidebar(): void;
    public updateRightSidebar(): void;
    public updateSidebars(): void;
    public updateStatbars(): void;
    public resetSides(skipEmpty?: boolean): void;
    public rebuildTooltips(): void;
    public teamPreview(): void;
    public showJoinButtons(): void;
    public hideJoinButtons(): void;

    public pseudoWeatherLeft(pWeather: WeatherState): string;
    public sideConditionLeft(cond: [string, number, number, number], isFoe: boolean, all?: boolean): string;
    public weatherLeft(): string;
    public sideConditionsLeft(side: Side, all?: boolean): string;
    public upkeepWeather(): void;
    public updateWeather(instant?: boolean): void;
    public resetTurn(): void;
    public incrementTurn(): void;
    public updateAcceleration(): void;
    public addPokemonSprite(pokemon: Pokemon): void;
    public addSideCondition(siden: number, id: ID, instant?: boolean): void;
    public removeSideCondition(siden: number, id: ID): void;
    public resetSideCondition(siden: number, id: ID): void;
    public resetSideConditions(): void;
    public typeAnim(pokemon: Pokemon, types: string): void;
    public resultAnim(pokemon: Pokemon, result: string, type: 'bad' | 'good' | 'neutral' | StatusName): void;
    public abilityActivateAnim(pokemon: Pokemon, result: string): void;
    public damageAnim(pokemon: Pokemon, damage: string | number): void;
    public healAnim(pokemon: Pokemon, damage: string | number): void;

    public removeEffect(pokemon: Pokemon, id: string, instant?: boolean): void;
    public addEffect(pokemon: Pokemon, id: string, instant?: boolean): void;
    public animSummon(pokemon: Pokemon, slot: number, instant?: boolean): void;
    public animUnsummon(pokemon: Pokemon, instant?: boolean): void;
    public animDragIn(pokemon: Pokemon, slot: number): void;
    public animDragOut(pokemon: Pokemon): void;
    public resetStatbar(pokemon: Pokemon, startHidden?: boolean): void;
    public updateStatbar(pokemon: Pokemon, updatePrevhp?: boolean, updateHp?: boolean): void;
    public updateStatbarIfExists(pokemon: Pokemon, updatePrevhp?: boolean, updateHp?: boolean): void;
    public animTransform(pokemon: Pokemon, useSpeciesAnim?: boolean, isPermanent?: boolean): void;
    public clearEffects(pokemon: Pokemon): void;
    public removeTransform(pokemon: Pokemon): void;
    public animFaint(pokemon: Pokemon): void;
    public animReset(pokemon: Pokemon): void;
    public anim(pokemon: Pokemon, end: ScenePos, transition?: string): void;
    public beforeMove(pokemon: Pokemon): void;
    public afterMove(pokemon: Pokemon): void;

    public setFrameHTML(html: unknown): void;
    public setControlsHTML(html: unknown): void;
    public preloadImage(url: string): void;
    public preloadEffects(): void;
    public rollBgm(): void;
    public setBgm(bgmNum: number): void;
    public updateBgm(): void;
    public resetBgm(): void;
  }
}

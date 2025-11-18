/**
 * @file `battle-scene-stub.d.ts` - Adapted from `pokemon-showdown-client/play.pokemonshowdown.com/src/battle-scene-stub.ts`.
 * @author Keith Choison <keith@tize.io>
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license MIT
 * @since 0.1.0
 */

declare namespace Showdown {
  class BattleSceneStub {
    public animating = false;
    public acceleration = NaN;
    public gen = NaN;
    public activeCount = NaN;
    public numericId = NaN;
    public timeOffset = NaN;
    public interruptionCount = NaN;
    public messagebarOpen = false;
    public log: BattleLog;
    public $frame?: JQuery;

    public abilityActivateAnim(pokemon: Pokemon, result: string): void;
    public addPokemonSprite(pokemon: Pokemon): PokemonSprite;
    public addSideCondition(siden: number, id: string, instant?: boolean): void;
    public animationOff(): void;
    public animationOn(): void;
    public maybeCloseMessagebar(args: Args, kwArgs?: KwArgs): boolean;
    public closeMessagebar(): boolean;
    public damageAnim(pokemon: Pokemon, damage: string | number): void;
    public destroy(): void;
    public finishAnimations<T extends HTMLElement = HTMLElement>(): JQuery.Promise<JQuery<T>>;
    public healAnim(pokemon: Pokemon, damage: string | number): void;
    public hideJoinButtons(): void;
    public incrementTurn(): void;
    public updateAcceleration(): void;
    public message(message: string, hiddenMessage?: string): void;
    public pause(): void;
    public setMute(muted: boolean): void;
    public preemptCatchup(): void;
    public removeSideCondition(siden: number, id: string): void;
    public reset(): void;
    public resetBgm(): void;
    public updateBgm(): void;
    public resultAnim(pokemon: Pokemon, result: string, type: 'bad' | 'good' | 'neutral' | 'par' | 'psn' | 'frz' | 'slp' | 'brn'): void;
    public typeAnim(pokemon: Pokemon, types: string): void;
    public resume(): void;
    public runMoveAnim(moveid: string, participants: Pokemon[]): void;
    public runOtherAnim(moveid: string, participants: Pokemon[]): void;
    public runPrepareAnim(moveid: string, attacker: Pokemon, defender: Pokemon): void;
    public runResidualAnim(moveid: string, pokemon: Pokemon): void;
    public runStatusAnim(moveid: string, participants: Pokemon[]): void;
    public startAnimations(): void;
    public teamPreview(): void;
    public resetSides(): void;
    public updateGen(): void;
    public updateSidebar(side: Side): void;
    public updateSidebars(): void;
    public updateStatbars(): void;
    public updateWeather(instant?: boolean): void;
    public upkeepWeather(): void;
    public wait(time: number): void;
    public setFrameHTML<T = unknown>(html: T): void;
    public setControlsHTML<T = unknown>(html: T): void;
    public removeEffect(pokemon: Pokemon, id: string, instant?: boolean): void;
    public addEffect(pokemon: Pokemon, id: string, instant?: boolean): void;
    public animSummon(pokemon: Pokemon, slot: number, instant?: boolean): void;
    public animUnsummon(pokemon: Pokemon, instant?: boolean): void;
    public animDragIn(pokemon: Pokemon, slot: number): void;
    public animDragOut(pokemon: Pokemon): void;
    public updateStatbar(pokemon: Pokemon, updatePrevhp?: boolean, updateHp?: boolean): void;
    public updateStatbarIfExists(pokemon: Pokemon, updatePrevhp?: boolean, updateHp?: boolean): void;
    public animTransform(pokemon: Pokemon, isCustomAnim?: boolean, isPermanent?: boolean): void;
    public clearEffects(pokemon: Pokemon): void;
    public removeTransform(pokemon: Pokemon): void;
    public animFaint(pokemon: Pokemon): void;
    public animReset(pokemon: Pokemon): void;
    public anim(pokemon: Pokemon, end: ScenePos, transition?: string): void;
    public beforeMove(pokemon: Pokemon): void;
    public afterMove(pokemon: Pokemon): void;
  }
}

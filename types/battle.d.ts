/**
 * @file `battle.d.ts` - Adapted from `pokemon-showdown-client/src/battle.ts`.
 * @author Keith Choison <keith@tize.io>
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license MIT
 * @since 0.1.0
 */

declare namespace Showdown {
  type BattleSubscriptionState =
    | 'playing'
    | 'paused'
    | 'turn'
    | 'atqueueend'
    | 'callback'
    | 'ended'
    | 'error';

  type BattleGameType =
    | 'singles'
    | 'doubles'
    | 'triples'
    | 'multi'
    | 'freeforall';

  class Battle {
    public scene: BattleSceneStub;
    /** @deprecated Seems to be `viewpointSwitched` now >:(((((( */
    public sidesSwitched?: boolean;
    public viewpointSwitched = false;
    public stepQueue: string[] = [];
    /** @see {Battle#instantAdd} */
    public preemptStepQueue: string[] = [];
    public waitForAnimations: boolean | 'simult' = true;
    /** Index of the `stepQueue` currently being animated. */
    public currentStep: number;
    /**
     * Seeking state.
     *
     * * `null` = not seeking.
     * * `0` = seek start.
     * * `Infinity` = seek end, otherwise seek turn number.
     *
     * @default null
     */
    public seeking?: number = null;
    public activeMoveIsSpread?: string = null;
    public mute = false;
    public messageFadeTime = 300;
    public messageShownTime = 1;
    /** Used to time the animation acceleration in long battles full of double-switches. */
    public turnSinceMoved = 0;
    /**
     * Current turn number.
     *
     * * `-1` = non-battle `RoomGame`s, pre-*Team Preview* or `|start`.
     * * `0` = post-*Team Preview* or `|start`, but before `|turn|1`.
     *
     * @default -1
     */
    public turn = -1;
    /**
     * Whether the queue has ended and is waiting on more input.
     *
     * * In addition to at the end of the battle, this is also `true` if you're:
     *   - Playing/watching a battle live, &
     *   - Waiting for a player to make a move.
     *
     * @default false
     */
    public atQueueEnd = false;
    /**
     * Whether the battle has been played before or fast-forwarded.
     *
     * * Note that this is **not** exactly representative of `turn > 0`.
     * * Should you start watching a replay, pause before turn 1, `turn` will still be `0`,
     *   but playback should be considered to be started.
     * * Specifically used to display "Play" vs. "Resume".
     *
     * @default false
     */
    public started = false;
    /**
     * Whether the battle reached the point where the player has won or tied.
     *
     * * Affects whether the BGM is playing.
     *
     * @default false
     */
    public ended = false;
    public isReplay = false;
    public usesUpkeep = false;
    public weather = '';
    public pseudoWeather: WeatherState[] = [];
    public weatherTimeLeft = 0;
    public weatherMinTimeLeft = 0;
    /**
     * Side from which perspective we're viewing.
     *
     * * Should be identical to `nearSide`.
     *   - Exception is mutli-battles, where `nearSide` is always the first near side & `mySide` is the active player.
     */
    public mySide?: Side;
    public nearSide?: Side;
    public farSide?: Side;
    public p1?: Side;
    public p2?: Side;
    public p3?: Side;
    public p4?: Side;
    public pokemonControlled = 0;
    public sides?: Side[];
    public myPokemon?: ServerPokemon[];
    public myAllyPokemon?: ServerPokemon[];
    public lastMove = '';
    public gen: number;
    public dex: Dex;
    public teamPreviewCount = 0;
    public speciesClause = false;
    public tier = '';
    public gameType: BattleGameType = 'singles';
    public compatMode = true;
    public rated: string | boolean = false;
    public isBlitz = false;
    public endLastTurnPending = false;
    public totalTimeLeft = 0;
    public graceTimeLeft = 0;
    /**
     * * `true` = timer on, state unknown.
     * * `false` = timer off.
     * * `number` = seconds left this turn.
     *
     * @default false
     */
    public kickingInactive: number | boolean = false;
    public id = '' as ID;
    /** Used to forward some information to the room in the old client. */
    public roomid = '' as RoomID;
    /**
     * @example
     * ```ts
     * // example from gen9nationaldexmonotype:
     * {
     *   'HP Percentage Mod': 1,
     *   'Endless Battle Clause': 1,
     *   'Same Type Clause': 1,
     *   'Terastal Clause': 1,
     *   'Species Clause': 1,
     *   'OHKO Clause': 1,
     *   'Evasion Clause': 1,
     *   'Evasion Abilities Clause': 1,
     *   'Evasion Items Clause': 1,
     *   'Evasion Moves Clause': 1,
     *   'Sleep Clause Mod': 1
     * }
     * ```
     */
    public rules: Record<string, 0 | 1> = {};
    public hardcoreMode = false;
    public ignoreNicks: boolean;
    public ignoreOpponent: boolean;
    public ignoreSpects: boolean;
    public forfeitPending: boolean;
    public debug: boolean;
    public joinButtons = false;
    /** Whether to auto-resize the `$frame` for viewport widths `< 640px` (e.g., mobile). */
    public autoresize: boolean;
    /**
     * Actual pause state.
     *
     * * Will only be `true` if playback is actually paused, not just waiting for the opponent to make a move.
     */
    public paused: boolean;

    // Showdex-injected custom properties
    public calcdexDisabled?: boolean;
    public calcdexAsOverlay?: boolean;
    public calcdexInit?: boolean;
    public calcdexStateInit?: boolean;
    public calcdexIdPatched?: boolean;
    public calcdexDestroyed?: boolean;
    /** note: for `'classic'` (i.e., Backbone.js) Showdown client `__SHOWDEX_HOST`'s only !! */
    public calcdexHtmlRoom?: ClientHtmlRoom;
    public calcdexRoomId?: RoomID;
    public calcdexReactRoot?: import('react-dom/client').Root;
    public calcdexSheetsAccepted?: boolean;
    public calcdexBattleRecorded?: boolean;
    public nonce?: string;

    public subscription?: (state: BattleSubscriptionState) => void;
    public onResize: () => void;

    public constructor(
      options?: {
        $frame?: JQuery<HTMLElement>;
        $logFrame?: JQuery<HTMLElement>;
        id?: ID;
        log?: string[];
        paused?: boolean;
        isReplay?: boolean;
        debug?: boolean;
        subscription?: Battle['subscription'];
        autoresize?: boolean;
      } = {},
    );

    public subscribe(listener: Battle['subscription']): void;

    public removePseudoWeather(weather: string): void;
    public addPseudoWeather(weather: string, minTimeLeft: number, timeLeft: number): void;
    public hasPseudoWeather(weather: string): boolean;
    public changeWeather(weatherName: string, poke?: Pokemon, isUpkeep?: boolean, ability?: Effect): void;

    /**
     * Whether the *Neutralizing Gas* ability is active.
     *
     * * Used in the `Pokemon`'s `effectiveAbility()` over `abilityActive()` to prevent infinite recursion.
     */
    public ngasActive(): boolean;

    public abilityActive(abilities: string[]): boolean;
    public activateAbility(pokemon?: Pokemon, effectOrName: Effect | string, isNotBase?: boolean): void;

    public reset(): void;
    public resetStep(): void;

    public destroy(): void;

    public log<
      TArgs extends TArgs,
      TKwArgs extends KwArgs,
    >(args: TArgs, kwArgs?: TKwArgs, preempt?: boolean): void;

    public resetToCurrentTurn(): void;
    public switchSides(): void;
    public setPerspective(sideid: string): void;

    public start(): void;
    public winner(winner?: string): void;
    public prematureEnd(): void;
    public endLastTurn(): void;
    public setHardcoreMode(mode: boolean): void;
    public setTurn(turnNum: number): void;
    public resetTurnsSinceMoved(): void;
    public swapSideConditions(): void;
    public updateTurnCounters(): void;

    public useMove<T extends KwArgs>(pokemon: Pokemon, move: Move, target?: Pokemon, kwArgs?: T): void;
    public animateMove<T extends KwArgs>(pokemon: Pokemon, move: Move, target?: Pokemon, kwArgs?: T): void;
    public cantUseMove<T extends KwArgs>(pokemon: Pokemon, effect: Effect, move: Move, kwArgs?: T): void;

    /**
     * @param name Leave blank for Team Preview.
     * @param pokemonid Leave blank for Team Preview
     */
    public parseDetails(name: string, pokemonid: string, details: string, output: PokemonDetails = {}): PokemonDetails;
    public parseHealth(hpstring: string, output?: PokemonHealth): PokemonHealth;
    public parsePokemonId(pokemonid: string): {
      name: string;
      siden: number;
      slot: number;
      pokemonid: string;
    };

    public getSwitchedPokemon(pokemonid: string, details: string): Pokemon;
    public rememberTeamPreviewPokemon(sideid: string, details: string): ReturnType<Side['addPokemon']>;
    public findCorrespondingPokemon(serverPokemon: { ident: string; details: string; }): Pokemon;
    public getPokemon(pokemonid?: string): Pokemon;
    public getSide(sidename: string): Side;
    public checkActive(poke: Pokemon): false;

    public add(command?: string): void;

    /**
     * Showdown's preempt system is intended to show chat messages immediately,
     * instead of waiting for the battle to arrive at the moment when the message was said.
     *
     * * In addition to being a nice QoL feature,
     *   it's also important to make sure timer updates happen in real-time.
     */
    public instantAdd(command: string): void;
    public runMinor(args: Args, kwArgs: KwArgs, nextArgs?: Args, nextKwargs?: KwArgs): void;
    public runMajor(args: Args, kwArgs: KwArgs, preempt?: boolean): void;
    public run(str: string, preempt?: boolean): void;

    /**
     * Properties relevant to battle playback, for replay UI implementers:
     *
     * * `ended` = has the game ended in a win/loss?
     * * `atQueueEnd` = has the animation caught up to the end of the battle queue, waiting for more input?
     * * `seeking` = are we trying to skip to a specific turn?
     * * `turn` = what turn are we currently on?
     *   - `-1` = we haven't started yet
     *   - `0` = Team Preview
     * * `paused` = are we playing at all?
     */
    public play(): void;
    public pause(): void;
    public skipTurn(): void;
    public seekTurn(turn: number, forceReset?: boolean): void;
    public stopSeeking(): void;
    public shouldStep(): boolean;
    public nextStep(): void;
    public setQueue(queue: string[]): void;
    public setMute(mute: boolean): void;
  }
}

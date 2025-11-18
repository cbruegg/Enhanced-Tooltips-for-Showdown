/**
 * @file `battle-choice.d.ts` - Adapted from `pokemon-showdown-client/play.pokemonshowdown.com/src/battle-choices.ts`.
 * @author Keith Choison <keith@tize.io>
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license MIT
 * @since 0.1.0
 */

declare namespace Showdown {
  interface BattleMoveChoice {
    choiceType: 'move';
    /** * 1-based move. */
    move: number;
    targetLoc: number;
    mega: boolean;
    ultra: boolean;
    max: boolean;
    z: boolean;
  }

  interface BattleShiftChoice {
    choiceType: 'shift';
  }

  interface BattleSwitchChoice {
    choiceType: 'switch' | 'team';
    /** * 1-based Pokemon. */
    targetPokemon: number;
  }

  type BattleChoice =
    | BattleMoveChoice
    | BattleShiftChoice
    | BattleSwitchChoice;

  /**
   * Builds a `BattleChoice` one step at a time.
   *
   * * Doesn't support going backwards; just use `new BattleChoiceBuilder`.
   * * Serving suggestion: Construct a UI to build it.
   */
  class BattleChoiceBuilder {
    public request: BattleRequest;
    public noCancel: boolean;
    /** Completed choices in string form. */
    public choices: string[] = [];
    /**
     * Currently active partial move choice.
     *
     * * Not used for other choices, which don't have partial states.
     */
    public current: BattleMoveChoice = {
      choiceType: 'move',
      /** if nonzero, show target screen; if zero, show move screen */
      move: 0,
      targetLoc: 0, // should always be 0: is not partial if `targetLoc` is known
      mega: false,
      megax: false,
      megay: false,
      ultra: false,
      z: false,
      max: false,
      tera: false,
    };
    public alreadySwitchingIn: number[] = [];
    public alreadyMega = false;
    public alreadyMax = false;
    public alreadyZ = false;
    public alreadyTera = false;

    public static fixRequest(request: unknown, battle: Battle): BattleRequest;

    public constructor(request: BattleRequest);
    public toString(): string;
    public isDone(): boolean;
    public isEmpty(): boolean;
    /** Index of the current Pokemon we're making choices for. */
    public index(): number;
    /** Number of choices the server'll expect to receive. */
    public requestLength(): number;
    public currentMoveRequest(index = this.index()): UnwrapArray<BattleMoveRequest['active']>;
    public noMoreSwitchChoices(): boolean;
    public addChoice(choiceString: string): string;
    /**
     * Move & switch requests will often skip over some active Pokemon (mainly fainted Pokemon).
     * This will fill them in automatically, so we don't need to ask a user for them.
     */
    public fillPasses(): void;
    public currentMove(choice = this.current, index = this.index()): UnwrapArray<ReturnType<this['currentMoveList']>>;
    public currentMoveList(
      index = this.index(),
      current: { max?: boolean; z?: boolean; } = this.current,
    ): {
      name: string;
      id: ID;
      target: MoveTarget;
      disabled?: boolean;
    }[];
    /** Parses a `choice` from a `string` form to a `BattleChoice` form. */
    public parseChoice(choice: string, index = this.choices.length): BattleChoice;
    /** Converts a `choice` from a `BattleChoice` into a `string` form. */
    public stringChoice(choice?: BattleChoice): string;
    public moveSpecial(choice: BattleMoveChoice): string;
  }
}

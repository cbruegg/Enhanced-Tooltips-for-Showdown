/**
 * @file `battle-request.d.ts` - dapted from `pokemon-showdown-client/play.pokemonshowdown.com/src/battle-choices.ts`.
 * @author Keith Choison <keith@tize.io>
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license MIT
 * @since 0.1.0
 */

declare namespace Showdown {
  interface BattleRequestSideInfo {
    name: string;
    id: SideID;
    pokemon: ServerPokemon[];
  }

  interface BattleRequestActivePokemon {
    moves: {
      name: string;
      id: string;
      pp: number;
      maxpp: number;
      target: MoveTarget;
      disabled?: boolean;
    }[];

    maxMoves?: {
      maxMoves?: {
        name: string;
        id: string;
        target: MoveTarget;
        disabled?: boolean;
      }[];
      gigantamax: string;
    };

    zMoves?: {
      name: string;
      id: string;
      target: MoveTarget;
    }[];

    /**
     * Also `true` if the Pokemon can Gigantamax.
     */
    canDynamax?: boolean;
    canGigantamax?: boolean;
    canMegaEvo?: boolean;
    canUltraBurst?: boolean;
    canTerastallize?: TypeName;
    trapped?: boolean;
    maybeTrapped?: boolean;
    maybeDisabled?: boolean;
    maybeLocked?: boolean;
  }

  interface BattleBaseRequest {
    requestType?: string;
    rqid: string;
    side: BattleRequestSideInfo;
    noCancel?: boolean;
  }

  interface BattleMoveRequest extends BattleBaseRequest {
    requestType: 'move';
    active: (BattleRequestActivePokemon | null)[];
    targetable?: boolean;
  }

  interface BattleSwitchRequest extends BattleBaseRequest {
    requestType: 'switch';
    forceSwitch: boolean[];
  }

  interface BattleTeamRequest extends BattleBaseRequest {
    requestType: 'team';
    maxTeamSize?: number;
    maxChosenTeamSize?: number;
    chosenTeamSize?: number;
  }

  interface BattleWaitRequest extends BattleBaseRequest {
    requestType: 'wait';
  }

  type BattleRequest =
    | BattleMoveRequest
    | BattleSwitchRequest
    | BattleTeamRequest
    | BattleWaitRequest;
}

/**
 * @file `useSmogonMatchup.ts`
 * @author Keith Choison <keith@tize.io>
 * @since 0.1.2
 */

import * as React from 'react';
import { type MoveName } from '@smogon/calc';
import { type CalcdexBattleState } from '@showdex/interfaces/calc';
import { useShowdexSettings } from '@showdex/redux/store';
import { type CalcdexMatchupResult, calcSmogonMatchup } from './calcSmogonMatchup';

export type SmogonMatchupHookCalculator = (
  playerMove: MoveName,
) => CalcdexMatchupResult;

/**
 * A memoized version of `calcSmogonMatchup()`.
 *
 * * Note that a memoized callback is returned that requires one argument, `playerMove`.
 *
 * @since 0.1.2
 */
export const useSmogonMatchup = (
  state: CalcdexBattleState,
  config?: Omit<Parameters<typeof calcSmogonMatchup>[2], 'settings'>,
): SmogonMatchupHookCalculator => {
  const settings = useShowdexSettings();

  return React.useCallback<SmogonMatchupHookCalculator>((
    playerMove,
  ) => calcSmogonMatchup(state, playerMove, {
    ...config,
    settings,
  }), [
    config,
    settings,
    state,
  ]);
};

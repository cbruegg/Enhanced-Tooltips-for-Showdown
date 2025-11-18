/**
 * @file `calcSmogonMatchup.ts`
 * @author Keith Choison <keith@tize.io>
 * @since 0.1.2
 */

import {
  type Move as SmogonMove,
  type MoveName,
  type Pokemon as SmogonPokemon,
  type ShowdexCalcMods,
  calculate,
} from '@smogon/calc';
import { type ShowdexSettings } from '@showdex/interfaces/app';
import { type CalcdexBattleState, type CalcdexPlayerKey, CalcdexPlayerKeys as AllPlayerKeys } from '@showdex/interfaces/calc';
import { logger } from '@showdex/utils/debug';
import { getGenDexForFormat } from '@showdex/utils/dex';
import { createSmogonField } from './createSmogonField';
import { createSmogonMove } from './createSmogonMove';
import { createSmogonPokemon } from './createSmogonPokemon';
import { determineMoveStrikes } from './determineMoveStrikes';
import { formatMatchupNhko } from './formatMatchupNhko';
import { getMatchupNhkoColor } from './getMatchupNhkoColor';
import { getMatchupRange } from './getMatchupRange';
import { type CalcdexMatchupParsedDescription, parseMatchupDescription } from './parseMatchupDescription';

export interface CalcdexMatchupResult {
  /**
   * Attacking Pokemon that the calculator used to calculate the calculatable calculation.
   *
   * @since 1.0.3
   */
  attacker?: SmogonPokemon;

  /**
   * Defending Pokemon that the calculator used to calculate the calculatable calculation.
   *
   * @since 1.0.3
   */
  defender?: SmogonPokemon;

  /**
   * Move that the calculator used to calculate the calculatable calculation.
   *
   * @since 0.1.3
   */
  move?: SmogonMove;

  /**
   * Parsed description of the result.
   *
   * * Useful for displaying additional matchup information in a tooltip, for instance.
   *
   * @example
   * ```ts
   * {
   *   raw: '252 Atk Weavile Knock Off (97.5 BP) vs. 252 HP / 0 Def Heatran: 144-169 (37.3 - 43.7%) -- guaranteed 2HKO after Stealth Rock and 2 layers of Spikes',
   *   attacker: '252 ATK Weavile Knock Off (97.5 BP)',
   *   defender: '252 HP / 0 DEF Heatran',
   *   damageRange: '144-169 (37.3 - 43.7%)',
   *   recoil: null,
   *   recovery: null,
   *   koChance: 'guaranteed 2HKO after Stealth Rock & 2 layers of Spikes',
   * } as CalcdexMatchupParsedDescription
   * ```
   * @since 1.0.1
   */
  description?: CalcdexMatchupParsedDescription;

  /**
   * In the format `XXX.X% - XXX.X%`, where `X` are numbers.
   *
   * * If the reported damage range was `'0 - 0%'`, this value will be `'N/A'` instead.
   *
   * @example '38.5% - 52.0%'
   * @since 0.1.2
   */
  damageRange?: string;

  /**
   * In the format `XXX[.X]% nHKO`, where `X` and `n` are numbers.
   *
   * @example '47.2% 2HKO'
   * @since 0.1.2
   */
  koChance?: string;

  /**
   * Color that should be applied to the DOM element rendering `koChance`.
   *
   * * If the value is `null`, then no color (other than the default) should be applied.
   *
   * @since 0.1.2
   */
  koColor?: string;
}

const l = logger('@showdex/utils/calc/calcSmogonMatchup()');

/**
 * Verifies that the arguments look *decently* good, then yeets them to `calculate()` from `@smogon/calc`.
 *
 * * If using this within a React component, opt to use the `useSmogonMatchup()` hook instead.
 * * As of v1.3.0, many of the arguments have been consolidated into a single `state` argument of type `CalcdexBattleState`.
 *   - Overrides are possible through the added `config` arg, which if unspecified, will derive them from the `state` instead.
 *
 * @since 0.1.2
 */
export const calcSmogonMatchup = (
  state: CalcdexBattleState,
  playerMove: MoveName,
  config?: {
    playerKey?: CalcdexPlayerKey;
    playerSelectionIndex?: number;
    opponentKey?: CalcdexPlayerKey;
    opponentSelectionIndex?: number;
    allPlayerKeys?: CalcdexPlayerKey[]; // other active players used for Beat Up
    settings?: ShowdexSettings;
  },
): CalcdexMatchupResult => {
  const {
    playerKey: playerKeyFromConfig,
    playerSelectionIndex,
    opponentKey: opponentKeyFromConfig,
    opponentSelectionIndex,
    allPlayerKeys: allPlayerKeysFromConfig,
    settings,
  } = config || {};

  const {
    operatingMode,
    format,
    gameType,
    playerKey: topPlayerKey,
    opponentKey: bottomPlayerKey,
    field,
  } = state || {};

  const playerKey = playerKeyFromConfig || topPlayerKey;
  const player = state?.[playerKey];
  const playerPokemonIndex = playerSelectionIndex ?? player?.selectionIndex;
  const playerPokemon = player?.pokemon?.[playerPokemonIndex];

  const opponentKey = opponentKeyFromConfig || (playerKey === topPlayerKey ? bottomPlayerKey : topPlayerKey);
  const opponent = state?.[opponentKey];
  const opponentPokemonIndex = opponentSelectionIndex ?? opponent?.selectionIndex;
  const opponentPokemon = opponent?.pokemon?.[opponentPokemonIndex];

  const allPlayers = ((Array.isArray(allPlayerKeysFromConfig) && allPlayerKeysFromConfig) || AllPlayerKeys)
    .filter((k) => state?.[k]?.active)
    .map((k) => state[k]);

  // this is the object that will be returned
  const matchup: CalcdexMatchupResult = {
    move: null,
    description: null,
    damageRange: null,
    koChance: null,
    koColor: null,
  };

  const dex = getGenDexForFormat(format);

  if (!dex || !format || !gameType || !playerPokemon?.speciesForme || !opponentPokemon?.speciesForme || !playerMove) {
    /* if (__DEV__ && playerMove) {
      l.debug(
        'Calculation ignored due to invalid arguments.',
        '\n', 'format', format, 'gameType', gameType, 'gen', dex?.num,
        '\n', 'playerPokemon', playerPokemon?.name || playerPokemon?.speciesForme || '???', playerPokemon,
        '\n', 'opponentPokemon', opponentPokemon?.name || opponentPokemon?.speciesForme || '???', opponentPokemon,
        '\n', 'playerMove', playerMove,
        '\n', 'player', player,
        '\n', 'opponent', opponent,
        '\n', 'field', field,
      );
    } */

    return matchup;
  }

  const showdexMods: ShowdexCalcMods = {
    excludeHazardsDamage: (operatingMode === 'battle' && !settings?.calcdex?.includeHazardsDamage)
      || (operatingMode === 'standalone' && !settings?.honkdex?.includeHazardsDamage),
    excludeEotDamage: (operatingMode === 'battle' && !settings?.calcdex?.includeEotDamage)
      || (operatingMode === 'standalone' && !settings?.honkdex?.includeEotDamage),
  };

  const smogonField = createSmogonField(format, gameType, field, player, opponent, allPlayers);

  matchup.attacker = createSmogonPokemon(format, gameType, playerPokemon, playerMove, opponentPokemon);
  matchup.defender = createSmogonPokemon(format, gameType, opponentPokemon, null, playerPokemon);

  [matchup.move, {
    hitBasePowers: showdexMods.hitBasePowers,
  }] = createSmogonMove(format, playerPokemon, playerMove, opponentPokemon, field);

  // pretty much only used for Beat Up lmao
  showdexMods.strikes = determineMoveStrikes(
    format,
    playerMove,
    playerPokemon,
    opponentPokemon,
    player,
    opponent,
    allPlayers,
    field,
  );

  try {
    const result = calculate(
      dex,
      matchup.attacker,
      matchup.defender,
      matchup.move,
      smogonField,
      showdexMods,
    );

    matchup.description = parseMatchupDescription(result);
    matchup.damageRange = getMatchupRange(result);
    matchup.koChance = formatMatchupNhko(result, settings?.calcdex?.nhkoLabels);
    matchup.koColor = getMatchupNhkoColor(result, settings?.calcdex?.nhkoColors);

    /* l.debug(
      'Calculated damage for', playerMove, 'from', playerPokemon.speciesForme, 'against', opponentPokemon.speciesForme,
      '\n', 'gameType', gameType, 'gen', dex.num,
      '\n', 'playerPokemon', playerPokemon.speciesForme || '???', playerPokemon,
      '\n', 'opponentPokemon', opponentPokemon.speciesForme || '???', opponentPokemon,
      '\n', 'field', field,
      '\n', 'matchup', matchup,
      '\n', 'result', result,
      '\n', 'showdexMods', showdexMods,
    ); */
  } catch (error) {
    // ignore 'damage[damage.length - 1] === 0' (i.e., no damage) errors,
    // which is separate from 'N/A' damage (e.g., status moves).
    // typically occurs when the opposing Pokemon is immune to the damaging move,
    // like using Earthquake against a Lando-T, which is immune due to its Flying type.
    if (__DEV__ && !(error as Error)?.message?.includes('=== 0')) {
      l.error(
        'Exception while calculating the damage for', playerMove,
        'from', playerPokemon.speciesForme, 'against', opponentPokemon.speciesForme,
        '\n', 'gameType', gameType, 'gen', dex.num,
        '\n', 'playerPokemon', playerPokemon.speciesForme || '???', playerPokemon,
        '\n', 'opponentPokemon', opponentPokemon.speciesForme || '???', opponentPokemon,
        '\n', 'playerMove', playerMove,
        '\n', 'player', player,
        '\n', 'opponent', opponent,
        '\n', 'field', field,
        '\n', 'settings', settings,
        '\n', '(you\'ll only see this error in __DEV__)',
        '\n', error,
      );
    }
  }

  return matchup;
};

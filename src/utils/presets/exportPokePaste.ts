/**
 * @file `exportPokePaste.ts`
 * @author Keith Choison <keith@tize.io>
 * @since 1.0.3
 */

import { type GenerationNum } from '@smogon/calc';
import { PokemonNatureBoosts, PokemonPokePasteStatMap } from '@showdex/consts/dex';
import { type CalcdexPokemon } from '@showdex/interfaces/calc';
import { formatId, nonEmptyObject } from '@showdex/utils/core';
import {
  detectGenFromFormat,
  getDefaultSpreadValue,
  getDexForFormat,
  hasNickname,
} from '@showdex/utils/dex';

/**
 * Internally-used helper function to export a `Showdown.StatsTable` to the PokePaste syntax.
 *
 * @example
 * ```ts
 * exportStatsTable({
 *   hp: 0,
 *   atk: 252,
 *   def: 4,
 *   spa: 0,
 *   spd: 0,
 *   spe: 252,
 * }, {
 *   ignoreValue: 0,
 * });
 *
 * '252 Atk / 4 Def / 252 Spe'
 * ```
 * @example
 * ```ts
 * // used for the 'preact' syntax
 * exportStatsTable({
 *   hp: 0,
 *   atk: 252,
 *   def: 4,
 *   spa: 0,
 *   spd: 0,
 *   spe: 252,
 * }, {
 *   ignoreValue: 0,
 *   nature: 'Adamant',
 * });
 *
 * '252+ Atk / 4 Def / - SpA / 252 Spe (Adamant)'
 * ```
 * @since 1.0.3
 */
const exportStatsTable = (
  table: Showdown.StatsTable,
  config?: {
    ignoreValue?: number;
    ignoreStats?: Showdown.StatName | Showdown.StatName[];
    nature?: Showdown.NatureName;
  },
): string => {
  const {
    ignoreValue,
    ignoreStats,
    nature,
  } = config || {};

  const ignored = [...(Array.isArray(ignoreStats) ? ignoreStats : [ignoreStats])].filter(Boolean);
  const boosts = PokemonNatureBoosts[nature] || [];

  const line = (Object.entries(table || {}) as Entries<typeof table>).reduce<string[]>((
    prev,
    [stat, value],
  ) => {
    const statMapping = PokemonPokePasteStatMap[stat];

    if (!statMapping) {
      return prev;
    }

    const shouldIgnore = ignored.includes(stat)
      || typeof value !== 'number'
      || (typeof ignoreValue === 'number' && value === ignoreValue);

    const statBoost = (
      stat !== 'hp'
        && boosts.includes(stat)
        && (stat === boosts[0] ? '+' : '-')
    ) || '';

    if (shouldIgnore) {
      if (statBoost) {
        prev.push(`${statBoost} ${statMapping}`);
      }

      return prev;
    }

    prev.push(`${value}${statBoost} ${statMapping}`);

    return prev;
  }, []).join(' / ');

  return boosts.length ? `${line} (${nature})` : line;
};

/**
 * Exports the passed-in `CalcdexPokemon` to a `string` in the Teambuilder/PokePaste syntax.
 *
 * * Essentially a re-implementation of the global `Showdown.exportTeam()`, but for an individual
 *   `CalcdexPokemon`, making use of `CalcdexPokemon`-specific properties wherever available.
 *   - For instance, we set the ability as the `dirtyAbility`, if set, over the `ability`.
 *
 * @example
 * ```ts
 * // note: this object is not a complete CalcdexPokemon, obviously
 * exportPokePaste({
 *   name: 'Smogonbirb', // Pokemon's optional nickname
 *   speciesForme: 'Kingambit', // required
 *   gender: 'F',
 *   shiny: false,
 *   level: 99,
 *   nature: 'Adamant',
 *   teraType: null,
 *   dirtyTeraType: 'Flying',
 *   ability: 'Supreme Overlord' as AbilityName,
 *   dirtyAbility: null,
 *   item: null, // battle-reported
 *   prevItem: 'Black Glasses' as ItemName, // battle-reported
 *   dirtyItem: 'Air Balloon' as ItemName, // user-modified
 *   ivs: { hp: 31, atk: 31, def: 31, spa: 0, spd: 31, spe: 31 },
 *   evs: { hp: 0, atk: 252, def: 4, spa: 0, spd: 0, spe: 252 },
 *   moves: ['Swords Dance', 'Sucker Punch', 'Kowtow Cleave', 'Iron Head'] as MoveName[],
 *   // ... //
 * } as CalcdexPokemon, {
 *   format: 'gen9ou', // optional
 *   syntax: 'preact', // optional (defaults to 'classic')
 * });
 *
 * // 'classic' syntax (default)
 * `Smogonbirb (Kingambit) (F) @ Air Balloon
 * Ability: Supreme Overlord
 * EVs: 252 Atk / 4 Def / 252 Spe
 * IVs: 0 SpA
 * Level: 99
 * Tera Type: Flying
 * Adamant Nature
 * - Swords Dance
 * - Sucker Punch
 * - Kowtow Cleave
 * - Iron Head`
 *
 * // 'preact' syntax
 * `Smogonbirb (Kingambit) (F)
 * [Supreme Overlord] @ Air Balloon
 * - Swords Dance
 * - Sucker Punch
 * - Kowtow Cleave
 * - Iron Head
 * EVs: 252+ Atk / 4 Def / - SpA / 252 Spe (Adamant)
 * IVs: 0 SpA
 * Level: 99
 * Tera Type: Flying`
 * ```
 * @see https://pokepast.es/syntax.html
 * @since 1.0.3
 */
export const exportPokePaste = (
  pokemon: Omit<Partial<CalcdexPokemon>, 'source'>,
  config?: {
    format?: string | GenerationNum;
    syntax?: 'classic' | 'preact'; // default: 'classic'
  },
): string => {
  const {
    format,
    syntax = 'classic',
  } = config || {};

  if (!pokemon?.speciesForme) {
    return null;
  }

  const dex = getDexForFormat(format);
  const gen = detectGenFromFormat(format);

  const {
    name,
    speciesForme,
    gender,
    item,
    prevItem,
    dirtyItem,
    shiny,
    ability,
    dirtyAbility,
    level,
    // happiness, // doesn't exist in CalcdexPokemon atm
    types,
    teraType: revealedTeraType,
    dirtyTeraType,
    nature,
    ivs,
    evs,
    moves,
  } = pokemon;

  // contains each line of the syntax, which will be joined with newlines (\n) at the ned
  const output: string[] = [
    speciesForme,
  ];

  // <name | speciesForme> [(<speciesForme>)] [(<gender>)] [@ <item>]
  const dexCurrentForme = dex?.species.get(speciesForme);

  const battleOnlyFormes = Array.isArray(dexCurrentForme?.battleOnly)
    ? [...dexCurrentForme.battleOnly]
    : [dexCurrentForme.battleOnly].filter(Boolean);

  const actualForme = battleOnlyFormes[0] || dexCurrentForme.name;

  if (actualForme && actualForme !== output[0]) {
    output[0] = actualForme;
  }

  const hasGmaxForme = output[0].endsWith('-Gmax');

  if (hasGmaxForme) {
    output[0] = output[0].replace('-Gmax', '');
  }

  if (hasNickname(pokemon)) {
    output[0] = `${name} (${output[0]})`;
  }

  if (['M', 'F'].includes(gender)) {
    output[0] += ` (${gender})`;
  }

  const currentItem = dirtyItem ?? (prevItem || item);

  if (syntax === 'classic' && currentItem) {
    output[0] += ` @ ${currentItem}`;
  }

  // Ability: <ability>
  // (don't export "No Ability" though, even though Showdown does it)
  const currentAbility = dirtyAbility ?? ability;

  if (currentAbility && formatId(currentAbility) !== 'noability') {
    output.push(syntax === 'preact' ? [
      `[${currentAbility}]`,
      '@',
      currentItem || '(no item)',
    ].join('\x20') : `Ability: ${currentAbility}`);
  }

  // - <moveName> (at this point if using the 'preact' syntax)
  const moveLines = (moves || []).filter(Boolean).map((moveName) => '- ' + (
    // e.g., 'Hidden Power Fire' -> 'Hidden Power [Fire]'
    // (though, the Teambuilder will accept the former, i.e., 'Hidden Power Fire')
    moveName?.includes('Hidden Power')
      ? moveName.replace(/(?<=Hidden\sPower\s)(\w+)$/, '[$1]')
      : moveName
  ));

  if (syntax === 'preact' && moveLines.length) {
    output.push(...moveLines);
  }

  // EVs: <value> <stat> ...[/ <value> <stat>] (where <value> is not 0) -- only in non-legacy
  // IVs: <value> <stat> ...[/ <value> <stat>] (where <value> is not 31 [or 30, if legacy])
  // (where <stat> is HP, Atk, Def, SpA, SpD, or Spe)
  const defaultEv = getDefaultSpreadValue('ev', format);
  const defaultIv = getDefaultSpreadValue('iv', format);

  if (nonEmptyObject(evs)) {
    const exportedEvs = exportStatsTable(evs, {
      ignoreValue: defaultEv,
      ...(syntax === 'preact' && { nature }),
    });

    if (exportedEvs) {
      output.push(`EVs: ${exportedEvs}`);
    }
  }

  if (nonEmptyObject(ivs)) {
    // in legacy gens, max DV is 15, which equates to 30 IVs (NOT 31!)
    // additionally in gen 1 only, Showdown exports SPC as SPA, so SPD is unused
    const exportedIvs = exportStatsTable(ivs, {
      ignoreValue: defaultIv,
      ...(gen === 1 && { ignoreStats: 'spd' }),
    });

    if (exportedIvs) {
      output.push(`IVs: ${exportedIvs}`);
    }
  }

  // Level: <value> (where <value> is not 100)
  if (typeof level === 'number' && level !== 100) {
    output.push(`Level: ${level}`);
  }

  // Tera Type: <teraType>
  // (<teraType> shouldn't print when '???' or matches the default Tera type, i.e., the first type of the Pokemon)
  const teraType = dirtyTeraType || revealedTeraType;

  if (teraType && teraType !== '???' && teraType !== (types?.[0] || dexCurrentForme.types?.[0])) {
    output.push(`Tera Type: ${teraType}`);
  }

  // Gigantamax: <Yes/No>
  if (hasGmaxForme) {
    output.push(syntax === 'preact' ? 'Gigantamax' : 'Gigantamax: Yes'); // untested; not 100% about this one
  }

  // Shiny: <Yes/No>
  if (shiny) {
    output.push(syntax === 'preact' ? 'Shiny' : 'Shiny: Yes'); // lol
  }

  // Happiness: <value> (where <value> is not 255)

  if (syntax === 'classic') {
    // <nature> Nature
    if (nature) {
      output.push(`${nature} Nature`);
    }

    // - <moveName>
    if (moveLines.length) {
      output.push(...moveLines);
    }
  }

  return output.join('\n') || null;
};

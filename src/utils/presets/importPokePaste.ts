/**
 * @file `importPokePaste.ts`
 * @author Keith Choison <keith@tize.io>
 * @since 1.0.7
 */

import {
  type AbilityName,
  type GenerationNum,
  type ItemName,
  type MoveName,
} from '@smogon/calc';
import {
  PokemonNatureBoosts,
  PokemonNatures,
  PokemonNeutralNatures,
  PokemonTypes,
} from '@showdex/consts/dex';
import { type CalcdexPokemonPreset, type CalcdexPokemonPresetSource } from '@showdex/interfaces/calc';
import { calcPresetCalcdexId, populateStatsTable } from '@showdex/utils/calc';
import { clamp, env, formatId } from '@showdex/utils/core';
import {
  detectGenFromFormat,
  detectLegacyGen,
  determineDefaultLevel,
  getDexForFormat,
  parseBattleFormat,
} from '@showdex/utils/dex';
import { capitalize } from '@showdex/utils/humanize';

// note: speciesForme should be handled last since it will test() true against any line technically
// update (2025/09/16): adding support for the new PokePaste format that's available in the Preact client
export const PokePasteLineParsers: Partial<Record<keyof CalcdexPokemonPreset, RegExp>> = {
  level: /^\s*Level:\s*(\d+)\s*$/i,
  ability: /^\s*(?:(?:Ability:\s*(.+))|\[([^\]]+)\]\s*@\s*\(?([A-Z0-9\-\x20]+[A-Z0-9]))\)?\s*$/i, // e.g., old: 'Ability: Pressure'; new (w/ item): '[Pressure] @ Leftovers'
  shiny: /^\s*Shiny(?::\s*([A-Z]+))?\s*$/i, // e.g., old: 'Shiny: Yes'; new: 'Shiny' (implying 'Yes')
  happiness: /^\s*Happiness:\s*(\d+)\s*$/i,
  // dynamaxLevel: /^\s*Dynamax Level:\s*(\d+)$/i, // unsupported
  gigantamax: /^\s*Gigantamax:\s*([A-Z]+)\s*$/i,
  teraTypes: /^\s*Tera\s*Type:\s*([A-Z]+)\s*$/i,
  ivs: /^\s*IVs:\s*(\d.+)\s*$/i,
  evs: /^\s*EVs:\s*(\d.+)\s*$/i,
  nature: /^\s*([A-Z]+)\s+Nature\s*$/i,
  moves: /^\s*-\s*([A-Z0-9\(\)\[\]\-\x20]+[A-Z0-9\(\)\[\]])(?:\s*[\/,]\s*([A-Z0-9\(\)\[\]\-\x20]+[A-Z0-9\(\)\[\]]))?(?:\s*[\/,]\s*([A-Z0-9\(\)\[\]\-\x20]+[A-Z0-9\(\)\[\]]))?\s*$/i,
  name: /^=+\s*(?:\[([A-Z0-9]+)\]\s*)(.+[^\s])\s*={3}$/i, // note: this is the set's name, not the Pokemon's nickname (which is handled by the speciesForme parser)
  speciesForme: /(?:\s*\(([A-Z\xC0-\xFF0-9.':\-\x20]+[A-Z\xC0-\xFF0-9.%])\))?(?:\s*\(([MF])\))?(?:\s*@\s*([A-Z0-9\-\x20]+[A-Z0-9]))?\s*$/i,
};

// e.g., old: 'EVs: 252 Atk / 4 SpD / 252 Spe';
// e.g., new (w/ nature): 'EVs: 252 Atk / - SpA / 4 SpD / 252+ Spe (Jolly)'
// (note: nature in parentheses [e.g., '(Jolly)'] seems to be unused by the Preact client at the time of writing)
export const PokePasteSpreadParsers: Partial<Record<Showdown.StatName, RegExp>> = {
  hp: /(\d+)[+-]?\s*HP/i, // note: +/-'s in HP are invalid, so we're ignoring them by consuming (instead of capturing)
  atk: /(?:(?:(\d+)([+-])?)|([+-]))\s*Atk/i,
  def: /(?:(?:(\d+)([+-])?)|([+-]))\s*Def/i,
  spa: /(?:(?:(\d+)([+-])?)|([+-]))\s*SpA/i,
  spd: /(?:(?:(\d+)([+-])?)|([+-]))\s*SpD/i,
  spe: /(?:(?:(\d+)([+-])?)|([+-]))\s*Spe/i,
};

/**
 * Imports the passed-in `pokePaste` into a `CalcdexPokemonPreset`.
 *
 * * Does not validate the actual values besides performing a `dex` lookup for the properly formatted `name`'s.
 *   - i.e., It's entirely possible that imported sets may have illegal abilities, IVs/EVs, etc.
 * * Supports up to 3 moves per move line.
 *   - e.g., `'- Volt Switch / Surf / Volt Tackle'` is an acceptable move line.
 *   - Extraneous moves will be added to `altMoves` once `moves` fills up to its maximum length (e.g., `4`).
 * * `null` will be returned on the following conditions:
 *   - No `pokePaste` was provided, or
 *   - `speciesForme` couldn't be determined.
 * * As of v1.3.0, this supports reading the new PokePaste format being used in the Showdown Preact client rewrite.
 *   - (Technically this can read a frankensteined amalgamation of both old & new formats LOL)
 *
 * @example
 * ```ts
 * importPokePaste(`
 *   The King (Slowking-Galar) @ Assault Vest
 *   Ability: Regenerator
 *   Shiny: Yes
 *   IVs: 0 Atk
 *   EVs: 248 HP / 84 SpA / 176 SpD
 *   Calm Nature
 *   - Future Sight
 *   - Scald
 *   - Sludge Bomb
 *   - Flamethrower
 * `, 'gen8ou');
 *
 * {
 *   // note: this is some random uuid for the example's sake
 *   calcdexId: 'fb1961f0-75f7-11ed-b30e-2d3f6d915c0a',
 *   id: 'fb1961f0-75f7-11ed-b30e-2d3f6d915c0a', // same as calcdexId
 *   source: 'import',
 *   name: 'Import', // default name if 3rd `name` arg isn't provided
 *   gen: 8,
 *   format: 'ou',
 *   nickname: 'The King',
 *   speciesForme: 'Slowking-Galar',
 *   level: 100,
 *   shiny: true,
 *   ability: 'Regenerator',
 *   item: 'Assault Vest',
 *   nature: 'Calm',
 *   ivs: {
 *     hp: 31,
 *     atk: 0,
 *     def: 31,
 *     spa: 31,
 *     spd: 31,
 *     spe: 31,
 *   },
 *   evs: {
 *     hp: 248,
 *     atk: 0,
 *     def: 0,
 *     spa: 84,
 *     spd: 176,
 *     spe: 0,
 *   },
 *   moves: [
 *     'Future Sight',
 *     'Scald',
 *     'Sludge Bomb',
 *     'Flamethrower',
 *   ],
 *   altMoves: [],
 *   imported: 1721609804332,
 * } as CalcdexPokemonPreset
 * ```
 * @example
 * ```ts
 * // new PokePaste format used in the Showdown Preact client rewrite
 * importPokePaste(`
 *   yeaaaaaaa boiiiiiiiiiiii (Kingambit) (M)
 *   [Supreme Overlord] @ Leftovers
 *   - Swords Dance
 *   - Sucker Punch
 *   - Iron Head
 *   - Kowtow Cleave
 *   IVs: 0 SpA
 *   EVs: 252+ Atk / 4 Def / - SpA / 252 Spe (Adamant)
 *   Shiny
 *   Tera Type: Ghost
 * `, 'gen9ou');
 *
 * {
 *   // note: this is some random uuid for the example's sake
 *   calcdexId: 'fb1961f0-75f7-11ed-b30e-2d3f6d915c0a',
 *   id: 'fb1961f0-75f7-11ed-b30e-2d3f6d915c0a', // same as calcdexId
 *   source: 'import',
 *   name: 'Import', // default name if 3rd `name` arg isn't provided
 *   gen: 9,
 *   format: 'ou',
 *   nickname: 'yeaaaaaaa boiiiiiiiiiiii',
 *   speciesForme: 'Kingambit',
 *   level: 100,
 *   gender: 'M',
 *   teraTypes: ['Ghost'],
 *   shiny: true,
 *   ability: 'Supreme Overlord',
 *   item: 'Leftovers',
 *   nature: 'Adamant',
 *   ivs: {
 *     hp: 31,
 *     atk: 31,
 *     def: 31,
 *     spa: 0,
 *     spd: 31,
 *     spe: 31,
 *   },
 *   evs: {
 *     hp: 252,
 *     atk: 252,
 *     def: 4,
 *     spa: 0,
 *     spd: 0,
 *     spe: 252,
 *   },
 *   moves: [
 *     'Swords Dance',
 *     'Sucker Punch',
 *     'Iron Head',
 *     'Kowtow Cleave',
 *   ],
 *   altMoves: [],
 *   imported: 1758286195092,
 * } as CalcdexPokemonPreset
 * ```
 * @since 1.0.7
 */
export const importPokePaste = (
  pokePaste: string,
  format?: string,
  name = 'Import',
  source: CalcdexPokemonPresetSource = 'import',
): CalcdexPokemonPreset => {
  if (!pokePaste) {
    return null;
  }

  const dex = getDexForFormat(format);
  const gen = detectGenFromFormat(format, env.int<GenerationNum>('calcdex-default-gen'));
  const legacy = detectLegacyGen(format);
  const defaultLevel = determineDefaultLevel(format);

  // this will be our final return value
  const preset: CalcdexPokemonPreset = {
    calcdexId: null,
    id: null,
    source,
    name,
    gen,
    format,
    speciesForme: null,
    level: defaultLevel,
    shiny: false,
    nature: 'Hardy',
    ivs: populateStatsTable(null, { spread: 'iv', format }),
    evs: populateStatsTable(null, { spread: 'ev', format }),
    moves: [],
    altMoves: [],
    imported: null,
  };

  // first, split the pokePaste by newlines for easier line-by-line processing
  // (trim()ing here since Teambuilder adds a bunch of spaces at the end of each line)
  const lines = pokePaste.split(/\r?\n/).filter(Boolean).map((ln) => ln.trim());

  // process each line by matching regex (performance 100 ... /s)
  lines.forEach((line) => {
    if (!line || typeof line !== 'string') {
      return;
    }

    const [
      key,
      regex,
    ] = (Object.entries(PokePasteLineParsers) as [keyof CalcdexPokemonPreset, RegExp][])
      .find(([, r]) => r.test(line))
      || [];

    if (!key || typeof regex?.exec !== 'function') {
      return;
    }

    switch (key) {
      // also handles: nickname, gender, item
      case 'speciesForme': {
        const remainingLine = line.replace(regex, '').trim();

        // calling regex.exec() for each case here to keep TypeScript happy lol
        const [
          ,
          detectedForme,
          detectedGender,
          detectedItem,
        ] = regex.exec(line) || [];

        // make sure these entries exist in the dex before applying them to the preset!
        const guessedForme = detectedForme || remainingLine;

        if (!guessedForme) {
          break;
        }

        const dexSpecies = dex?.species.get(guessedForme);

        if (!dexSpecies?.exists) {
          break;
        }

        preset.speciesForme = dexSpecies.name;

        if (detectedForme && remainingLine && guessedForme === detectedForme) {
          preset.nickname = remainingLine;
        }

        if (detectedGender && dexSpecies.gender !== 'N') {
          preset.gender = detectedGender as Showdown.GenderName;
        }

        // note: won't exist in the new PokePaste format (moved to its own line prefixed w/ the ability)
        if (!detectedItem) {
          break;
        }

        const dexItem = dex?.items.get(detectedItem);

        if (!dexItem?.exists) {
          break;
        }

        preset.item = dexItem.name as ItemName;

        break;
      }

      case 'level': {
        const [
          ,
          value,
        ] = regex.exec(line) || [];

        if (!value) {
          break;
        }

        const parsedLevel = clamp(0, parseInt(value, 10) || 0, 100);

        // ignore level 0 (probably falsy anyways)
        if (!parsedLevel) {
          break;
        }

        preset.level = parsedLevel;

        break;
      }

      case 'ability': {
        if (legacy) {
          break;
        }

        const [
          ,
          detectedOldAbility, // e.g., 'Ability: Pressure'
          detectedNewAbility, // e.g., '[Pressure] @ Leftovers'
          detectedItem,
        ] = regex.exec(line) || [];

        const detectedAbility = detectedNewAbility || detectedOldAbility;

        if (!detectedAbility) {
          break;
        }

        const dexAbility = dex?.abilities.get(detectedAbility);

        if (!dexAbility?.exists) {
          break;
        }

        preset.ability = dexAbility.name as AbilityName;

        // e.g., in the new PokePaste format, '[Pressure] @ Leftovers' or '[Pressure] @ (no item)'
        if (!detectedItem || formatId(detectedItem) === 'noitem') {
          break;
        }

        const dexItem = dex.items.get(detectedItem);

        if (!dexItem?.exists) {
          break;
        }

        preset.item = dexItem.name as ItemName;

        break;
      }

      case 'shiny': {
        const [
          ,
          value,
        ] = regex.exec(line) || [];

        // just 'Shiny' (in the new format) or 'y' for "Yes" & 't' for "True"
        preset.shiny = !value || /^[yt]/i.test(String(value).trim());

        break;
      }

      case 'happiness': {
        const [
          ,
          value,
        ] = regex.exec(line) || [];

        if (!value) {
          break;
        }

        preset.happiness = clamp(0, parseInt(value, 10) || 0, 255);

        break;
      }

      case 'gigantamax': {
        const [
          ,
          value,
        ] = regex.exec(line) || [];

        if (!value) {
          break;
        }

        const gigantamax = formatId(value)?.startsWith('y');

        // don't bother populating this if false
        if (!gigantamax) {
          break;
        }

        // see if we should append '-Gmax' to the end of the speciesForme
        if (preset.speciesForme) {
          const dexGmaxSpecies = dex?.species.get(`${preset.speciesForme}-Gmax`);

          if (dexGmaxSpecies?.exists) {
            preset.speciesForme = dexGmaxSpecies.name;
          }
        }

        preset.gigantamax = gigantamax; // always true lol

        break;
      }

      case 'teraTypes': {
        const [
          ,
          value,
        ] = regex.exec(line) || [];

        if (!value) {
          break;
        }

        const detectedType = capitalize(value) as Showdown.TypeName;

        if (!PokemonTypes.includes(detectedType) || detectedType === '???') {
          break;
        }

        preset.teraTypes = [detectedType];

        break;
      }

      case 'ivs':
      case 'evs': {
        if (key === 'evs' && legacy) {
          break;
        }

        const [
          ,
          detectedSpread,
        ] = regex.exec(line) || [];

        if (!detectedSpread) {
          break;
        }

        // e.g., 'EVs: 252 Atk / - SpA / 4 SpD / 252+ Spe (Jolly)'
        const natureBoosts: [up: Showdown.StatNameNoHp, down: Showdown.StatNameNoHp] = [null, null];

        // run the detectedSpread through each stat parser
        // (note: we're purposefully not enforcing a max value, just a min to make sure it's non-negative at the very least)
        (Object.entries(PokePasteSpreadParsers) as Entries<typeof PokePasteSpreadParsers>).forEach(([
          stat,
          spreadRegex,
        ]) => {
          // e.g., detectedSpread = '- SpA' -> statValueStr = '-', boostStr = undefined;
          // e.g., detectedSpread = '252+ Spe' -> statValueStr = '252', boostStr = '+'
          const [
            ,
            statValueStr,
            boostStr, // note: may not exist
          ] = spreadRegex.exec(detectedSpread) || [];

          if (!statValueStr) {
            return;
          }

          if (key === 'evs' && stat !== 'hp' && (boostStr || /^[+-]$/.test(statValueStr))) {
            natureBoosts[(boostStr || statValueStr) === '+' ? 0 : 1] = stat;

            if (!boostStr) {
              return;
            }
          }

          preset[key][stat] = Math.max(0, parseInt(statValueStr, 10) || 0);
        });

        const boostedNature = (
          !!natureBoosts[0]
            && !!natureBoosts[1]
            && (Object.entries(PokemonNatureBoosts) as Entries<typeof PokemonNatureBoosts>).find(([
              ,
              [up, down],
            ]) => (up === natureBoosts[0] && down === natureBoosts[1]))?.[0]
        ) || null;

        if (boostedNature) {
          preset.nature = boostedNature;

          break;
        }

        const [, natureStr] = /(?:\(([A-Z]+)\))\s*$/i.exec(detectedSpread) || [];

        if (!natureStr || !PokemonNatures.includes(natureStr as Showdown.PokemonNature)) {
          break;
        }

        preset.nature = natureStr as Showdown.PokemonNature;

        break;
      }

      case 'nature': {
        if (legacy) {
          break;
        }

        const [
          ,
          detectedNature,
        ] = regex.exec(line) || [];

        if (!detectedNature) {
          break;
        }

        const parsedNature = capitalize(detectedNature) as Showdown.PokemonNature;

        if (!PokemonNatures.includes(parsedNature)) {
          break;
        }

        // set all netural natures to Hardy since that's the only option available in the Nature dropdown of PokeInfo
        preset.nature = PokemonNeutralNatures.includes(parsedNature)
          ? 'Hardy'
          : parsedNature;

        break;
      }

      case 'moves': {
        // supports the following move formats (up to 3 moves per line; example is from Pikachu's "Revenge Killer" set in Gen 8 PU):
        // '- Volt Switch' -> detectedMove1: 'Volt Switch'
        // '- Volt Switch / Surf' -> detectedMove1: 'Volt Switch'; detectedMove2: 'Surf'
        // '- Volt Switch, Surf' (note the comma [,] instead of the foward slash [/]) -> detectedMove1: 'Volt Switch'; detectedMove2: 'Surf'
        // '- Volt Switch / Surf / Volt Tackle' -> detectedMove1: 'Volt Switch'; detectedMove2: 'Surf'; detectedMove3: 'Volt Tackle'
        const [
          ,
          detectedMove1,
          detectedMove2,
          detectedMove3,
        ] = regex.exec(line) || [];

        // no point in checking falsiness of detectedMove2 & detectedMove3 since detectedMove1 should always be non-falsy
        // (otherwise, the regex would fail!)
        if (!detectedMove1) {
          break;
        }

        const dexMoves = [
          detectedMove1,
          detectedMove2,
          detectedMove3,
        ].filter(Boolean)
          .map((n) => dex?.moves.get(formatId(n)))
          .filter((m) => m?.exists && !!m.name);

        if (!dexMoves.length) {
          break;
        }

        const dexMoveNames = dexMoves.map((m) => m.name as MoveName);

        /**
         * @todo Update this once you add support for more than 4 moves.
         */
        const maxPresetMoves = 4;

        // only add the first move (detectedMove1) to the preset's moves,
        // then add any remaining moves (detectedMove2 & detectedMove3) to the preset's altMoves
        // (except if the move already is in the preset's moves, then ignore and try adding the remaining moves, if any)
        let addedToMoves = false;

        for (let i = 0; i < dexMoveNames.length; i++) {
          // no need to double-check if the dexMoveName exists here
          // since we processed and filtered the detected moves already
          const dexMoveName = dexMoveNames[i];

          // determine whether we're adding these move(s) to the preset's `moves` or `altMoves`
          const movesSource = addedToMoves || preset.moves.length + 1 > maxPresetMoves
            ? preset.altMoves
            : preset.moves;

          if (movesSource.includes(dexMoveName)) {
            continue;
          }

          movesSource.push(dexMoveName);

          if (!addedToMoves) {
            addedToMoves = true;
          }
        }

        break;
      }

      case 'name': {
        const [
          ,
          detectedFormat,
          detectedName,
        ] = regex.exec(line) || [];

        if (detectGenFromFormat(detectedFormat) > 0) {
          preset.format = detectedFormat.trim();
        }

        if (detectedName) {
          preset.name = detectedName?.trim() || name;
        }

        break;
      }

      default: {
        break;
      }
    }
  });

  if (!preset.speciesForme) {
    return null;
  }

  if (gen > 8 && !preset.teraTypes?.length) {
    const speciesTypes = dex.species.get(preset.speciesForme)?.types;

    if (speciesTypes?.length) {
      preset.teraTypes = [...speciesTypes];
    }
  }

  const { base: baseFormat } = parseBattleFormat(preset.format);

  if (baseFormat) {
    preset.format = baseFormat;
  }

  preset.calcdexId = calcPresetCalcdexId(preset);
  preset.id = preset.calcdexId;
  preset.imported = Date.now();

  return preset;
};

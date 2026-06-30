import { type AbilityName } from '@smogon/calc';
import { type CalcdexPokemon, type CalcdexPokemonPreset } from '@showdex/interfaces/calc';
import { replaceBehemothMoves } from '@showdex/utils/battle';
import { dedupeArray } from '@showdex/utils/core';
import { logger } from '@showdex/utils/debug';
import {
  detectGenFromFormat,
  detectLegacyGen,
  getGenfulFormat,
  isMegaStone,
} from '@showdex/utils/dex';
import { flattenAlts } from './flattenAlts';
import { findMatchingUsage } from './findMatchingUsage';

const l = logger('@showdex/utils/presets/guessMatchingPresets()');

// throttle: remember each mon's last guess OUTCOME (its matched preset ids) so the info summary only fires when
// the outcome actually CHANGES -- a live battle re-guesses constantly as state syncs, & we don't want to spam the
// same result every time. bounded so a long multi-battle session can't grow it without limit (on overflow we just
// reset; worst case is re-logging each mon's current outcome once).
const lastGuessOutcomes = new Map<string, string>();

/**
 * Attempts to find matching presets based on what's been revealed for the `pokemon` in battle.
 *
 * * Matched presets are based on the following conditions:
 *   - Revealed Tera type (if any in gen 9) matches the preset's `teraTypes[]`,
 *   - Revealed ability (if any in a non-legacy gen) matches the preset's `ability` or `altAbilities[]`,
 *   - Revealed item (if any in a non-legacy gen) matches the preset's `item` or `altItems[]`, &
 *   - All revealed moves (if any) match the preset's `moves[]` or `altMoves[]`.
 * * Matching doesn't take into account user-provided dirty properties, only battle-reported ones.
 * * Assumes that `presets[]` have already been pre-filtered for the `pokemon`'s current forme!
 *   - Otherwise, use the `selectPokemonPresets()` utility from `@showdex/utils/presets` to perform the filtering for you.
 * * When `config.formatOnly` is `true`, only presets matching the provided `config.format` will be returned.
 * * Guaranteed to return an empty array.
 *
 * @since 1.1.3
 */
export const guessMatchingPresets = (
  presets: CalcdexPokemonPreset[],
  pokemon: CalcdexPokemon,
  config: {
    format: string;
    formatOnly?: boolean;
    usages?: CalcdexPokemonPreset[];
  },
): CalcdexPokemonPreset[] => {
  const { format, formatOnly, usages } = { ...config };
  const gen = detectGenFromFormat(format);
  const legacy = detectLegacyGen(gen);
  const randoms = !!format?.includes('random');

  if (!gen || !presets?.length || !pokemon?.speciesForme) {
    return [];
  }

  const {
    speciesForme,
    transformedForme,
    teraType: revealedTeraType,
    ability: revealedAbility,
    item: currentItem,
    prevItem,
    revealedMoves,
    transformedMoves,
    usageMoves, // might be stale (i.e., these could be of the currently applied preset if called in the midst of applying another one!)
  } = pokemon;

  const currentForme = transformedForme || speciesForme;
  const revealedItem = prevItem || currentItem;
  const revealedSourceMoves = transformedMoves?.length ? transformedMoves : (revealedMoves || []);

  // note: don't use altMoves[] since there's a special length check for Randoms
  // const matchingUsage = findMatchingUsage(usages, { ...pokemon, moves: revealedSourceMoves });
  // const guaranteedMoves = ((matchingUsage?.altMoves as typeof usageMoves) || usageMoves || []).filter((m) => m?.[1] === 1).map((m) => m[0]);
  // const guessedMoves = replaceBehemothMoves(currentForme, dedupeArray([...revealedSourceMoves, ...guaranteedMoves]));

  l.debug(
    'Attempting to guess presets for', pokemon?.ident || pokemon?.speciesForme,
    '\n', 'revealedItem', revealedItem,
    '\n', 'revealedSourceMoves[]', '->', transformedMoves?.length ? 'transformedMoves[]' : 'revealedMoves[]', revealedSourceMoves,
    // '\n', 'matchingUsage', matchingUsage,
    // '\n', 'guaranteedMoves[]', guaranteedMoves,
    // '\n', 'guessedMoves[]', guessedMoves,
  );

  const matched = presets.filter((preset) => {
    const matchingUsage = findMatchingUsage(usages, preset);
    const guaranteedMoves = ((matchingUsage?.altMoves as typeof usageMoves) || usageMoves || []).filter((m) => m?.[1] === 1).map((m) => m[0]);
    const guessedMoves = replaceBehemothMoves(preset.speciesForme, dedupeArray([...revealedSourceMoves, ...guaranteedMoves]));
    const presetMoves = replaceBehemothMoves(preset.speciesForme, dedupeArray([...preset.moves, ...flattenAlts(preset.altMoves)]));

    // with NO moves revealed yet, don't let the move check veto everything -- let the OTHER gates (esp. a
    // revealed Mega stone, which uniquely pins the forme+role) do the discriminating. the auto-apply only locks
    // on when a SINGLE preset survives every gate (useCalcdexPresets: `matchedPresets.length === 1`), so a
    // moveless mon with nothing else distinguishing stays ambiguous, while e.g. Raichu-Mega-Y (revealed
    // Raichunite Y -> the lone item-matching survivor) gets auto-picked.
    const movesMatch = !revealedSourceMoves.length
      /**
       * @todo update this when we support more than 4 moves
       */
      // if guessedMoves[].length > 4, then it probably wasn't it chief
      // (e.g., 2 Randoms role presets could share 2 of the same non-guaranteed moves that was revealed,
      // but have 3 unique 100% guaranteed ones)
      || (guessedMoves.length <= 4
        && revealedSourceMoves.every((m) => presetMoves.includes(m)));

    if (legacy) {
      return movesMatch;
    }

    const formatsMatch = !formatOnly || getGenfulFormat(preset.gen, preset.format) === format;

    const teraTypesMatch = !revealedTeraType
      || !preset.teraTypes?.length
      || preset.teraTypes.includes(revealedTeraType);

    // like itemsMatch (below), the ability isn't reliably role-discriminative in Randoms — and mega formes
    // guarantee a mismatch: the preset lists the POST-mega ability (e.g. Venusaur-Mega "Thick Fat") while the
    // battle still reveals the BASE ability (Chlorophyll/Overgrow), so a mismatched ability must NOT reject an
    // otherwise move-matching role. let the revealed MOVES discriminate; abilities only gate non-Randoms.
    const abilitiesMatch = randoms
      || !revealedAbility
      || (currentForme.startsWith('Terapagos') && preset.speciesForme === 'Terapagos' && preset.ability === 'Tera Shift' as AbilityName)
      || [preset.ability, ...flattenAlts(preset.altAbilities)].includes(revealedAbility);

    const itemMatched = !revealedItem
      || [preset.item, ...flattenAlts(preset.altItems)].includes(revealedItem);

    // in Randoms the item is usually a sampled, NON-discriminative drop (e.g. Samurott reveals Aqua Jet -> only
    // "Setup Sweeper" has it, but it also rolled a Life Orb that neither role lists), so a mismatched item must
    // NOT reject an otherwise move-matching role -- let the revealed MOVES discriminate.
    // EXCEPTION: a Mega stone IS the discriminator between a mon's base & mega roles (e.g. Abomasnow &
    // Abomasnow-Mega both roll "Bulky Support" w/ the same moves; only the revealed Abomasite tells them apart),
    // so when the revealed item is a Mega stone, keep gating even in Randoms.
    const itemsMatch = (randoms && !isMegaStone(revealedItem)) || itemMatched;

    l.debug(
      'Result for preset', preset.calcdexId, preset.name, 'for', preset.speciesForme,
      '\n', 'formatsMatch?', formatsMatch,
      '\n', 'teraTypesMatch?', teraTypesMatch,
      '\n', 'abilitiesMatch?', abilitiesMatch,
      '\n', 'itemsMatch?', itemsMatch,
      '\n', 'movesMatch?', movesMatch,
      '\n', 'matchingUsage', matchingUsage,
      '\n', 'guaranteedMoves[]', guaranteedMoves,
      '\n', 'guessedMoves[]', guessedMoves,
      '\n', 'presetMoves[]', presetMoves,
      '\n', 'preset', preset,
      '\n', 'pokemon', pokemon,
    );

    return formatsMatch && teraTypesMatch && abilitiesMatch && itemsMatch && movesMatch;
  });

  // concise, object-free info summary so a prod bug report (info+ only, no debug firehose) can still reconstruct
  // the guess: who, what was revealed, the pool size, & what (if anything) it resolved to. emitted ONLY when the
  // outcome changes for this mon (see throttle above). the per-preset gate breakdown stays at debug.
  const outcomeId = pokemon?.calcdexId || pokemon?.ident || pokemon?.speciesForme || '';
  const outcomeSig = matched.map((p) => p.calcdexId).join(',');

  if (outcomeId && lastGuessOutcomes.get(outcomeId) !== outcomeSig) {
    if (lastGuessOutcomes.size > 1000) { lastGuessOutcomes.clear(); }
    lastGuessOutcomes.set(outcomeId, outcomeSig);

    l.info(
      'Guessed', pokemon?.ident || pokemon?.speciesForme || '???', 'in', format,
      '|', 'revealed item', revealedItem || '—', 'moves', revealedSourceMoves.join('/') || '—',
      '|', `${matched.length}/${presets.length} matched`,
      ...(matched.length ? ['->', matched.map((p) => `${p.name} (${p.speciesForme})`).join(', ')] : []),
    );
  }

  return matched;
};

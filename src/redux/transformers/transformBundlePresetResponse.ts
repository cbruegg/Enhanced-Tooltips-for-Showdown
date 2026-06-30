import { type PkmnApiSmogonFormatPresetResponse, type PkmnApiSmogonPresetRequest } from '@showdex/interfaces/api';
import { type CalcdexPokemonPreset } from '@showdex/interfaces/calc';
import { nonEmptyObject } from '@showdex/utils/core';
import { transformFormatPresetResponse } from './transformFormatPresetResponse';
import { transformFormatStatsResponse } from './transformFormatStatsResponse';

/**
 * Mega/Primal forme suffix (incl. X/Y megas like `'Charizard-Mega-X'` & primals like `'Groudon-Primal'`).
 *
 * * Deliberately excludes `'-Ultra'` (Ultra Necrozma) -- that's a Z-crystal transformation, not a held-stone
 *   mega, so it doesn't fold onto its base the same way.
 *
 * @since 1.4.3
 */
const MegaPrimalForme = /-(?:Mega(?:-[A-Z]+)?|Primal)$/i;

/**
 * Transforms a locally-bundled preset payload into `CalcdexPokemonPreset[]`'s, auto-routing by shape.
 *
 * * Bundles come in two flavors:
 *   - **Sets** (e.g. the NCP Champions bundle): a `{ [speciesForme]: { [presetName]: set } }` map, handled
 *     by `transformFormatPresetResponse()` (discrete named sets).
 *   - **Usage stats** (e.g. the Smogon Champions usage bundles): a `{ pokemon: { [speciesForme]: stats } }`
 *     object -- the same shape the pkmn Format Stats API serves -- handled by `transformFormatStatsResponse()`
 *     (a `'Showdown Usage'` preset per mon, with usage-% alts + spreads).
 * * Lets bakedex serve usage presets for formats the pkmn APIs don't publish (e.g. `gen9champions*`),
 *   reusing the exact same usage transform Showdex already uses for mainline formats -- no new runtime code.
 *
 * @since 1.4.0
 */
export const transformBundlePresetResponse = (
  response: PkmnApiSmogonFormatPresetResponse,
  meta: unknown,
  args: PkmnApiSmogonPresetRequest,
): CalcdexPokemonPreset[] => {
  const presets = nonEmptyObject((response as { pokemon?: Record<string, unknown> })?.pokemon)
    ? transformFormatStatsResponse(response as never, meta as never, args)
    : transformFormatPresetResponse(response, meta, args);

  // Randoms-only: fold a mon's mega/primal-forme presets onto its base forme. In Champions Randoms the base &
  // mega roles arrive as separate speciesFormes (e.g. Glimmora "Fast Support" + Glimmora-Mega "Fast Attacker"),
  // so each renders as its own lonely "100%"-usage forme. They already carry the Mega stone as their `item`, so
  // collapsing onto the base forme lets the item distinguish them: they group under one forme & the auto-guesser
  // sees them as a single pool. (Gated to Randoms per Keith; mainline mega sets are intentionally left split.)
  if (args?.format?.includes('random')) {
    presets.forEach((preset) => {
      const base = preset.speciesForme?.replace(MegaPrimalForme, '');

      if (base && base !== preset.speciesForme) {
        preset.speciesForme = base;
      }
    });
  }

  return presets;
};

import { type CalcdexPokemonPreset } from '@showdex/interfaces/calc';
import { getGenlessFormat } from '@showdex/utils/dex';

/**
 * Returns whether the given `preset` belongs to the provided `genlessFormat` (gen-stripped format string).
 *
 * This is the canonical predicate for format-scoping bundle/usage/storage preset pools in Honkdex
 * (and battle Calcdex) contexts, so that — for example — a `gen9championsou` Honkdex sees only
 * championsou-format presets and not those from `championsbss`, `championsvgc2026`, `vgc2025`, etc.
 *
 * Both sides are normalized to genless before comparison: `storage` presets carry a **genful** format
 * (e.g. `'gen9ou'`, `'gen9doublesou'`), while `bundle`/`smogon`/`import` presets are already genless
 * (e.g. `'ou'`, `'championsou'`, `'vgc2025'`). Comparing without normalizing would wrongly drop a saved
 * `'gen9ou'` set from an actual gen9ou battle (`'ou' !== 'gen9ou'`), so we run `preset.format` through
 * `getGenlessFormat()` first (idempotent on already-genless formats).
 *
 * Rules (evaluated in order):
 * 1. If `genlessFormat` is falsy (non-scoped context), every preset passes — returns `true`.
 * 2. If `preset.format` is falsy (the preset bears no format tag, i.e., it's generic/global), it
 *    passes — returns `true`. This lets format-less Teambuilder entries remain accessible in any context.
 * 3. Exact match: `genlessFormat === getGenlessFormat(preset.format)` — returns `true`.
 * 4. Prefix match: `genlessFormat.startsWith(getGenlessFormat(preset.format))` — returns `true`.
 *    - Intentional: a bundle tagged `format: 'champions'` (parent variant, no specific sub-format)
 *      is considered valid for any Champions sub-format (`'championsou'`, `'championsvgc2026'`, …).
 *    - ⚠️ The `startsWith` is *directional*: `'championsou'.startsWith('champions')` is `true`, but
 *      `'championsou'.startsWith('championsbss')` is `false`, so distinct-variant bundles (BSS, VGC, …)
 *      are correctly excluded when the current format is OU. Likewise, a `vgc2025` bundle (→ `'vgc2025'`)
 *      never leaks into a Champions OU session, and a genful `'gen9ou'` storage set (→ `'ou'`) never
 *      leaks into a `'championsou'` Honkdex.
 *
 * Does **not** handle Randoms pools — callers are expected to guard against that upstream (e.g., check
 * `randoms` and skip calling this predicate when the bundle source is Randoms-specific).
 *
 * @since 1.4.3
 */
export const presetFormatMatches = (
  genlessFormat: string,
  preset: CalcdexPokemonPreset,
): boolean => {
  if (!genlessFormat || !preset?.format) {
    return true;
  }

  const presetFormat = getGenlessFormat(preset.format) || preset.format;

  return genlessFormat === presetFormat || genlessFormat.startsWith(presetFormat);
};

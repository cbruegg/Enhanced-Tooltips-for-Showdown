import * as React from 'react';
import { type Duration } from 'date-fns';
import { type CalcdexPokemonPreset, type CalcdexPokemonUsageAlt } from '@showdex/interfaces/calc';
import {
  usePokemonBundledPresetQuery,
  usePokemonFormatPresetQuery,
  usePokemonFormatStatsQuery,
  usePokemonRandomsPresetQuery,
  usePokemonRandomsStatsQuery,
} from '@showdex/redux/services';
import { useCalcdexSettings, useTeamdexPresets } from '@showdex/redux/store';
import { logger } from '@showdex/utils/debug';
import {
  detectGenFromFormat,
  getGenfulFormat,
  getGenlessFormat,
  legalLockedFormat,
  parseBattleFormat,
} from '@showdex/utils/dex';
import { type CalcdexPokemonUsageAltSorter, usageAltPercentFinder, usageAltPercentSorter } from '@showdex/utils/presets';
import { presetFormatMatches } from './presetFormatMatches';

/**
 * Options for the `useBattlePresets()` hook.
 *
 * @since 1.1.7
 */
export interface CalcdexBattlePresetsHookOptions {
  /**
   * Format of the battle.
   *
   * * Should be prefixed with the gen, i.e., `'gen<#>'`.
   *
   * @example 'gen9randombattle'
   * @see CalcdexPokemonPresetsHookOptions['format']
   * @since 1.1.7
   */
  format: string;

  /**
   * Whether the presets shouldn't be fetched.
   *
   * * As of v1.1.7, it appears I'm suddenly a contractions kind of guy.
   *   - yesn't
   *
   * @default false
   * @since 1.1.7
   */
  disabled?: boolean;
}

/**
 * Return object of the `useBattlePresets()` hook.
 *
 * @since 1.1.7
 */
export interface CalcdexBattlePresetsHookValue {
  /**
   * Whether the presets are being fetched, either remotely or from the cache.
   *
   * * Might be more useful to use this over `ready` for UI rendering.
   *
   * @since 1.1.7
   */
  loading: boolean;

  /**
   * Whether the presets are ready to be used.
   *
   * * Doesn't mean that `presets[]` & `usages[]` will be populated, but that RTK finished doing what it needs to do.
   * * Will be immediately `true` if we're skipping fetching, which means RTK is technically finished.
   *   - (Cause it has nothing to do lol)
   * * Might be more useful to use this over `loading` for component logic.
   *
   * @since 1.1.7
   */
  ready: boolean;

  /**
   * Presets matching the provided `format`.
   *
   * * If a non-Randoms `format` is provided (e.g., `'gen9ou'`), all presets matching the derived gen will be included.
   * * Note that this includes presets for **every** Pokemon.
   *
   * @default
   * ```ts
   * []
   * ```
   * @since 1.1.7
   */
  presets: CalcdexPokemonPreset[];

  /**
   * Presets containing usage stats or Randoms probabilities for the provided `format`.
   *
   * * Unlike `presets[]`, this only includes usage stats for the matching `format`, not derived gen.
   * * Note that this includes usage presets for **every** Pokemon.
   *
   * @default
   * ```ts
   * []
   * ```
   * @since 1.1.7
   */
  usages: CalcdexPokemonPreset[];

  /**
   * Compiled species forme usage data derived from `usages[]`.
   *
   * @default
   * ```ts
   * []
   * ```
   * @since 1.2.1
   */
  formeUsages: CalcdexPokemonUsageAlt<string>[];

  /**
   * Memoized mapping of format labels from `parseBattleFormat()`.
   *
   * * Used as an optimization to provide into sorters like `sortPresetsByFormat()` & `buildPresetOptions()`.
   *
   * @default
   * ```ts
   * {}
   * ```
   * @since 1.2.1
   */
  formatLabelMap: Record<string, string>;

  /**
   * Memoized forme usage percent finder.
   *
   * * Used as an optimization for passing into `buildFormeOptions()` in the Honkdex.
   *
   * @since 1.2.3
   */
  formeUsageFinder: (value: string) => string;

  /**
   * Memoized forme usage percent sorter.
   *
   * * Used as an optimization for passing into `buildFormeOptions()` in the Honkdex.
   *
   * @since 1.2.3
   */
  formeUsageSorter: CalcdexPokemonUsageAltSorter<string>;
}

const l = logger('@showdex/utils/presets/useBattlePresets()');

/**
 * Conveniently initiates preset fetching via RTK Query & "neatly" parses them for the given `format`.
 *
 * * Though seemingly similar to `usePokemonPresets()`, this is meant to be applied battle-wide in `CalcdexProvider`.
 *   - Prior implementation with `usePokemonPresets()` was scoped to each player's Pokemon, which would result in up to
 *     6 `updatePokemon()` dispatches per player!
 *   - With this, we can optimize the initial preset application routines originally in `CalcdexPokeProvider` by merging
 *     all of the applied preset mutations for all players' Pokemon in a single `updatePlayer()` dispatch.
 *
 * @since 1.1.7
 */
export const useBattlePresets = (
  options: CalcdexBattlePresetsHookOptions,
): CalcdexBattlePresetsHookValue => {
  const {
    format,
    disabled,
  } = options || {};

  const {
    base: formatBase,
    label: formatLabel,
  } = parseBattleFormat(format);

  const legalFormat = legalLockedFormat(format);

  const {
    downloadSmogonPresets,
    downloadRandomsPresets,
    downloadUsageStats,
    includeTeambuilder,
    includeOtherMetaPresets,
    includePresetsBundles,
    maxPresetAge,
  } = useCalcdexSettings();

  const teamdexPresets = useTeamdexPresets();

  const maxAge: Duration = typeof maxPresetAge === 'number' && maxPresetAge > 0
    ? { days: maxPresetAge }
    : null;

  const gen = detectGenFromFormat(format);
  const genlessFormat = getGenlessFormat(format);
  const randoms = genlessFormat?.includes('random');

  // Champions (non-Randoms) formats aren't published by the pkmn Format Sets/Stats APIs -- their presets come
  // from bakedex usage bundles instead -- so don't even try (it'd just 404)
  const champions = !randoms && !!genlessFormat?.includes('champions');

  const teambuilderPresets = React.useMemo(() => (
    includeTeambuilder !== 'never'
      && !!gen
      && !randoms
      && teamdexPresets.filter((p) => (
        p?.gen === gen
          && (includeTeambuilder !== 'teams' || p.source === 'storage')
          && (includeTeambuilder !== 'boxes' || p.source === 'storage-box')
      ))
  ) || [], [
    gen,
    includeTeambuilder,
    randoms,
    teamdexPresets,
  ]);

  const shouldSkipAny = disabled || !gen || !genlessFormat;
  const shouldSkipBundles = shouldSkipAny || !includePresetsBundles?.length;
  const shouldSkipFormats = shouldSkipAny || randoms || champions || !downloadSmogonPresets;
  const shouldSkipFormatStats = shouldSkipAny || randoms || champions || !downloadUsageStats;
  const shouldSkipRandoms = shouldSkipAny || !randoms || !downloadRandomsPresets;
  const shouldSkipRandomsStats = shouldSkipAny || !randoms || !downloadUsageStats;

  const {
    data: bundledPresets,
    isUninitialized: bundledPresetsPending,
    isLoading: bundledPresetsLoading,
  } = usePokemonBundledPresetQuery({
    gen,
    bundleIds: includePresetsBundles,
  }, {
    skip: shouldSkipBundles,
  });

  const {
    data: formatPresets,
    isUninitialized: formatPresetsPending,
    isLoading: formatPresetsLoading,
  } = usePokemonFormatPresetQuery({
    gen,
    format,
    maxAge,
  }, {
    skip: shouldSkipFormats,
  });

  const {
    data: formatStats,
    isUninitialized: formatStatsPending,
    isLoading: formatStatsLoading,
  } = usePokemonFormatStatsQuery({
    gen,
    format,
    formatOnly: true,
    maxAge,
  }, {
    skip: shouldSkipFormatStats,
  });

  const {
    data: randomsPresets,
    isUninitialized: randomsPresetsPending,
    isLoading: randomsPresetsLoading,
  } = usePokemonRandomsPresetQuery({
    gen,
    format,
    maxAge,
  }, {
    skip: shouldSkipRandoms,
  });

  const {
    data: randomsStats,
    isUninitialized: randomsStatsPending,
    isLoading: randomsStatsLoading,
  } = usePokemonRandomsStatsQuery({
    gen,
    format,
    formatOnly: true,
    maxAge,
  }, {
    skip: shouldSkipRandomsStats,
  });

  const presets = React.useMemo<CalcdexPokemonPreset[]>(() => {
    if (randoms) {
      return [...(randomsPresets || [])];
    }

    const output = [
      // scope storage (Teambuilder) presets to the current format so cross-format Teambuilder entries
      // (e.g. a saved gen9ou set) don't appear in a gen9championsou Honkdex; presets without a format
      // tag pass through presetFormatMatches() unchanged (they're treated as format-agnostic)
      ...(teambuilderPresets || []).filter((p) => presetFormatMatches(genlessFormat, p)),
      // scope bundle presets the same way — prevents a vgc2025 or championsbss bundle from supplying
      // mons (and sets) that are illegal in the current format (e.g. Great Tusk in championsou)
      ...(bundledPresets || []).filter((p) => presetFormatMatches(genlessFormat, p)),
      // shouldSkip{Formats,FormatStats} only skips the FETCH — the RTK query hooks still return cached
      // gen-wide data (e.g. gen9ou presets/usage cached by another Calcdex instance). A Champions Honkdex
      // skips both (the pkmn APIs don't publish champs), so it must also IGNORE that cached data here, else
      // cross-format mons (e.g. Great Tusk's gen9ou sets/usage) leak into the pool. Non-skipped formats are
      // unaffected (shouldSkip* is false -> the sources flow through exactly as before).
      ...((!shouldSkipFormats && formatPresets) || []),
      ...((!shouldSkipFormatStats && formatStats) || []),
    ];

    if (!legalFormat || includeOtherMetaPresets) {
      return output;
    }

    // note: legalLockedFormat() internally removes the gen, so `p.format` being genless is all g
    return output.filter((p) => legalLockedFormat(p.format));
  }, [
    bundledPresets,
    formatPresets,
    formatStats,
    genlessFormat,
    includeOtherMetaPresets,
    legalFormat,
    randoms,
    randomsPresets,
    shouldSkipFormats,
    shouldSkipFormatStats,
    teambuilderPresets,
  ]);

  const formatLabelMap = React.useMemo(() => presets.reduce((prev, preset) => {
    if (!preset?.calcdexId) {
      return prev;
    }

    const presetFormat = getGenfulFormat(preset.gen, preset.format);

    if (presetFormat && !prev[presetFormat]) {
      prev[presetFormat] = parseBattleFormat(presetFormat).label;
    }

    return prev;
  }, {
    ...(!!formatBase && !!formatLabel && {
      [getGenfulFormat(gen, formatBase)]: formatLabel,
    }),
  } as Record<string, string>), [
    formatBase,
    formatLabel,
    gen,
    presets,
  ]);

  const usages = React.useMemo<CalcdexPokemonPreset[]>(() => (
    randoms
      ? [...(randomsStats || [])]
      // include bundled usage presets (e.g. Champions usage bundles) so forme usage %'s & usage matching
      // work for formats the pkmn Format Stats API doesn't publish; scoped to the CURRENT format via
      // presetFormatMatches() — the canonical shared predicate — so cross-format bundles (e.g. vgc2025,
      // championsbss) are excluded when the Honkdex is set to championsou
      // see the presets memo: a Champions Honkdex skips formatStats, but the RTK hook still returns cached
      // gen9ou usage — drop it when skipped so Great Tusk's gen9ou usage doesn't leak into formeUsages
      : [...((!shouldSkipFormatStats && formatStats) || []), ...(bundledPresets || []).filter((p) => (
        p?.source === 'usage' && presetFormatMatches(genlessFormat, p)
      ))]
  ), [
    bundledPresets,
    shouldSkipFormatStats,
    formatStats,
    genlessFormat,
    randoms,
    randomsStats,
  ]);

  // build the usage alts, if provided from usages[]
  // e.g., [['Great Tusk', 0.3739], ['Kingambit', 0.3585], ['Dragapult', 0.0746], ...]
  // dedup by speciesForme (keeping the highest usage % when a forme appears in multiple matching bundles,
  // e.g. both a generic 'champions' parent bundle and a 'championsou' specific bundle include Kingambit —
  // without dedup Kingambit would appear twice in the forme dropdown's Usage group)
  const formeUsages = React.useMemo<CalcdexPokemonUsageAlt<string>[]>(() => {
    const deduped = new Map<string, number>();

    for (const u of usages) {
      if (!u?.speciesForme || !u.formeUsage) {
        continue;
      }

      const existing = deduped.get(u.speciesForme);

      if (existing === undefined || u.formeUsage > existing) {
        deduped.set(u.speciesForme, u.formeUsage);
      }
    }

    return [...deduped.entries()].map(([speciesForme, formeUsage]) => [speciesForme, formeUsage]);
  }, [
    usages,
  ]);

  const formeUsageFinder = React.useMemo(
    () => usageAltPercentFinder(formeUsages, true),
    [formeUsages],
  );

  const formeUsageSorter = React.useMemo(
    () => usageAltPercentSorter(formeUsageFinder),
    [formeUsageFinder],
  );

  const pending = (
    (!shouldSkipFormats && formatPresetsPending)
      || (!shouldSkipBundles && bundledPresetsPending)
      || (!shouldSkipFormatStats && formatStatsPending)
      || (!shouldSkipRandoms && randomsPresetsPending)
      || (!shouldSkipRandomsStats && randomsStatsPending)
  );

  const loading = (
    pending
      || (!shouldSkipBundles && bundledPresetsLoading)
      || (!shouldSkipFormats && formatPresetsLoading)
      || (!shouldSkipFormatStats && formatStatsLoading)
      || (!shouldSkipRandoms && randomsPresetsLoading)
      || (!shouldSkipRandomsStats && randomsStatsLoading)
  );

  const ready = (
    shouldSkipFormats
      && shouldSkipBundles
      && shouldSkipFormatStats
      && shouldSkipRandoms
      && shouldSkipRandomsStats
  ) || (
    !pending
      && !loading
  );

  // (teledex) pool diagnostics — surfaces which source a forme leaks in from (e.g. a champions Honkdex
  // still showing Great Tusk). debug-level: dev-console-gated + captured by teledex when developerMode is on
  React.useEffect(() => {
    if (!ready) {
      return;
    }

    const hasForme = (arr: CalcdexPokemonPreset[], forme = 'Great Tusk') => (arr || [])
      .filter((p) => p?.speciesForme === forme)
      .map((p) => `${p.source}:${p.format}`);

    // concise, object-free info summary (prod-captured) so a bug report shows the pool the mon had to work with
    // -- e.g. "0 presets" instantly explains a no-preset mon. the full leak breakdown below stays at debug.
    l.info(
      'Preset pool for', format,
      '|', `${presets?.length || 0} presets, ${usages?.length || 0} usages`,
      randoms ? '(randoms)' : (champions ? '(champions)' : ''),
    );

    l.debug(
      'pool diagnostics for', format,
      '\n', 'genlessFormat', genlessFormat, '| randoms', randoms, '| champions', champions,
      '\n', 'shouldSkip { formats, formatStats, bundles }', shouldSkipFormats, shouldSkipFormatStats, shouldSkipBundles,
      '\n', 'counts { formatPresets, formatStats, bundled, teambuilder, presets, usages, formeUsages }',
      formatPresets?.length || 0, formatStats?.length || 0, bundledPresets?.length || 0,
      teambuilderPresets?.length || 0, presets?.length || 0, usages?.length || 0, formeUsages?.length || 0,
      '\n', 'Great Tusk via formatPresets', hasForme(formatPresets),
      '\n', 'Great Tusk via formatStats', hasForme(formatStats),
      '\n', 'Great Tusk via bundled', hasForme(bundledPresets),
      '\n', 'Great Tusk via usages', hasForme(usages),
      '\n', 'Great Tusk in formeUsages?', formeUsages.some((u) => u?.[0] === 'Great Tusk'),
    );
  }, [
    bundledPresets,
    champions,
    format,
    formatPresets,
    formatStats,
    formeUsages,
    genlessFormat,
    presets,
    randoms,
    ready,
    shouldSkipBundles,
    shouldSkipFormatStats,
    shouldSkipFormats,
    teambuilderPresets,
    usages,
  ]);

  return {
    loading,
    ready,
    presets,
    usages,
    formatLabelMap,
    formeUsages,
    formeUsageFinder,
    formeUsageSorter,
  };
};

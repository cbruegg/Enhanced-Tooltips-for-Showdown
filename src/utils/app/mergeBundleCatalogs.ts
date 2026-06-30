import {
  type BakedexApiBunsAssetBundle,
  type BakedexApiBunsNamespace,
  type BakedexApiBunsPayload,
  BakedexApiBunsNamespaces,
} from '@showdex/interfaces/api';

/**
 * Which catalog a merged bundle entry was sourced from.
 *
 * * `'prebundle'` -> the locally-bundled catalog shipped w/ the extension (`buns.json` in `src/assets/bundles`).
 * * `'online'` -> the Bakedex CDN catalog (`<base>/v1/buns`).
 *
 * @since 1.4.0
 */
export type BundleCatalogSource = 'prebundle' | 'online';

/**
 * Loosely-typed bundle catalog accepted by `mergeBundleCatalogs()`.
 *
 * * Intentionally permissive (partial bundles) since the merge only reads each entry's `updated`/`created` &
 *   copies the rest wholesale -- callers pass full `BakedexApiBunsPayload`s, fixtures can pass minimal entries.
 *
 * @since 1.4.0
 */
export type MergeableBunsCatalog = Partial<Record<
  BakedexApiBunsNamespace,
  Record<string, Partial<BakedexApiBunsAssetBundle>>
>>;

/**
 * Result of merging two Bakedex bundle catalogs.
 *
 * @since 1.4.0
 */
export interface MergedBundleCatalog {
  /**
   * Merged catalog, keeping the freshest entry per bundle (by `updated`, falling back to `created`).
   */
  buns: BakedexApiBunsPayload;

  /**
   * Per-namespace, per-bundle record of which catalog won the freshness comparison.
   *
   * * Lets the baker fetch each bundle's *data* from the same source its metadata won from, so a
   *   freshly-baked-but-not-yet-published bundle loads its prebundled payload instead of stale CDN data.
   */
  sources: Partial<Record<BakedexApiBunsNamespace, Record<string, BundleCatalogSource>>>;
}

/**
 * Resolves a bundle's freshness as epoch millis, preferring `updated` over `created`.
 *
 * @since 1.4.0
 */
const bundleDate = (
  bun?: Partial<Pick<BakedexApiBunsAssetBundle, 'updated' | 'created'>>,
): number => (bun && new Date(bun.updated || bun.created || 0).valueOf()) || 0;

/**
 * Merges the locally-bundled & online Bakedex bundle catalogs, keeping whichever entry has the fresher date.
 *
 * * Union of bundle IDs across both catalogs -> a bundle present in only one source still survives (e.g. a
 *   freshly-baked bundle that the online repo hasn't caught up to yet).
 * * When a bundle exists in both, the one with the greater `updated` (or `created`) timestamp wins; ties go to
 *   `'online'` since it's the canonical published source.
 * * Pure & side-effect-free -- no `env`/IndexedDB/`fetch` deps -- so it's the unit-testable core of the baker.
 *
 * @since 1.4.0
 */
export const mergeBundleCatalogs = (
  prebundle?: MergeableBunsCatalog,
  online?: MergeableBunsCatalog,
): MergedBundleCatalog => {
  const buns: Record<string, Record<string, Partial<BakedexApiBunsAssetBundle>>> = {};
  const sources: MergedBundleCatalog['sources'] = {};

  const namespaces = [...new Set([
    ...Object.keys(prebundle || {}),
    ...Object.keys(online || {}),
  ])].filter((nsp) => BakedexApiBunsNamespaces.includes(nsp as BakedexApiBunsNamespace)) as BakedexApiBunsNamespace[];

  for (const nsp of namespaces) {
    const pre = prebundle?.[nsp] || {};
    const onl = online?.[nsp] || {};

    const mergedNsp: Record<string, Partial<BakedexApiBunsAssetBundle>> = {};
    const nspSources: Record<string, BundleCatalogSource> = {};

    for (const id of [...new Set([...Object.keys(pre), ...Object.keys(onl)])]) {
      const preBun = pre[id];
      const onlBun = onl[id];

      // prefer online on a tie (>=) since it's the canonical published source
      const useOnline = !!onlBun && (!preBun || bundleDate(onlBun) >= bundleDate(preBun));

      mergedNsp[id] = useOnline ? onlBun : preBun;
      nspSources[id] = useOnline ? 'online' : 'prebundle';
    }

    buns[nsp] = mergedNsp;
    sources[nsp] = nspSources;
  }

  return { buns: buns as BakedexApiBunsPayload, sources };
};

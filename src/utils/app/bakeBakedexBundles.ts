/**
 * @file `bakeBakedexBundles.ts`
 * @author Keith Choison <keith@tize.io>
 * @since 1.2.4
 */

import { type Duration, add, compareAsc } from 'date-fns';
import {
  type BakedexApiBundleResponse,
  type BakedexApiBunsAssetBundle,
  type BakedexApiBunsNamespace,
  type BakedexApiBunsResponse,
  BakedexApiBunsNamespaces,
} from '@showdex/interfaces/api';
import {
 type RootState, type RootStore, type ShowdexSliceBundles, showdexSlice,
} from '@showdex/redux/store';
import {
  env,
  getResourceUrl,
  joinUris,
  nonEmptyObject,
  runtimeFetch,
} from '@showdex/utils/core';
import { logger } from '@showdex/utils/debug';
import {
  type ShowdexBundlesDbResult,
  readBundlesDb,
  readMetaDb,
  showdexedDb,
  writeBundlesDb,
  writeMetaDb,
} from '@showdex/utils/storage';
import { type BundleCatalogSource, mergeBundleCatalogs } from './mergeBundleCatalogs';

const enabled = env.bool('bakedex-enabled');
const baseUrl = joinUris(env('bakedex-base-url'), env('bakedex-api-prefix'));
const maxAge: Duration = { [env('bakedex-update-interval-unit', 'weeks')]: env.int('bakedex-update-interval', 2) };

const fetchOptions: Parameters<typeof runtimeFetch>[1] = {
  headers: { Accept: 'text/plain' },
};

const l = logger('@showdex/utils/app/bakeBakedexBundles()');

/**
 * Fetches & validates a bundle catalog (`buns`) from the given URL, returning its payload or `null`.
 *
 * * Swallows fetch/parse failures (returns `null`) so a downed online repo gracefully degrades to the
 *   locally-bundled catalog instead of bailing the whole bake.
 *
 * @since 1.4.0
 */
const fetchBuns = async (
  url: string,
): Promise<BakedexApiBunsResponse['payload']> => {
  if (!url) {
    return null;
  }

  try {
    const response = await runtimeFetch<BakedexApiBunsResponse>(url, fetchOptions);
    const data = response.json();

    if (!data?.ok || data.ntt !== 'buns' || !nonEmptyObject(data.payload)) {
      return null;
    }

    return data.payload;
  } catch (error) {
    l.debug('fetchBuns() couldn\'t fetch a bundle catalog from', url, '\n', error);

    return null;
  }
};

/**
 * Determines if any Bakedex asset bundles need to be updated & updates them.
 *
 * @since 1.2.4
 */
export const bakeBakedexBundles = async (
  config?: {
    db?: IDBDatabase;
    store?: RootStore;
  },
): Promise<void> => {
  const { db: database, store } = { ...config };
  const db = database || showdexedDb.value;

  const writePayload: ShowdexBundlesDbResult = {};
  const statePayload: Partial<ShowdexSliceBundles> = {};

  const { bundled } = await readMetaDb<Record<'bundled', number>>(['bundled'], { db });
  const { buns } = await readBundlesDb(['buns'], { db });
  const onlineStale = !nonEmptyObject(buns) || !bundled || compareAsc(new Date(), add(new Date(bundled), maxAge)) > -1;

  // always read the locally-bundled catalog shipped w/ the extension (cheap & offline-safe), so freshly-baked
  // bundles surface immediately instead of waiting on the online repo to catch up (or the cache to age out)
  const prebundledBuns = await fetchBuns(getResourceUrl('buns.json'));

  // only hit the network when the cache has aged out (or there's nothing cached yet); when it's not time to
  // refresh -- or the fetch fails -- reuse the last-known catalog so we don't prune anything we already have
  let onlineBuns = buns;

  if ((onlineStale || !nonEmptyObject(buns)) && enabled && baseUrl) {
    onlineBuns = (await fetchBuns(joinUris(baseUrl, 'buns'))) || buns;
  }

  // merge both catalogs, keeping whichever entry has the fresher date; `catalogSources` records who won so each
  // bundle's *data* can be fetched from the same source its metadata came from (avoids fresh-label/stale-data)
  const { buns: latestBuns, sources: catalogSources } = mergeBundleCatalogs(prebundledBuns, onlineBuns);

  if (!nonEmptyObject(latestBuns)) {
    return void l.error(
      'Couldn\'t load any bundle catalog at all :o !!',
      '\n', 'buns', '(cached)', buns,
      '\n', 'buns', '(prebundled)', prebundledBuns,
      '\n', 'buns', '(latest)', latestBuns,
    );
  }

  const staleBunIds: Partial<Record<BakedexApiBunsNamespace, string[]>> = {};
  const cachedPayloads: Partial<Record<BakedexApiBunsNamespace, Record<string, unknown>>> = {};

  for (const [nsp, latestNspBuns] of Object.entries(latestBuns) as Entries<typeof latestBuns>) {
    if (!BakedexApiBunsNamespaces.includes(nsp)) {
      continue;
    }

    if (!Array.isArray(staleBunIds[nsp])) {
      staleBunIds[nsp] = [];
    }

    const cachedNspBuns = Object.values({ ...buns?.[nsp] }) as BakedexApiBunsAssetBundle[];

    for (const latestNspBun of Object.values(latestNspBuns) as typeof cachedNspBuns) {
      if (!latestNspBun?.id) {
        continue;
      }

      const cachedNspBun = cachedNspBuns.find((b) => !!b?.id && b.id === latestNspBun.id);

      if (!cachedNspBun?.updated) {
        l.debug(
          'Couldn\'t find the cached bundle namespace metadata; marking', nsp, 'bundle', latestNspBun.id, 'as stale!',
          '\n', 'cachedNspBun', cachedNspBun,
          '\n', 'latestNspBun', latestNspBun,
          '\n', 'buns', '(cached)', buns,
          '\n', 'buns', '(latest)', latestBuns,
        );

        staleBunIds[nsp].push(latestNspBun.id);

        continue;
      }

      const cachedDate = new Date(cachedNspBun.updated).valueOf() || 0;
      const latestDate = new Date(latestNspBun.updated).valueOf() || 0;

      if (latestDate > cachedDate) {
        l.debug(
          'Latest updated timestamp is after cached timestamp; marking', nsp, 'bundle', latestNspBun.id, 'as stale!',
          '\n', 'cachedNspBun', '(updated)', cachedDate, cachedNspBun,
          '\n', 'latestNspBun', '(updated)', latestDate, latestNspBun,
          '\n', 'buns', '(cached)', buns,
          '\n', 'buns', '(latest)', latestBuns,
        );

        staleBunIds[nsp].push(latestNspBun.id);

        continue;
      }

      // load cached bundle into Redux
      cachedPayloads[nsp] = (await readBundlesDb([nsp], { db }))?.[nsp];

      if (!nonEmptyObject(cachedPayloads[nsp]?.[latestNspBun.id])) {
        l.debug(
          'Actual cached bundle payloads don\'t exist apparently; marking', nsp, 'bundle', latestNspBun.id, 'as stale!',
          '\n', 'cached', cachedPayloads[nsp],
          '\n', 'cachedNspBun', cachedNspBun,
          '\n', 'latestNspBun', latestNspBun,
          '\n', 'buns', '(cached)', buns,
          '\n', 'buns', '(latest)', latestBuns,
        );

        staleBunIds[nsp].push(latestNspBun.id);

        continue;
      }

      // 'presets' aren't being *directly* loaded into Redux btw (i.e., the ShowdexSliceState)
      // (instead, they're loaded into the RTK Query API endpoint slice via buildBundleQuery() from @showdex/redux/factories)
      if (latestNspBun.ntt !== 'presets') {
        if (!Array.isArray(cachedPayloads[nsp][latestNspBun.id])) {
          staleBunIds[nsp].push(latestNspBun.id);

          continue;
        }

        (statePayload as Record<typeof latestNspBun.ntt, unknown[]>)[latestNspBun.ntt] = [
          ...(statePayload[latestNspBun.ntt] || []),
          ...(cachedPayloads[nsp][latestNspBun.id] as unknown[]).map((item) => ({
            ...(item as Record<string, unknown>),
            __bunId: latestNspBun.id,
            __updated: cachedDate,
          })),
        ];
      }

      statePayload.buns = {
        ...latestBuns,
        ...statePayload.buns,
        [nsp]: {
          ...latestNspBuns,
          ...statePayload.buns?.[nsp],
          [latestNspBun.id]: { ...latestNspBun },
        },
      };
    }
  }

  const hasChanges = Object.values(staleBunIds).some((ids) => !!ids.length);

  l.debug(
    'Found', hasChanges ? 'some' : 'no', 'bundles to', enabled ? 'update' : 'load',
    '\n', 'buns', '(cached)', buns,
    '\n', 'buns', '(latest)', latestBuns,
    '\n', 'staleBunIds[]', staleBunIds,
    '\n', 'statePayload', statePayload,
  );

  if (hasChanges) {
    for (const [nsp, ids] of Object.entries(staleBunIds) as Entries<typeof staleBunIds>) {
      if (!ids?.length) {
        continue;
      }

      for (const id of ids) {
        const nspBun = latestBuns[nsp][id];
        const prebundleUrl = getResourceUrl(`${id}.${nspBun.ext || 'json'}`);
        const onlineUrl = enabled && baseUrl ? joinUris(baseUrl, nsp, id, nspBun.ext) : null;

        // fetch each bundle's data from whichever catalog won on freshness, falling back to the other source
        // (e.g. a prebundle-won bundle the online repo hasn't published yet loads its local payload, not stale CDN)
        const source: BundleCatalogSource = catalogSources?.[nsp]?.[id] || 'online';
        const primaryUrl = source === 'prebundle' || !onlineUrl ? prebundleUrl : onlineUrl;
        const fallbackUrl = primaryUrl === prebundleUrl ? onlineUrl : prebundleUrl;

        let bundleData: BakedexApiBundleResponse<'presets' | 'titles' | 'tiers'> = null;

        try {
          const bundleResponse = await runtimeFetch<typeof bundleData>(primaryUrl, fetchOptions);

          bundleData = bundleResponse.json();

          if (!bundleData?.ok) {
            throw new Error(`bundleData is not ok from ${primaryUrl} >:((((`);
          }
        } catch (error) {
          if (!fallbackUrl) {
            throw error;
          }

          // primary source didn't have it; try the other catalog (e.g. online repo hasn't published it yet)
          const bundleResponse = await runtimeFetch<typeof bundleData>(fallbackUrl, fetchOptions);

          bundleData = bundleResponse.json();
        }

        if (!bundleData?.ok) { // we tried :c
          l.warn('Couldn\'t fetch the latest bundle:', bundleData);

          continue;
        }

        (writePayload as Record<typeof nsp, unknown>)[nsp] = {
          ...cachedPayloads[nsp],
          ...writePayload[nsp],
          [id]: bundleData.payload,
        };

        const shouldUpdateState = ['players', 'supporters'].includes(nsp)
          && ['titles', 'tiers'].includes(bundleData.ntt)
          && Array.isArray(bundleData.payload);

        if (shouldUpdateState) {
          const ntt = bundleData.ntt as 'titles' | 'tiers'; // nt ts

          (statePayload as Record<typeof ntt, unknown[]>)[ntt] = [
            ...(statePayload[ntt] || []),
            ...(bundleData.payload as typeof statePayload[typeof ntt]).map((item) => ({
              ...(item as Record<string, unknown>),
              __bunId: id,
              __updated: new Date(nspBun.updated).valueOf(),
            })),
          ];
        }

        writePayload.buns = {
          ...latestBuns,
          ...writePayload.buns,
          [nsp]: {
            ...latestBuns[nsp],
            ...writePayload.buns?.[nsp],
            [id]: { ...nspBun },
          },
        };
      }
    }
  }

  const hasWrites = Object.values(writePayload).some((v) => nonEmptyObject(v));

  if (hasWrites) {
    await writeBundlesDb(writePayload, { db });
    await writeMetaDb({ bundled: Date.now() }, { db });

    statePayload.buns = { ...writePayload.buns };

    l.debug(
      'Updated some new bundles',
      '\n', 'buns', '(cached)', buns,
      '\n', 'buns', '(latest)', latestBuns,
      '\n', 'staleBunIds[]', staleBunIds,
      '\n', 'writePayload', writePayload,
      '\n', 'statePayload', statePayload,
    );
  }

  // one-time migration: default-enable every (non-disabled) preset bundle so users get them out of the box
  // -- incl. the NCP Champions + Smogon Champions usage bundles. gated by a `bundlesDefaulted` meta flag so it
  // runs exactly once per user (even if they'd already baked some bundles before this shipped); afterwards the
  // user's explicit enable/disable choices in the settings are fully respected.
  if (typeof store?.dispatch === 'function') {
    const { bundlesDefaulted } = await readMetaDb<Record<'bundlesDefaulted', boolean>>(['bundlesDefaulted'], { db });

    if (!bundlesDefaulted) {
      const presetBundleIds = Object.values(latestBuns?.presets || {})
        .filter((bun) => !!bun?.id && !bun.disabled)
        .map((bun) => bun.id);

      if (presetBundleIds.length) {
        const currentBundleIds = (store.getState() as RootState)
          ?.showdex?.settings?.calcdex?.includePresetsBundles || [];

        store.dispatch(showdexSlice.actions.updateSettings({
          calcdex: { includePresetsBundles: [...new Set([...currentBundleIds, ...presetBundleIds])] },
        }));
      }

      await writeMetaDb({ bundlesDefaulted: true }, { db });
    }
  }

  if (typeof store?.dispatch !== 'function' || !Object.values(statePayload).some((v) => nonEmptyObject(v))) {
    return;
  }

  store.dispatch(showdexSlice.actions.updateBundles(statePayload));
};

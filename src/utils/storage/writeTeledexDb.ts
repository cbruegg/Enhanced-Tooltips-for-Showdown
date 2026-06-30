/**
 * @file `writeTeledexDb.ts`
 * @author Keith Choison <keith@tize.io>
 * @since 1.3.1
 */

import { type TeledexRecord } from '@showdex/utils/debug';
import { env, nonEmptyObject } from '@showdex/utils/core';
import { showdexedDb } from './openIndexedDb';

const teledexName = env('indexed-db-teledex-store-name');

/**
 * Writes an array of `TeledexRecord`'s to Showdex's IndexedDB teledex store.
 *
 * * Never rejects; logging must not break the app.
 * * Intentionally does NOT log (no `runtimer`/`logger`) — this is the teledex capture *backend*, so a
 *   log here would itself be captured + re-mirrored + logged again on every debounce tick (infinite loop).
 *
 * @since 1.3.1
 */
export const writeTeledexDb = (
  records: TeledexRecord[],
  config?: {
    db?: IDBDatabase;
  },
): Promise<void> => new Promise((
  resolve,
) => {
  const db = config?.db || showdexedDb.value;

  if (!teledexName || typeof db?.transaction !== 'function' || !records?.length) {
    resolve();

    return;
  }

  const txn = db.transaction(teledexName, 'readwrite');
  const store = txn.objectStore(teledexName);

  records.forEach((record) => {
    if (nonEmptyObject(record) && record.id) {
      store.put(record);
    }
  });

  txn.oncomplete = () => resolve();
  txn.onerror = () => resolve(); // never reject; logging must not break the app
});

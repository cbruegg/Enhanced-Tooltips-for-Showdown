/**
 * @file `pruneTeledexDb.ts`
 * @author Keith Choison <keith@tize.io>
 * @since 1.3.1
 */

import { env } from '@showdex/utils/core';
import { showdexedDb } from './openIndexedDb';

const teledexName = env('indexed-db-teledex-store-name');

/**
 * Prunes the teledex IndexedDB store by deleting records older than `before` and/or beyond `max`,
 * walking oldest-first via the `ts` index.
 *
 * * Never rejects; logging must not break the app.
 * * Intentionally does NOT log (no `runtimer`/`logger`) — this is the teledex capture *backend* (see
 *   `writeTeledexDb`).
 *
 * @since 1.3.1
 */
export const pruneTeledexDb = (
  config?: {
    db?: IDBDatabase;
    before?: number;
    max?: number;
  },
): Promise<void> => new Promise((
  resolve,
) => {
  const db = config?.db || showdexedDb.value;
  const before = config?.before ?? 0;
  const max = config?.max ?? Infinity;

  if (!teledexName || typeof db?.transaction !== 'function') {
    resolve();

    return;
  }

  const txn = db.transaction(teledexName, 'readwrite');
  const store = txn.objectStore(teledexName);

  // count first, then walk oldest->newest deleting while too old or over the count cap
  const countReq = store.count();

  countReq.onsuccess = () => {
    let remaining = countReq.result;
    const cursorReq = store.index('ts').openCursor();

    cursorReq.onsuccess = (event) => {
      const cursor = (event.target as typeof cursorReq).result;

      if (!cursor) {
        return;
      }

      const tooOld = (cursor.value as { ts: number }).ts < before;
      const overCap = remaining > max;

      if (tooOld || overCap) {
        cursor.delete();
        remaining--;
        cursor.continue();
      }

      // ts index is ascending; once a record is new enough AND under cap, the rest are too
    };
  };

  txn.oncomplete = () => resolve();
  txn.onerror = () => resolve(); // never reject; logging must not break the app
});

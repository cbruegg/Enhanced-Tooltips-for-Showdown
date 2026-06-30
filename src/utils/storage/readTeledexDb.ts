/**
 * @file `readTeledexDb.ts`
 * @author Keith Choison <keith@tize.io>
 * @since 1.3.1
 */

import { type TeledexRecord } from '@showdex/utils/debug';
import { env } from '@showdex/utils/core';
import { showdexedDb } from './openIndexedDb';

const teledexName = env('indexed-db-teledex-store-name');

/**
 * Reads from Showdex's IndexedDB teledex store & returns all stored records, oldest-first.
 *
 * * Guaranteed to return an empty array.
 * * Intentionally does NOT log (no `runtimer`/`logger`) — this is the teledex capture *backend* (see
 *   `writeTeledexDb`).
 *
 * @since 1.3.1
 */
export const readTeledexDb = (
  config?: {
    db?: IDBDatabase;
  },
): Promise<TeledexRecord[]> => new Promise((
  resolve,
) => {
  const db = config?.db || showdexedDb.value;
  const output: TeledexRecord[] = [];

  if (!teledexName || typeof db?.transaction !== 'function') {
    resolve(output);

    return;
  }

  const store = db.transaction(teledexName).objectStore(teledexName);
  const req = store.index('ts').openCursor();

  req.onsuccess = (event) => {
    const cursor = (event.target as typeof req).result;

    if (!cursor) {
      resolve(output);

      return;
    }

    output.push(cursor.value as TeledexRecord);
    cursor.continue();
  };

  req.onerror = () => resolve(output);
});

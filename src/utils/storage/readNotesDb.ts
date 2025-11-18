/**
 * @file `readNotesDb.ts`
 * @author Keith Choison <keith@tize.io>
 * @since 1.3.0
 */

import { type NotedexSliceInstance, type NotedexSliceState } from '@showdex/redux/store';
import { env, nonEmptyObject } from '@showdex/utils/core';
import { logger, runtimer } from '@showdex/utils/debug';
import { showdexedDb } from './openIndexedDb';

const notesName = env('indexed-db-notes-store-name');
const l = logger('@showdex/utils/storage/readNotesDb()');

/**
 * Reads from Showdex's IndexedDB notes store & returns all the stored notes, if any.
 *
 * * Guaranteed to return an empty object.
 *
 * @since 1.3.0
 */
export const readNotesDb = (
  database?: IDBDatabase,
): Promise<NotedexSliceState['notes']> => new Promise((
  resolve,
) => {
  const endTimer = runtimer(l.scope, l);
  const db = database || showdexedDb.value;
  const output: NotedexSliceState['notes'] = {};

  if (!notesName || typeof db?.transaction !== 'function') {
    endTimer('(bad args)');
    resolve(output);

    return;
  }

  const txn = db.transaction(notesName, 'readonly');
  const store = txn.objectStore(notesName);
  const req = store.index('saved').openCursor();

  req.onsuccess = (event) => {
    const cursor = (event.target as typeof req).result;

    if (!cursor) {
      endTimer('(done)');
      resolve(output);

      return;
    }

    const state = cursor.value as NotedexSliceInstance;

    if (!nonEmptyObject(state) || !state.id) {
      return void cursor.continue();
    }

    output[state.id] = state;
    cursor.continue();
  };
});

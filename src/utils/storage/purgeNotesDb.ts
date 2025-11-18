/**
 * @file `purgeNotesDb.ts`
 * @author Keith Choison <keith@tize.io>
 * @since 1.3.0
 */

import { env } from '@showdex/utils/core';
import { logger, runtimer } from '@showdex/utils/debug';
import { showdexedDb } from './openIndexedDb';

const notesName = env('indexed-db-notes-store-name');
const l = logger('@showdex/utils/storage/purgeNotesDb()');

/**
 * Removes saved notes (i.e., `NotedexSliceInstance`'s) from Showdex's IndexedDB notes store.
 *
 * @since 1.3.0
 */
export const purgeNotesDb = (
  noteId: string | string[],
  config?: {
    db?: IDBDatabase;
  },
): Promise<void> => new Promise((
  resolve,
  // reject,
) => {
  const endTimer = runtimer(l.scope, l);
  const db = config?.db || showdexedDb.value;
  const ids = [...(Array.isArray(noteId) ? noteId : [noteId])].filter(Boolean);

  if (!ids.length || typeof db?.transaction !== 'function') {
    endTimer('(bad args)');
    resolve();

    return;
  }

  const txn = db.transaction(notesName, 'readwrite');
  const store = txn.objectStore(notesName);

  ids.forEach((id) => void store.delete(id));

  txn.oncomplete = () => {
    endTimer('(done)');
    resolve();
  };
});

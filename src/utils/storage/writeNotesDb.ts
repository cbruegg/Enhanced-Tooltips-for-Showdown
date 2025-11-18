/**
 * @file `writeNotesDb.ts`
 * @author Keith Choison <keith@tize.io>
 * @since 1.3.0
 */

import { type NotedexSliceInstance } from '@showdex/redux/store';
import { env, nonEmptyObject } from '@showdex/utils/core';
import { logger, runtimer } from '@showdex/utils/debug';
import { showdexedDb } from './openIndexedDb';

const notesName = env('indexed-db-notes-store-name');
const l = logger('@showdex/utils/storage/writeNotesDb()');

/**
 * Writes the provided `note` to Showdex's IndexedDB notes store.
 *
 * * Returns the Unix epoch timestamp at which the `note` was saved.
 * * `null` will be returned if the writing failed for whatever reason.
 *
 * @since 1.3.0
 */
export const writeNotesDb = (
  note: NotedexSliceInstance,
  config?: {
    db?: IDBDatabase;
  },
): Promise<number> => new Promise((
  resolve,
) => {
  const endTimer = runtimer(l.scope, l);
  const db = config?.db || showdexedDb.value;

  if (!notesName || !nonEmptyObject(note) || !note.id || typeof db?.transaction !== 'function') {
    endTimer('(bad args)');
    resolve(null);

    return;
  }

  const txn = db.transaction(notesName, 'readwrite');
  const store = txn.objectStore(notesName);
  const saved = Date.now();

  store.put({ ...note, saved });

  txn.oncomplete = () => {
    endTimer(
      '(done)',
      '\n', 'note', note.id,
      '\n', 'saved', saved,
    );

    resolve(saved);
  };
});

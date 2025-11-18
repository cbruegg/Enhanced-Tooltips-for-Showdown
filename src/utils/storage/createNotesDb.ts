/**
 * @file `createNotesDb.ts`
 * @author Keith Choison <keith@tize.io>
 * @since 1.3.0
 */

import { env } from '@showdex/utils/core';
import { logger } from '@showdex/utils/debug';

const notesName = env('indexed-db-notes-store-name');
const l = logger('@showdex/utils/storage/createNotesDb()');

/**
 * Creates the notes object store in the provided IndexedDB `db`.
 *
 * * This particular object store has the `'id'` as the `keyPath` (i.e., in-line keys) & disabled `autoIncrement`.
 * * These contain saved notes (each of type `NotedexSliceInstance`), which are created by Notedexes.
 * * For use within the `onupgradeneeded()` callback.
 *
 * @since 1.3.0
 */
export const createNotesDb = (
  db: IDBDatabase,
): IDBObjectStore => {
  if (!notesName || typeof db?.createObjectStore !== 'function') {
    l.warn(
      'food for thought',
      '\n', 'db.createObjectStore()', '(type)', typeof db?.createObjectStore,
      '\n', 'INDEXED_DB_NOTES_STORE_NAME', notesName,
      '\n', 'db', '(name)', db?.name, '(v)', db?.version,
    );

    return null;
  }

  if (db.objectStoreNames.contains(notesName)) {
    l.silly(notesName, 'object store already exists');

    return null;
  }

  const store = db.createObjectStore(notesName, { keyPath: 'id' });

  store.createIndex('name', 'name', { unique: false });
  store.createIndex('created', 'created', { unique: false });
  store.createIndex('updated', 'updated', { unique: false });
  store.createIndex('saved', 'saved', { unique: false });

  store.transaction.oncomplete = () => void l.verbose(
    'Created object store:', store?.name,
    '\n', 'db', '(name)', db.name, '(v)', db.version,
  );

  return store;
};

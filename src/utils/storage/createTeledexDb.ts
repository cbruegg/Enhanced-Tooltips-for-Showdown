/**
 * @file `createTeledexDb.ts`
 * @author Keith Choison <keith@tize.io>
 * @since 1.3.1
 */

import { env } from '@showdex/utils/core';
import { logger } from '@showdex/utils/debug';

const teledexName = env('indexed-db-teledex-store-name');
const l = logger('@showdex/utils/storage/createTeledexDb()');

/**
 * Creates the teledex object store in the provided IndexedDB `db`.
 *
 * * This particular object store has the `'id'` as the `keyPath` (i.e., in-line keys) & disabled `autoIncrement`.
 *   - Has non-unique indices for `ts` (for pruning/sorting) and `session` (for grouping by page-load session).
 * * These contain flushed `TeledexRecord`'s from the in-memory ring buffer.
 * * For use within the `onupgradeneeded()` callback.
 *
 * @since 1.3.1
 */
export const createTeledexDb = (
  db: IDBDatabase,
): IDBObjectStore => {
  if (!teledexName || typeof db?.createObjectStore !== 'function') {
    l.warn(
      'say the line bart',
      '\n', 'db.createObjectStore()', '(type)', typeof db?.createObjectStore,
      '\n', 'INDEXED_DB_TELEDEX_STORE_NAME', teledexName,
      '\n', 'db', '(name)', db?.name, '(v)', db?.version,
    );

    return null;
  }

  if (db.objectStoreNames.contains(teledexName)) {
    l.silly(teledexName, 'object store already exists');

    return null;
  }

  const store = db.createObjectStore(teledexName, { keyPath: 'id' });

  store.createIndex('ts', 'ts', { unique: false });
  store.createIndex('session', 'session', { unique: false });

  store.transaction.oncomplete = () => void l.verbose(
    'Created object store:', store?.name,
    '\n', 'db', '(name)', db.name, '(v)', db.version,
  );

  return store;
};

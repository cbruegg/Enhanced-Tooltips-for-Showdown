// src/utils/debug/teledex/teledexSink.ts
import { dumpPayloadToClipboard, dumpPayloadToFile } from '@showdex/utils/core/dumpPayload';
import { pruneTeledexDb, readTeledexDb, writeTeledexDb } from '@showdex/utils/storage';
import { configureTeledex } from './teledex';

/**
 * Wires the IndexedDB mirror + flush backend into the `teledex` singleton.
 *
 * Lives OUTSIDE the logger→teledex import path (and is intentionally NOT re-exported from the
 * `@showdex/utils/debug` barrel), so importing the logger never drags the storage/clipboard chain
 * back into a cycle. Call this ONCE at boot, before any capture/flush occurs.
 *
 * @since 1.2.5
 */
// teledex.flush() already pre-bounds every record arg (8KB) before dumping, so the payload is acyclic +
// bounded -> plain JSON.stringify keeps the dump COMPLETE + valid. safeStringify's 16MB cap would otherwise
// truncate a big dev dump (developerMode/__DEV__ captures debug+) into UNparseable JSON.
const stringify = (value: unknown): string => JSON.stringify(value);

export const wireTeledexSink = (): void => void configureTeledex({
  writeRecords: writeTeledexDb,
  readRecords: readTeledexDb,
  pruneRecords: pruneTeledexDb,
  dumpToFile: (payload, nameParts) => dumpPayloadToFile(payload, nameParts, stringify),
  dumpToClipboard: (payload) => dumpPayloadToClipboard(payload, stringify),
});

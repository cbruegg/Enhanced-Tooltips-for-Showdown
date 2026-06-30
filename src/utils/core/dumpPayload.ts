import FileSaver from 'file-saver';
import LzString from 'lz-string';
import { writeClipboardText } from './clipboard';
import { safeStringify } from './safeStringify';

/**
 * Copies a payload to the clipboard as JSON.
 *
 * * `serialize` defaults to `safeStringify` (circular-safe — a battle's logged Showdown objects are cyclic),
 *   but a caller whose payload is already acyclic + bounded (e.g. the teledex flush, which pre-bounds every
 *   record arg) can pass `JSON.stringify` to get a COMPLETE dump instead of one capped at `safeStringify`'s
 *   16MB ceiling.
 */
export const dumpPayloadToClipboard = (
  payload: unknown,
  serialize: (value: unknown) => string = safeStringify,
): Promise<void> => (
  writeClipboardText(serialize(payload))
);

/**
 * Saves a payload as an LzString-compressed `<...nameParts>.bin.lz` download.
 *
 * * See `dumpPayloadToClipboard()` re: `serialize` (defaults to the circular-safe, 16MB-capped `safeStringify`).
 */
export const dumpPayloadToFile = (
  payload: unknown,
  nameParts: (string | number)[],
  serialize: (value: unknown) => string = safeStringify,
): void => {
  const compressed = LzString.compressToUint8Array(serialize(payload));
  const blob = new Blob([compressed as Uint8Array<ArrayBuffer>]);

  FileSaver.saveAs(blob, [...nameParts, 'bin', 'lz'].filter(Boolean).join('.'));
};

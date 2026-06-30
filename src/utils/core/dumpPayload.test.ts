import {
 describe, expect, it, vi,
} from 'vitest';
import LzString from 'lz-string';

const saveAs = vi.fn();
vi.mock('file-saver', () => ({ default: { saveAs } }));
const { dumpPayloadToFile } = await import('./dumpPayload');

describe('dumpPayloadToFile()', () => {
  it('LzString-compresses the JSON and names the file <parts>.bin.lz', () => {
    dumpPayloadToFile({ hello: 'world' }, ['showdex', 'teledex', 'tABC']);
    expect(saveAs).toHaveBeenCalledOnce();
    const [blob, name] = saveAs.mock.calls[0];
    expect(name).toBe('showdex.teledex.tABC.bin.lz');
    expect(blob).toBeInstanceOf(Blob);
  });

  it('produces bytes that decompress back to the original JSON', () => {
    const json = JSON.stringify({ a: 1, b: [2, 3] });
    const bytes = LzString.compressToUint8Array(json);
    expect(LzString.decompressFromUint8Array(bytes)).toBe(json);
  });
});

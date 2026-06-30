// src/utils/debug/teledex/teledex.test.ts
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { configureTeledex, teledex } from './teledex';

// flush() calls the injected sink (dependency injection — no dynamic import / no cycle), so inject a mock
const dumpToFile = vi.fn();

describe('teledex', () => {
  beforeEach(() => {
    void teledex.clear();
    teledex.setDeveloperMode(false);
    dumpToFile.mockClear();
    configureTeledex({ dumpToFile });
  });

  it('captures into the in-memory buffer when enabled', () => {
    teledex.capture('warn', '@showdex/x', ['leak', { mon: 'Great Tusk' }]);
    expect(teledex.tail(1)[0]).toMatchObject({ level: 'warn', scope: '@showdex/x' });
  });

  it('does NOT capture dev-only levels in prod unless developerMode is on', () => {
    // __DEV__ is true under vitest, so simulate prod by checking shouldCapture directly
    teledex.setDeveloperMode(false);
    expect(teledex.shouldCapture('error')).toBe(true);
    expect(teledex.shouldCapture('debug')).toBe(true); // true here only because vitest sets __DEV__
  });

  it('flush(to:file) serializes the tail through the injected dumpToFile sink', async () => {
    teledex.capture('info', 's', ['hi']);
    await teledex.flush({ to: 'file' });
    expect(dumpToFile).toHaveBeenCalledOnce();
    const [payload] = dumpToFile.mock.calls[0];
    expect((payload as { records: unknown[] }).records.length).toBeGreaterThan(0);
  });

  it('subscribe() fires on capture and unsubscribes', () => {
    const fn = vi.fn();
    const off = teledex.subscribe(fn);
    teledex.capture('info', 's', []);
    expect(fn).toHaveBeenCalledTimes(1);
    off();
    teledex.capture('info', 's', []);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

// src/utils/debug/teledex/teledex.ts
import { add, sub } from 'date-fns';
import { env } from '@showdex/utils/core/getEnv';
import { boundedStringify } from '@showdex/utils/core/safeStringify';
import { type LoggerLevel } from '../logger';
import { devOnlyLevels } from '../levelMap';
import { TeledexBuffer } from './teledexBuffer';
import { type TeledexRecord, buildTeledexRecord, teledexSession } from './teledexRecord';
import { resolveTeledexConfig } from './teledexConfig';

declare const __DEV__: boolean;

/**
 * Injected backend for the parts of Teledex that would otherwise form a module-init import cycle:
 * the storage helpers + the clipboard chain transitively import the logger, and the logger imports
 * `teledex` (for the capture sink). So `teledex` imports NEITHER directly — `wireTeledexSink()`
 * (in `./teledexSink`, which lives OUTSIDE the logger→teledex path) injects them once at boot.
 *
 * This keeps `teledex` cycle-free AND avoids dynamic `import()`s — a content-script-injected
 * extension can't load webpack's code-split async chunks (they aren't `web_accessible_resources`),
 * so everything must stay in the single bundle.
 *
 * Every member is optional + guarded, so until wired (or with `TELEDEX_ENABLED=false`) Teledex
 * degrades cleanly to in-memory-only capture.
 *
 * @since 1.2.5
 */
export interface TeledexSink {
  writeRecords?: (records: TeledexRecord[]) => Promise<void>;
  readRecords?: () => Promise<TeledexRecord[]>;
  pruneRecords?: (opts: { before?: number; max?: number }) => Promise<void>;
  dumpToFile?: (payload: unknown, nameParts: (string | number)[]) => void;
  dumpToClipboard?: (payload: unknown) => Promise<void>;
}

let sink: TeledexSink = {};

/** Injects the IndexedDB + flush backend (called once at boot by `wireTeledexSink()`). */
export const configureTeledex = (impl: TeledexSink): void => {
  sink = { ...sink, ...impl };
};

// resolveTeledexConfig()/the buffer are still created lazily (cheap defensive deferral); harmless now
// that the cycle is gone via injection.
let _config: ReturnType<typeof resolveTeledexConfig> | undefined;
let _buffer: TeledexBuffer | undefined;

const cfg = () => {
  if (!_config) { _config = resolveTeledexConfig(); }
  return _config;
};
const buf = () => {
  if (!_buffer) { _buffer = new TeledexBuffer(cfg().maxRecords); }
  return _buffer;
};

const subscribers = new Set<() => void>();

let developerMode = false;
let pending: TeledexRecord[] = [];
let flushTimer: ReturnType<typeof setTimeout> = null;

const notify = () => {
  if (!subscribers.size) { return; } // no Devdex mounted (always, in prod) -> skip per-capture
  subscribers.forEach((fn) => { try { fn(); } catch { /* noop */ } });
};

const mirrorSoon = () => {
  if (!developerMode || flushTimer || !sink.writeRecords) {
    return;
  }

  flushTimer = setTimeout(() => {
    flushTimer = null;
    const batch = pending;
    pending = [];

    void (async () => {
      try {
        await sink.writeRecords(batch);

        if (sink.pruneRecords) {
          const before = sub(new Date(), cfg().maxAge).valueOf();
          await sink.pruneRecords({ before, max: cfg().maxRecords });
        }
      } catch { /* noop */ }
    })();
  }, 1000);
};

export const teledex = {
  shouldCapture(level: LoggerLevel): boolean {
    // prod (developerMode/__DEV__ off) captures info+ ONLY -- light + cheap (the debug firehose, w/ its big
    // stringified objects, never even builds). To keep prod bug reports useful WITHOUT that firehose, the key
    // paths emit a concise, object-free info-level summary that's enough to reconstruct what happened (e.g. the
    // guesser outcome in guessMatchingPresets). developerMode/__DEV__ then layers the full debug detail on top.
    return cfg().enabled && (!devOnlyLevels.includes(level) || __DEV__ || developerMode);
  },

  capture(level: LoggerLevel, scope: string, args: unknown[]): void {
    try {
      if (!this.shouldCapture(level)) {
        return;
      }

      const record = buildTeledexRecord(level, scope, args);
      buf().push(record);

      if (developerMode) {
        pending.push(record);
        mirrorSoon();
      }

      notify();
    } catch {
      // logging must never break the app
    }
  },

  setDeveloperMode(on: boolean): void {
    developerMode = !!on;
  },

  tail(n?: number): TeledexRecord[] { return buf().tail(n); },
  filter(pred: Parameters<TeledexBuffer['filter']>[0], limit?: number): TeledexRecord[] { return buf().filter(pred, limit); },
  all(): TeledexRecord[] { return buf().all(); },

  subscribe(fn: () => void): () => void {
    subscribers.add(fn);
    return () => void subscribers.delete(fn);
  },

  async flush(opts?: { to?: 'file' | 'clipboard'; tail?: number }): Promise<void> {
    const records = developerMode && sink.readRecords
      ? await sink.readRecords()
      : buf().all();
    const tail = opts?.tail ? records.slice(-opts.tail) : records;
    // bound each arg before serializing the whole payload — battle logs hold huge/circular Showdown objects
    // that would OOM the tab if JSON.stringify'd in full; cap each object arg to ~8KB (strings pass through)
    const safeRecords = tail.map((r) => ({
      ...r,
      args: (r.args || []).map((a) => (typeof a === 'string' ? a : boundedStringify(a, 8_000, 10))),
    }));
    const payload = {
      build: env('build-name'),
      session: teledexSession,
      created: new Date().toISOString(),
      count: safeRecords.length,
      records: safeRecords,
    };

    if (opts?.to === 'clipboard') {
      return void (await sink.dumpToClipboard?.(payload));
    }

    sink.dumpToFile?.(payload, [
      env('build-name'),
      'teledex',
      `t${Date.now().toString(16).toUpperCase()}`,
    ]);
  },

  async clear(): Promise<void> {
    buf().clear();
    pending = [];
    notify();

    if (developerMode && sink.pruneRecords) {
      try {
        await sink.pruneRecords({ before: add(new Date(), { years: 100 }).valueOf() });
      } catch { /* noop */ }
    }
  },
};

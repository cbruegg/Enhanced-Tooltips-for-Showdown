/**
 * Bounded, cycle-safe `JSON.stringify` that **bails early** — never throws and never OOMs.
 *
 * A live battle logs Showdown's `battle`/`room`/`pokemon` object graph, which is both **circular** and
 * **enormous**. A plain `JSON.stringify` throws on the cycles; even a cycle-safe one walks the *entire* graph
 * (gigabytes across a panel's worth of rows → the tab OOM-crashes). So this walker:
 *
 * - stops as soon as the output reaches `maxLength` (appends `…`),
 * - stops descending past `maxDepth` (emits `"[…]"`),
 * - replaces already-seen objects with `"[Circular]"`,
 * - truncates long strings, and stringifies functions/symbols/bigints as markers.
 *
 * The result is valid-ish JSON until truncation (after which it's a best-effort preview, not parseable) — so
 * use a generous `maxLength` when the output must round-trip, and a tight one for human-readable previews.
 *
 * @since 1.4.3
 */
export const boundedStringify = (
  value: unknown,
  maxLength = 10_000,
  maxDepth = 8,
): string => {
  const seen = new WeakSet<object>();
  const parts: string[] = [];
  let length = 0;
  let bailed = false;

  const push = (s: string): void => {
    if (bailed) {
      return;
    }

    parts.push(s);
    length += s.length;

    if (length >= maxLength) {
      bailed = true;
    }
  };

  const walk = (v: unknown, depth: number): void => {
    if (bailed) {
      return;
    }

    if (v === null || v === undefined) {
      push('null');
      return;
    }

    const type = typeof v;

    if (type === 'string') {
      const s = v as string;
      push(JSON.stringify(s.length > maxLength ? `${s.slice(0, maxLength)}…` : s));
      return;
    }

    if (type === 'number' || type === 'boolean') {
      push(String(v as number | boolean));
      return;
    }

    if (type === 'bigint') { push(`"${(v as bigint).toString()}n"`); return; }
    if (type === 'function') { push('"[Function]"'); return; }
    if (type === 'symbol') { push('"[Symbol]"'); return; }

    if (type === 'object') {
      if (seen.has(v as object)) { push('"[Circular]"'); return; }
      if (depth >= maxDepth) { push('"[…]"'); return; }

      seen.add(v as object);

      if (Array.isArray(v)) {
        push('[');

        for (let i = 0; i < v.length && !bailed; i++) {
          if (i) { push(','); }
          walk(v[i], depth + 1);
        }

        push(']');
        return;
      }

      push('{');
      let first = true;

      // eslint-disable-next-line no-restricted-syntax, guard-for-in
      for (const k in v as Record<string, unknown>) {
        if (bailed) { break; }
        if (!first) { push(','); }
        first = false;
        push(`${JSON.stringify(k)}:`);
        walk((v as Record<string, unknown>)[k], depth + 1);
      }

      push('}');
      return;
    }

    push('"[?]"');
  };

  try {
    walk(value, 0);
  } catch {
    return '"[Unserializable]"';
  }

  const out = parts.join('');

  return out.length > maxLength ? `${out.slice(0, maxLength)}…` : out;
};

/**
 * Circular-safe `JSON.stringify` with a (high) hard bound so it can never throw or OOM — for whole-payload
 * serialization (e.g. the teledex flush) where the input args have already been bounded per-record.
 *
 * @since 1.4.3
 */
export const safeStringify = (value: unknown): string => boundedStringify(value, 16_000_000, 24);

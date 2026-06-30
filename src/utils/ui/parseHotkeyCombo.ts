/**
 * Minimal structural shape of `react-hotkeys-hook` v5's `HotkeysEvent` (the `handler` arg of a `useHotkeys()`
 * callback). Only the bits `parseHotkeyCombo()` reads -- avoids importing the (non-exported) `HotkeysEvent` type.
 *
 * @since 1.4.0
 */
export interface ParsedHotkeyEvent {
  keys?: readonly string[];
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
  mod?: boolean;
}

/**
 * Maps `react-hotkeys-hook` v5's normalized key names back to the friendly aliases our `switch`es use.
 *
 * * v5 reports arrow keys as `'arrowup'` etc. & escape as `'escape'` (see its internal `Q` key map), whereas our
 *   hotkey strings (& the `case` labels) use `'up'`/`'esc'`.
 *
 * @since 1.4.0
 */
const HotkeyKeyAliases: Record<string, string> = {
  arrowup: 'up',
  arrowdown: 'down',
  arrowleft: 'left',
  arrowright: 'right',
  escape: 'esc',
};

/**
 * Normalizes a `react-hotkeys-hook` v5 `handler` back into a friendly `'<modifiers>+<key>'` combo string.
 *
 * * Bridges a breaking change from the v3 -> v5 bump: v5's `handler` dropped `.key` (the full combo string, e.g.
 *   `'shift+up'`) in favor of `.keys` (an array of modifier-stripped, aliased key names, e.g. `['arrowup']`) plus
 *   separate `.ctrl`/`.alt`/`.shift`/`.meta` booleans. Every `switch (handler.keys?.[0])` comparing against the
 *   old tokens (`'up'`, `'esc'`, `'shift+up'`) silently stopped matching.
 * * Re-aliases arrow/escape names & re-prefixes the active modifiers (ordered `ctrl+alt+shift+meta`) so existing
 *   `case 'up' | 'shift+up' | 'esc' | ...` labels keep working with a one-line change at each call site.
 * * Pure & side-effect-free -- unit-testable in isolation.
 *
 * @example
 * ```ts
 * parseHotkeyCombo({ keys: ['arrowup'], shift: true }); // 'shift+up'
 * parseHotkeyCombo({ keys: ['escape'] });               // 'esc'
 * ```
 * @since 1.4.0
 */
export const parseHotkeyCombo = (
  handler?: ParsedHotkeyEvent,
): string => {
  const rawKey = handler?.keys?.find(Boolean) || '';

  if (!rawKey) {
    return '';
  }

  const key = HotkeyKeyAliases[rawKey] || rawKey;

  const modifiers = [
    handler.ctrl && 'ctrl',
    handler.alt && 'alt',
    handler.shift && 'shift',
    handler.meta && 'meta',
  ].filter(Boolean);

  return [...modifiers, key].join('+');
};

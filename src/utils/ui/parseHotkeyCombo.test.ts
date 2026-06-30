import { describe, expect, it } from 'vitest';
import { parseHotkeyCombo } from './parseHotkeyCombo';

/**
 * Mimics the shape of `react-hotkeys-hook` v5's `HotkeysEvent` (modifier-stripped `keys[]` + modifier booleans).
 */
const evt = (keys: string[], mods: Record<string, boolean> = {}) => ({ keys, ...mods });

describe('parseHotkeyCombo()', () => {
  it('aliases v5 arrow-key names back to friendly ones', () => {
    expect(parseHotkeyCombo(evt(['arrowup']))).toBe('up');
    expect(parseHotkeyCombo(evt(['arrowdown']))).toBe('down');
    expect(parseHotkeyCombo(evt(['arrowleft']))).toBe('left');
    expect(parseHotkeyCombo(evt(['arrowright']))).toBe('right');
  });

  it('aliases escape -> esc & leaves enter as-is', () => {
    expect(parseHotkeyCombo(evt(['escape']))).toBe('esc');
    expect(parseHotkeyCombo(evt(['enter']))).toBe('enter');
  });

  it('prefixes the shift modifier to rebuild the original combo', () => {
    expect(parseHotkeyCombo(evt(['arrowup'], { shift: true }))).toBe('shift+up');
    expect(parseHotkeyCombo(evt(['arrowleft'], { shift: true }))).toBe('shift+left');
    expect(parseHotkeyCombo(evt(['enter'], { shift: true }))).toBe('shift+enter');
  });

  it('orders multiple modifiers as ctrl+alt+shift+meta', () => {
    expect(parseHotkeyCombo(evt(['enter'], { ctrl: true }))).toBe('ctrl+enter');
    expect(parseHotkeyCombo(evt(['arrowup'], { ctrl: true, shift: true }))).toBe('ctrl+shift+up');
    expect(parseHotkeyCombo(evt(['a'], { alt: true, meta: true }))).toBe('alt+meta+a');
  });

  it('passes through non-aliased keys verbatim', () => {
    expect(parseHotkeyCombo(evt(['a']))).toBe('a');
    expect(parseHotkeyCombo(evt(['f5']))).toBe('f5');
  });

  it('returns an empty string for missing / empty key data', () => {
    expect(parseHotkeyCombo(evt([]))).toBe('');
    expect(parseHotkeyCombo({})).toBe('');
    expect(parseHotkeyCombo(undefined)).toBe('');
  });
});

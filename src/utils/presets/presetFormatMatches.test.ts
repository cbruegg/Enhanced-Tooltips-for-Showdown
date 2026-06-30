import { describe, expect, it } from 'vitest';
import { type CalcdexPokemonPreset } from '@showdex/interfaces/calc';
import { presetFormatMatches } from './presetFormatMatches';

const preset = (format: string, source = 'bundle'): CalcdexPokemonPreset => ({
  format,
  source,
} as CalcdexPokemonPreset);

describe('presetFormatMatches()', () => {
  it('passes everything when no genlessFormat is given (non-scoped context)', () => {
    expect(presetFormatMatches('', preset('gen9ou'))).toBe(true);
    expect(presetFormatMatches(undefined as unknown as string, preset('vgc2025'))).toBe(true);
  });

  it('passes format-less presets (generic/global)', () => {
    expect(presetFormatMatches('championsou', preset(''))).toBe(true);
    expect(presetFormatMatches('championsou', { source: 'import' } as CalcdexPokemonPreset)).toBe(true);
  });

  it('normalizes genful storage formats so a saved gen9ou set matches a gen9ou battle', () => {
    // genlessFormat 'ou' vs genful 'gen9ou' — must normalize, else the user's own set is filtered out
    expect(presetFormatMatches('ou', preset('gen9ou', 'storage'))).toBe(true);
    expect(presetFormatMatches('doublesou', preset('gen9doublesou', 'storage'))).toBe(true);
  });

  it('keeps a gen9ou storage set OUT of a championsou Honkdex', () => {
    expect(presetFormatMatches('championsou', preset('gen9ou', 'storage'))).toBe(false);
  });

  it('matches a championsou bundle in a championsou Honkdex', () => {
    expect(presetFormatMatches('championsou', preset('championsou'))).toBe(true);
  });

  it('excludes other champions sub-format + vgc bundles from a championsou Honkdex', () => {
    expect(presetFormatMatches('championsou', preset('championsbss'))).toBe(false);
    expect(presetFormatMatches('championsou', preset('championsvgc2026'))).toBe(false);
    expect(presetFormatMatches('championsou', preset('vgc2025'))).toBe(false); // the Great Tusk leak source
  });

  it('lets a parent "champions" bundle cover any champions sub-format (startsWith)', () => {
    expect(presetFormatMatches('championsou', preset('champions'))).toBe(true);
    expect(presetFormatMatches('championsvgc2026', preset('champions'))).toBe(true);
  });
});

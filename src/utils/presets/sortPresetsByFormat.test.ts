import { describe, expect, it } from 'vitest';
import { type CalcdexPokemonPreset } from '@showdex/interfaces/calc';
import { sortPresetsByFormat } from './sortPresetsByFormat';

// genless preset.format -> getGenfulFormat(9, format) -> labelMap key
const labelMap: Record<string, string> = {
  gen9ou: 'OU',
  gen9championsou: 'Champions OU',
  gen9championsvgc2026: 'Champions VGC 2026',
  gen9uu: 'UU',
  gen9vgc2024: 'VGC 2024',
  gen9lc: 'LC', // the "current" format -- distinct so sorting falls through to the global priority list
};

const preset = (format: string): CalcdexPokemonPreset => ({
  calcdexId: format,
  id: format,
  gen: 9,
  format,
  speciesForme: 'Garchomp',
} as CalcdexPokemonPreset);

const order = (formats: string[], current = 'gen9lc') => formats
  .map(preset)
  .sort(sortPresetsByFormat(current, labelMap))
  .map((p) => p.format);

describe('sortPresetsByFormat() — Champions priority', () => {
  it('ranks Champions formats right under OU (not mixed into OU via the "ou" in "Champions OU")', () => {
    expect(order(['uu', 'championsou', 'ou'])).toEqual(['ou', 'championsou', 'uu']);
  });

  it('keeps all Champions variants grouped together between OU & UU', () => {
    const sorted = order(['uu', 'championsvgc2026', 'ou', 'championsou']);

    expect(sorted[0]).toBe('ou');
    expect(sorted[sorted.length - 1]).toBe('uu');
    // both Champions variants sit in the middle (their relative order is left input-stable)
    expect(sorted.slice(1, 3).sort()).toEqual(['championsou', 'championsvgc2026']);
  });

  it('still ranks Champions above lower-priority formats like VGC', () => {
    expect(order(['vgc2024', 'championsou'])).toEqual(['championsou', 'vgc2024']);
  });
});

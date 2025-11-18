/**
 * @file `battle-dex-data.d.ts` - Adapted from `pokemon-showdown-client/play.pokemonshowdown.com/src/battle-dex-data.ts`.
 * @author Keith Choison <keith@tize.io>
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license MIT
 * @since 0.1.0
 */

declare namespace Showdown {
  type StatName =
    | 'hp'
    | 'atk'
    | 'def'
    | 'spa'
    | 'spd'
    | 'spe';

  type StatNameNoHp = Exclude<StatName, 'hp'>;

  type BoostStatName =
    | StatNameNoHp
    | 'accuracy'
    | 'evasion'
    | 'spc';

  type NatureName =
    | 'Adamant'
    | 'Bashful'
    | 'Bold'
    | 'Brave'
    | 'Calm'
    | 'Careful'
    | 'Docile'
    | 'Gentle'
    | 'Hardy'
    | 'Hasty'
    | 'Impish'
    | 'Jolly'
    | 'Lax'
    | 'Lonely'
    | 'Mild'
    | 'Modest'
    | 'Naive'
    | 'Naughty'
    | 'Quiet'
    | 'Quirky'
    | 'Rash'
    | 'Relaxed'
    | 'Sassy'
    | 'Serious'
    | 'Timid';

  type TypeName =
    | 'Normal'
    | 'Fighting'
    | 'Flying'
    | 'Poison'
    | 'Ground'
    | 'Rock'
    | 'Bug'
    | 'Ghost'
    | 'Steel'
    | 'Fire'
    | 'Water'
    | 'Grass'
    | 'Electric'
    | 'Psychic'
    | 'Ice'
    | 'Dragon'
    | 'Dark'
    | 'Fairy'
    | 'Stellar'
    | '???';

  type StatusName =
    | 'par'
    | 'psn'
    | 'frz'
    | 'slp'
    | 'brn';

  type GenderName = 'M' | 'F' | 'N';
}

/**
 * @file `battle-teams.d.ts` - Adapted from `pokemon-showdown-client/play.pokemonshowdown.com/src/battle-teams.ts`.
 * @author Keith Choison <keith@tize.io>
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 * @since 1.3.0
 */

declare namespace Showdown {
  class BattleTeams {
    public pack(team?: PokemonSet[]): string;
    /** Very similar to `toID()` but w/out the lowercase conversion. */
    public packName(name?: string): string;
    public unpack(buf: string): PokemonSet[];
    public unpackSpeciesOnly(buf: string): string[];
    /** You may wish to manually add two spaces to the end of every line so linebreaks are preserved in Markdown. */
    public exportSet(set: PokemonSet, dex?: ModdedDex, newFormat?: boolean): string;
    public export(sets: PokemonSet[], dex?: ModdedDex, newFormat?: boolean): string;
  }
}

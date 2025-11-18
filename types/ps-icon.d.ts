/**
 * @file `ps-icon.d.ts` - Adapted from `pokemon-showdown-client/play.pokemonshowdown.com/src/panels.tsx`.
 * @author Keith Choison <keith@tize.io>
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 * @since 1.3.0
 */

declare namespace Showdown {
  type PSIconProps =
    | { pokemon?: string | Pokemon | ServerPokemon; }
    | { item: string; }
    | { type: string; b?: boolean; }
    | { category: string; };

  type PSIcon = (props: PSIconProps) => JSX.Element;
}

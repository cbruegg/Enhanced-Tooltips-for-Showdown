/**
 * @file `ps-group.d.ts` - Adapted from `pokemon-showdown-client/play.pokemonshowdown.com/src/client-main.ts`.
 * @author Keith Choison <keith@tize.io>
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 * @since 0.1.0
 */

declare namespace Showdown {
  interface PSGroup {
    name?: string;
    type?: 'leadership' | 'staff' | 'punishment';
    order: number;
  }
}

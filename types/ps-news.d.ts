/**
 * @file `ps-news.d.ts` - Adapted from `pokemon-showdown-client/play.pokemonshowdown.com/src/panel-mainmenu.tsx`.
 * @author Keith Choison <keith@tize.io>
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 * @since 1.3.0
 */

declare namespace Showdown {
  class NewsPanel extends PSRoomPanel {
    public static readonly id = 'news';
    public static readonly routes = ['news'];
    public static readonly title = 'News';
    public static readonly location = 'mini-window' as const;

    public change: (event: Event) => void;
  }
}

/**
 * @file `ps-page.d.ts` - Adapted from `pokemon-showdown-client/play.pokemonshowdown.com/src/panel-page.tsx`.
 * @author Keith Choison <keith@tize.io>
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 * @since 1.3.0
 */

/* eslint-disable max-classes-per-file */

declare namespace Showdown {
  /**
   * Internally does a `dangerouslySetInnerHTML` into a `<div>` after doing a `BattleLog.sanitizeHTML(children)`.
   */
  type SanitizedHTML = (props: { children: string; }) => JSX.Element;

  class PageRoom extends PSRoom {
    public override readonly id = 'html' as const;
    public override readonly canConnect = true as const;
    public readonly page = this.id.split('-')[1];
    public loading = true;
    public htmlData?: string;

    public setHTMLData: (htmlData?: string) => void;
  }

  class PagePanel extends PSRoomPanel<PageRoom> {
    public static readonly id = 'html' as const;
    public static readonly routes = ['view-*'] as const;
    public static readonly Model = PageRoom as const;
    public static clientRooms: Record<string, JSX.Element>;
  }
}

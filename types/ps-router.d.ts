/**
 * @file `ps-router.d.ts` - Adapted from `pokemon-showdown-client/play.pokemonshowdown.com/src/panels.tsx`.
 * @author Keith Choison <keith@tize.io>
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 * @since 1.3.0
 */

declare namespace Showdown {
  class PSRouter {
    public roomid = '' as RoomID;
    public panelState = '';

    public extractRoomID(url?: string): RoomID;
    /**
     * For the `changed` prop in the returned value:
     *
     * * `true` = `roomid` changed,
     * * `false` = `panelState` changed, or
     * * `null` = neither changed.
     */
    public updatePanelState(): {
      roomid: RoomID;
      changed?: boolean;
      newTitle: string;
    };
    public subscribeHash(): void;
    public subscribeHistory(): void;
  }
}

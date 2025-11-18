/**
 * @file `ps-rooms.d.ts` - Adapted from `pokemon-showdown-client/play.pokemonshowdown.com/src/panel-rooms.tsx`.
 * @author Keith Choison <keith@tize.io>
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @author Adam Tran <aviettran@gmail.com>
 * @license MIT
 * @since 1.3.0
 */

/* eslint-disable max-classes-per-file */

declare namespace Showdown {
  class RoomsRoom extends PSRoom {
    public override readonly classType = 'rooms' as const;
  }

  type RoomsSection = [string, RoomInfo[]];

  class RoomsPanel extends PSRoomPanel<RoomsRoom> {
    public static readonly id = 'rooms' as const;
    public static readonly routes = ['rooms'] as const;
    public static readonly Model = RoomsRoom as const;
    public static readonly location = 'right' as const;
    public static readonly icon: JSX.Element;
    public static readonly title = 'Chat Rooms' as const;

    public hidden = false;
    public search = '';
    public section = '';
    public lastKeyCode = 0;
    public roomList: RoomsSection[] = [];
    public roomListFocusIndex = -1;
    public roomListLength = 0;

    public hide: (event: Event) => void;
    public changeSearch: (event: Event) => void;
    public changeSection: (event: Event) => void;
    public handleOnBlur: (event: Event) => void;
    public keyDownSearch: (event: KeyboardEvent) => void;

    public updateRoomList(search?: string): void;
    public getRoomList(forceNoAutocomplete?: boolean): RoomsSection[];
    public getRoomListFocusTitle(): string;
    public renderRoomList(): JSX.Element;
  }
}

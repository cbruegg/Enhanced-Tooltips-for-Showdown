/**
 * @file `ps-main-menu.d.ts` - Adapted from `pokemon-showdown-client/play.pokemonshowdown.com/src/panel-mainmenu.ts`.
 * @author Keith Choison <keith@tize.io>
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 * @since 1.3.0
 */

/* eslint-disable max-classes-per-file */

declare namespace Showdown {
  class MainMenuRoom extends PSRoom {
    public override readonly classType = 'mainmenu';
    public userdetailsCache: {
      [userid: string]: {
        userid: ID;
        name: string;
        avatar?: string | number;
        status?: string;
        group?: string;
        customgroup?: string;
        rooms?: {
          [roomid: string]: {
            isPrivate?: boolean;
            p1?: string;
            p2?: string;
          };
        };
      };
    } = {};
    public roomsCache: {
      battleCount?: number;
      userCount?: number;
      chat?: RoomInfo[];
      sectionTitles?: string[];
    } = {};
    public searchCountdown?: {
      format: string;
      packedTeam: string;
      countdown: number;
      timer: number;
    } = null;
    /** Tracks the moment between "search sent" & "server acknowledged the sent search." */
    public searchSent = false;
    public search: {
      searching: string[];
      games?: Record<RoomID, string>;
    } = { searching: [], games: null };
    public disallowSpectators?: boolean = null;
    public lastChallenged?: number = null;

    public startSearch: (format: string, team?: Team) => void;
    public cancelSearch: () => boolean;
    public doSearchCountdown: () => void;
    public doSearch: (search: NonNullable<typeof this.searchCountdown>) => void;

    public adjustPrivacy(): string;
    public receiveChallenges(dataBuf: string): void;
    public receiveSearch(dataBuf: string): void;
    public parseFormats(formatsList: string[]): void;
    public handlePM(user1: string, user2: string, message?: string): void;
    public handleQueryResponse(id: ID, response: unknown): void;
  }

  class MainMenuPanel extends PSRoomPanel<MainMenuRoom> {
    public static readonly id = 'mainmenu';
    public static readonly routes = [''];
    public static readonly Model = MainMenuRoom;
    public static readonly icon: JSX.Element;

    public submitSearch: (event: Event, format: string, team?: Team) => void;
    public handleDragStart: (event: DragEvent) => void;
    public handleDragEnter: (event: DragEvent) => void;
    public handleClickMinimize: (event: MouseEvent) => void;

    public renderMiniRoom(room: PSRoom): JSX.Element;
    public renderMiniRooms(): JSX.Element;
    public renderGames(): JSX.Element;
    public renderSearchButton(): JSX.Element;
  }
}

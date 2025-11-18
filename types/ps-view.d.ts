/**
 * @file `ps-view.d.ts` - Adapted from `pokemon-showdown-client/play.pokemonshowdown.com/src/panels.tsx`.
 * @author Keith Choison <keith@tize.io>
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 * @since 1.3.0
 */

/* eslint-disable react/prefer-stateless-function, react/no-unused-class-component-methods */

declare namespace Showdown {
  class PSView extends React.Component {
    public static readonly isIOS: boolean;
    public static readonly isChrome: boolean;
    public static readonly isSafari: boolean;
    public static readonly isFirefox: boolean;
    public static readonly isMac: boolean;
    public static textboxFocused = false;
    public static dragend?: (event: DragEvent) => void = null;
    /** Whether the last `ClickEvent` was a tap for use as a mobile/desktop heuristic. */
    public static hasTapped = false;
    /** "mode where the tabbar is opened rather than always being there" o_O */
    public static narrowMode = false;
    public static verticalHeaderWidth: number;
    public static focusIfNoSelection: (event: MouseEvent) => void;

    public handleClickOverlay: (event: MouseEvent) => void;

    public static setTextboxFocused(focused: boolean): void;
    public static verticalFocusPreview(): string;
    public static focusPreview(room: PSRoom): string;
    public static scrollToHeader(): void;
    public static scrollToRoom(): void;
    public static containingRoomid(element: HTMLElement): RoomID;
    public static isEmptyClick(event: MouseEvent): false | void;
    public static posStyle(room: PSRoom): React.CSSProperties;
    public static getPopupStyle(room: PSRoom, width?: number | 'auto', fullSize?: boolean): React.CSSProperties;

    public handleButtonClick(element: HTMLButtomElement): boolean;
    public renderRoom(room: PSRoom): JSX.Element;
    public renderPopup(room: PSRoom): JSX.Element;
  }

  /** Adapted from `pokemon-showdown-client/play.pokemonshowdown.com/src/panel-teamdropdown.tsx`. */
  type SelectType =
    | 'challenge'
    | 'search'
    | 'teambuilder'
    | 'tournament';
}

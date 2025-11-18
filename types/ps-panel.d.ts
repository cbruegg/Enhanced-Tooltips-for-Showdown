/**
 * @file `ps-panel.d.ts` - Adapted from `pokemon-showdown-client/play.pokemonshowdown.com/src/panels.tsx`.
 * @author Keith Choison <keith@tize.io>
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 * @since 1.3.0
 */

/* eslint-disable max-classes-per-file, react/prefer-stateless-function, react/no-unused-class-component-methods */

declare namespace Showdown {
  interface PSRoomPanelProps<TRoom extends PSRoom = PSRoom> {
    room: TRoom;
  }

  class PSRoomPanel<TRoom extends PSRoom = PSRoom> extends Preact.Component<PSRoomPanelProps<TRoom>> {
    public subscriptions: PSSubscription[] = [];
    public justUpdatedDimenions = false;

    public subscribeTo<T>(
      model: PSModel<T> | PSStreamModel<T>,
      callback: (value: T) => void,
    ): PSSubscription;
    public updateDimensions(): void;
    public close(): void;
    public receiveLine(args: Args): void;
    /**
     * PS has "fake select menus," i.e., buttons that act like HTML `<select>` dropdowns.
     *
     * * This function is used by the popups they open to change the button values.
     */
    public chooseParentValue(value: string): void;
    public focus(): void;
    public render(): Preact.VNode;
  }

  type PSRoomPanelSubclass<TRoom extends PSRoom = PSRoom> = (new () => PSRoomPanel<TRoom>) & {
    readonly id: string;
    readonly routes: string[];
    /** Optional `PSRoom` class. */
    readonly Model?: new (options: RoomOptions) => TRoom;
    readonly location?: PSRoomLocation;
    /** Whether this room's `id` should be in the URL. */
    noURL?: boolean;
    icon?: Showdown.Preact.VNode;
    title?: string;
    handleDrop?: (event: DragEvent) => boolean | void;
  };

  interface PSPanelWrapperProps {
    room: PSRoom;
    focusClick?: boolean;
    scrollable?: boolean | 'hidden';
    width?: number | 'auto';
    fullSize?: boolean;
    children?: React.ReactNode;
    onDragEnter?: (event: DragEvent) => void;
  }

  type PSPanelWrapper = Preact.FunctionalComponent<PSPanelWrapperProps>;
}

/**
 * @file `client-room.d.ts` - Provides generic Room typings for the live PS client running on Backbone.js.
 * @author Keith Choison <keith@tize.io>
 * @since 0.1.0
 */

declare namespace Showdown {
  type ClientRoomPosition =
    | 'left'
    | 'right'
    | 'full';

  type ClientRoomType =
    | 'html'
    | 'battle'
    | 'battles'
    | 'chat'
    | 'rooms';

  class ClientRoom {
    public id: string;
    public cid: string;
    public type: ClientRoomType;
    public title?: string;
    public className = 'ps-room';
    public el: HTMLElement;
    public $el: JQuery<HTMLElement>;
    public events: Record<string, string> = {};
    public minWidth?: number;
    public minMainWidth?: number;
    public maxWidth?: number;
    public leftWidth?: number;
    public bestWidth = 659;
    public isSideRoom = false;
    public notificationClass = '';
    public notifications: Record<string, Notification> = {};
    public subtleNotification = false;
    /** Timestamp (in ms) of the last update since the Unix epoch. */
    public lastUpdate?: number;

    public dispatchClickButton(event: Event): void;
    public dispatchClickBackground(event: Event): void;
    public send(data: string): void;
    public receive(data: string): void;
    public show(position: ClientRoomPosition, leftWidth: number): void;
    public hide(): void;
    public focus(): void;
    public blur(): void;
    public join(): void;
    public leave(): void;
    public requestLeave(e?: Event): boolean;
    public requestNotifications(): void;
    public notify(title: string, body: string, tag?: string, once?: boolean): void;
    public subtleNotifyOnce(): void;
    public notifyOnce(title: string, body: string, tag?: string): void;
    public closeNotification(tag?: string, alreadyClosed?: boolean): void;
    public closeAllNotifications(skipUpdate?: boolean): void;
    public dismissNotification(tag?: string): void;
    public dismissAllNotifcations(skipUpdate?: boolean): void;
    public clickNotification(tag?: string): void;
    public updateLayout(): void;
    public close(): void;
    public destroy(alreadyLeft?: boolean): void;
  }
}

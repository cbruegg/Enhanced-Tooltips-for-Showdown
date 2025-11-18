/**
 * @file `BootdexClassicBootstrappable.ts`
 * @author Keith Choison <keith@tize.io>
 * @since 1.3.0
 */

import { logger, wtf } from '@showdex/utils/debug';
import { detectClassicHost } from '@showdex/utils/host';
import { BootdexBootstrappable } from './BootdexBootstrappable';
import { BootdexClassicAdapter } from './BootdexClassicAdapter';

export interface BootdexClassicHtmlRoomOptions {
  /**
   * Whether to create a side-room, which will appear on the right in left-right panel mode.
   *
   * @since 1.1.1
   */
  side?: boolean;

  /**
   * Optional *Font Awesome* icon name to display inside the tab.
   *
   * * Don't include the `'fa-'` prefix.
   *
   * @example
   * ```ts
   * 'calculator'
   * ```
   * @since 0.1.3
   */
  icon?: string;

  /**
   * Whether to focus the room once created.
   *
   * @since 0.1.0
   */
  focus?: boolean;

  /**
   * Minimum width of the room, in **pixels**, presumably.
   *
   * @default 320
   * @since 1.0.5
   */
  minWidth?: number;

  /**
   * Maxmimum width of the room, in **pixels**, presumably.
   *
   * @default 1024
   * @since 1.0.5
   */
  maxWidth?: number;
}

const l = logger('@showdex/pages/Bootdex/BootdexClassicBootstrappable');

export abstract class BootdexClassicBootstrappable extends BootdexBootstrappable {
  public static override readonly scope = l.scope;
  public static override readonly Adapter = BootdexClassicAdapter;

  public static override hasSinglePanel: typeof BootdexBootstrappable.hasSinglePanel = () => detectClassicHost(window) && (
    (window.app.curRoom?.id?.startsWith('battle-') && $?.(window).width() < 1275)
      || window.Dex?.prefs?.('onepanel')
  );

  public static override openUserPopup: typeof BootdexBootstrappable.openUserPopup = (username) => {
    if (!detectClassicHost(window) || typeof window.app.addPopup !== 'function') {
      return void l.error(
        'Can\'t open the UserPopup for', username, 'since one of the following globals isn\'t available!',
        '\n', 'window.app.addPopup()', '(typeof)', wtf(window.app?.addPopup), // eslint-disable-line @typescript-eslint/unbound-method
        '\n', 'window.UserPopup', '(typeof)', wtf((window as unknown as Showdown.ClientGlobals).UserPopup),
      );
    }

    window.app.addPopup(window.UserPopup, {
      name: username,
    });
  };

  public static override openBattlesRoom: typeof BootdexBootstrappable.openBattlesRoom = () => {
    if (!detectClassicHost(window)) {
      return;
    }

    window.app.joinRoom('battles', 'battles');
  };

  public static override acceptBattleOts: typeof BootdexBootstrappable.acceptBattleOts = (battleId) => {
    if (!detectClassicHost(window) || !battleId) {
      return;
    }

    window.app.send('/acceptopenteamsheets', battleId);
  };

  /**
   * Abstraction that creates an `ClientHtmlRoom` in the `'classic'` Showdown client.
   *
   * * As of v1.1.0, this has been renamed from `createSideRoom()` since there's a Calcdex setting to open rooms on the left now
   *   (i.e., just regular rooms, not side-rooms).
   * * As of v1.3.0, this is now inside the `BootdexClassicBootstrappable` to keep logic separate from those used for
   *   the rewritten `'preact'` Showdown client.
   *
   * @since 0.1.0
   */
  public static createHtmlRoom(
    this: void,
    roomId: string,
    title: string,
    options?: BootdexClassicHtmlRoomOptions,
  ): Showdown.ClientHtmlRoom {
    if (!detectClassicHost(window) || typeof window.app?._addRoom !== 'function') {
      l.error(
        `Cannot make a ${options?.side ? 'side-' : ''}room since app._addRoom() isn't available!`,
        '\n', 'window.app._addRoom()', '(typeof)', wtf(window.app?._addRoom), // eslint-disable-line @typescript-eslint/unbound-method
      );

      return null;
    }

    const {
      side,
      icon,
      focus,
      minWidth = 320,
      maxWidth = 1024,
    } = options || {};

    let room: Showdown.ClientHtmlRoom = null;

    if (roomId in window.app.rooms) {
      room = window.app.rooms[roomId] as typeof room;

      // l.debug(`Found existing ${side ? 'side-' : ''}room w/ matching room.id`, roomId);
    } else {
      // create a new room (will add the new room to the app.roomList[] array)
      room = window.app._addRoom<typeof room>(roomId, 'html', true, title);

      // remove the initial "Page unavailable" HTML
      room.$el.html('');

      // if this is a `side` room, add the `room` to the sideRoomList[] (also in the app.rooms object)
      if (side) {
        room.isSideRoom = true;
        window.app.sideRoomList.push(window.app.roomList.pop());
      }

      // l.debug(`Created ${side ? 'side-' : ''}room w/ room.id`, room.id, '& room.type', room.type);
    }

    if (!room?.el) {
      l.error(`Couldn\'t find or make the ${side ? 'side-' : ''}room w/ room.id`, roomId);

      return room;
    }

    room.minWidth = minWidth;
    room.maxWidth = maxWidth;

    if (icon) {
      // hook directly into renderRoomTab(), which is hacky as hell, but necessary since it gets called pretty frequently
      // (using jQuery to edit the class names isn't viable since the icon will just get replaced again)
      const originalRenderer = window.app.topbar.renderRoomTab.bind(window.app.topbar) as typeof window.app.topbar.renderRoomTab;

      window.app.topbar.renderRoomTab = function renderCustomRoomTab(appRoom, appRoomId) {
        const rid = appRoom?.id || appRoomId;
        const buf = originalRenderer(appRoom, appRoomId);

        // set the custom icon for the current room only
        // (note: only ClientHtmlRoom's get the 'fa-file-text-o' [Font Awesome Outlined File Text] icon)
        if (rid === roomId) {
          return buf.replace('fa-file-text-o', `fa-${icon}`);
        }

        return buf;
      };
    }

    if (focus) {
      window.app[side ? 'focusRoomRight' : 'focusRoom'](room.id);
    }

    window.app.topbar.updateTabbar();

    return room;
  }
}

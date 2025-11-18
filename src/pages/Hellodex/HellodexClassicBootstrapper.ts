/**
 * @file `HellodexClassicBootstrapper.ts`
 * @author Keith Choison <keith@tize.io>
 * @since 1.3.0
 */

import * as ReactDOM from 'react-dom/client';
import { env, nonEmptyObject } from '@showdex/utils/core';
import { logger, wtf } from '@showdex/utils/debug';
import { detectClassicHost } from '@showdex/utils/host';
import { BootdexClassicBootstrappable } from '../Bootdex/BootdexClassicBootstrappable';
import { HellodexDomRenderer } from './HellodexRenderer';

const l = logger('@showdex/pages/Hellodex/HellodexClassicBootstrapper');

export class HellodexClassicBootstrapper extends BootdexClassicBootstrappable {
  public static override readonly scope = l.scope;

  /**
   * Returns the Hellodex's Showdown room ID, which is hardcoded & doesn't change based on args.
   *
   * * Could've been just a `const`, but in keeping with the APIs of the other rooms (e.g., `getCalcdexRoomId()`),
   *   this is needlessly a `function` instead.
   * * ligma
   *
   * @since 1.2.3
   */
  public static getHellodexRoomId() {
    return 'view-hellodex' as const;
  }

  /**
   * Creates a `Showdown.ClientHtmlRoom` via the `BootdexClassicBootstrappable`'s `createHtmlRoom()` that's specially made
   * to house a `Hellodex`.
   *
   * * Essentially exists to keep all the properties like the room name & icon consistent.
   * * Auto-focuses the room once created, but this behavior can be disabled if `focusRoomsRoom` of the user's
   *   `ShowdexHellodexSettings` is `true`.
   * * Creates a `ReactDOM.Root` from the `Showdown.HtmlRoom`'s `el` (`HTMLDivElement`), accessible under the `reactRoot` property.
   *   - When this room's `requestLeave()` is called (typically by `app.leaveRoom()` or the user closing the tab),
   *     `reactRoot.unmount()` will be automatically called.
   * * As of v1.3.0, this is now inside the `HellodexClassicBootstrapper` to keep logic separate from those used for the
   *   rewritten `'preact'` Showdown client.
   *   - As a result, the Redux `store` is no longer a function argument.
   *
   * @since 1.1.5
   */
  public static createHellodexRoom(
    focus?: boolean,
  ): Showdown.ClientHtmlRoom {
    if (!detectClassicHost(window)) {
      return null;
    }

    const { rootState } = this.Adapter;
    const { hellodex: settings } = rootState?.showdex?.settings || {};
    const shouldFocus = focus || !settings?.focusRoomsRoom;

    const hellodexRoom = this.createHtmlRoom(this.getHellodexRoomId(), 'Hellodex', {
      side: true,
      icon: Math.random() > 0.5 ? 'smile-o' : 'heart',
      focus: shouldFocus,
    });

    if (!hellodexRoom?.el) {
      return hellodexRoom;
    }

    hellodexRoom.reactRoot = ReactDOM.createRoot(hellodexRoom.el);

    // override the requestLeave() handler to unmount the reactRoot
    hellodexRoom.requestLeave = () => {
      // unmount the reactRoot we created earlier
      hellodexRoom.reactRoot?.unmount?.();

      // actually leave the room
      return true;
    };

    return hellodexRoom;
  }

  protected override startTimer(): void {
    super.startTimer(HellodexClassicBootstrapper.scope);
  }

  protected renderHellodex(dom: ReactDOM.Root): void { // eslint-disable-line class-methods-use-this
    if (!detectClassicHost(window) || !dom) {
      return;
    }

    const {
      Adapter,
      Manager,
      openUserPopup,
      openBattlesRoom,
    } = HellodexClassicBootstrapper as unknown as typeof BootdexClassicBootstrappable;

    HellodexDomRenderer(dom, {
      store: Adapter.store,
      onUserPopup: openUserPopup,
      onRequestBattles: openBattlesRoom,
      onRequestCalcdex: (id) => void Manager?.openCalcdex(id),
      onRequestHonkdex: (id) => void Manager?.openHonkdex(id),
      onRequestNotedex: (id) => void Manager?.openNotedex(id),
      onCloseCalcdex: (id) => void Manager?.closeCalcdex(id),
      onRemoveHonkdex: (id) => void Manager?.destroyHonkdex(id),
      onRemoveNotedex: (id) => void Manager?.destroyNotedex(id),
    });
  }

  /**
   * Opens the existing Hellodex tab or creates a new one.
   *
   * * New Hellodex instances will only be created if the user isn't currently in the Hellodex room, whether it was left
   *   prior or disabled in the settings.
   *
   * @since 1.2.3
   */
  public open(): void {
    if (!detectClassicHost(window)) {
      return;
    }

    const hellodexRoomId = HellodexClassicBootstrapper.getHellodexRoomId();

    if (hellodexRoomId in window.app.rooms) {
      return void window.app.focusRoomRight(hellodexRoomId);
    }

    const hellodexRoom = HellodexClassicBootstrapper.createHellodexRoom();

    if (!hellodexRoom?.reactRoot) {
      l.error(
        'ReactDOM root hasn\'t been properly initialized by createHellodexRoom();',
        'something is horribly wrong here!',
        '\n', 'hellodexRoom', '(id)', hellodexRoomId, '(typeof)', wtf(hellodexRoom), '(now)', hellodexRoom,
        '\n', 'reactRoot', '(typeof)', wtf(hellodexRoom?.reactRoot), '(now)', hellodexRoom?.reactRoot,
      );

      return;
    }

    this.renderHellodex(hellodexRoom.reactRoot);
  }

  public close(): void { // eslint-disable-line class-methods-use-this
    if (!detectClassicHost(window) || !nonEmptyObject(window.app?.rooms)) {
      return;
    }

    const hellodexRoomId = HellodexClassicBootstrapper.getHellodexRoomId();

    if (!(hellodexRoomId in window.app.rooms)) {
      return;
    }

    window.app.leaveRoom(hellodexRoomId);
  }

  public destroy(): void { // eslint-disable-line class-methods-use-this
    l.warn('one does not simply destroy() a Hellodex');
  }

  public run(): void {
    if (!detectClassicHost(window)) {
      return;
    }

    this.startTimer();

    l.silly(
      'Hellodex classic bootstrapper was invoked;',
      'determining if there\'s anything to do...',
    );

    if (!env.bool('hellodex-enabled')) {
      l.debug(
        'Hellodex classic bootstrap request was ignored',
        'since it has been disabled by the environment.',
      );

      return void this.endTimer('(hellodex denied)');
    }

    this.open();
    this.endTimer('(bootstrap complete)');
  }
}

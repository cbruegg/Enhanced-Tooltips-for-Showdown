/**
 * @file `NotedexClassicBootstrapper.ts`
 * @author Keith Choison <keith@tize.io>
 * @since 1.3.0
 */

import * as ReactDOM from 'react-dom/client';
import { env } from '@showdex/utils/core';
import { logger } from '@showdex/utils/debug';
import { detectClassicHost } from '@showdex/utils/host';
import { BootdexClassicBootstrappable } from '../Bootdex/BootdexClassicBootstrappable';
import { MixinNotedexBootstrappable } from './NotedexBootstrappable';
import { NotedexDomRenderer } from './NotedexRenderer';

const l = logger('@showdex/pages/Notedex/NotedexClassicBootstrapper');

export class NotedexClassicBootstrapper extends MixinNotedexBootstrappable(BootdexClassicBootstrappable) {
  public static override readonly scope = l.scope;

  public static getNotedexRoomId(
    this: void,
    instanceId: string,
  ): `view-notedex-${string}` {
    return `view-notedex-${instanceId}`;
  }

  public static createNotedexRoom(
    instanceId: string,
    focus?: boolean,
  ): Showdown.ClientHtmlRoom {
    if (!detectClassicHost(window)) {
      return null;
    }

    const { createHtmlRoom } = this as unknown as typeof BootdexClassicBootstrappable;
    const notedexRoom = createHtmlRoom(this.getNotedexRoomId(instanceId), 'Notedex', {
      side: true,
      icon: 'sticky-note',
      focus,
    });

    if (!notedexRoom?.el) {
      return null;
    }

    notedexRoom.reactRoot = ReactDOM.createRoot(notedexRoom.el);

    return notedexRoom;
  }

  public get roomId() {
    return NotedexClassicBootstrapper.getNotedexRoomId(this.instanceId);
  }

  public get room() {
    return window.app.rooms?.[this.roomId] as ReturnType<typeof NotedexClassicBootstrapper.createNotedexRoom>;
  }

  protected renderNotedex(dom: ReactDOM.Root): void {
    if (!detectClassicHost(window) || !this.instanceId || !dom) {
      return;
    }

    const { Adapter, getNotedexRoomId } = NotedexClassicBootstrapper;

    NotedexDomRenderer(dom, {
      store: Adapter?.store,
      instanceId: this.instanceId,
      onLeaveRoom: () => void window.app.leaveRoom(getNotedexRoomId(this.instanceId)),
    });
  }

  public open(): void {
    if (!detectClassicHost(window) || !this.instanceId || !this.roomId) {
      return;
    }

    if (this.room?.id) {
      return void window.app.focusRoomRight(this.roomId);
    }

    const notedexRoom = NotedexClassicBootstrapper.createNotedexRoom(this.instanceId, true);

    this.prepare();
    this.renderNotedex(notedexRoom.reactRoot);
  }

  public close(): void {
    if (!detectClassicHost(window) || !this.room?.id) {
      return;
    }

    window.app.leaveRoom(this.roomId);
  }

  public override destroy(): void {
    if (!detectClassicHost(window) || !this.instanceId) {
      return;
    }

    this.room?.reactRoot?.unmount?.();
    super.destroy();
  }

  public override run(): void { // eslint-disable-line class-methods-use-this
    this.startTimer();

    if (!detectClassicHost(window)) {
      return void this.endTimer('(bad classic)', window.__SHOWDEX_HOST);
    }

    l.silly(
      'Notedex classic bootstrapper was invoked;',
      'determining if there\'s anything to do...',
    );

    if (!env.bool('notedex-enabled')) {
      l.debug(
        'Notedex classic bootstrap request was ignored',
        'since it has been disabled by the environment.',
      );

      return void this.endTimer('(notedex denied)');
    }

    this.endTimer('(bootstrap complete)');
  }
}

/**
 * @file `DevdexClassicBootstrapper.ts`
 * @author Keith Choison <keith@tize.io>
 * @since 1.2.5
 */

import * as ReactDOM from 'react-dom/client';
import { env } from '@showdex/utils/core';
import { logger } from '@showdex/utils/debug';
import { detectClassicHost } from '@showdex/utils/host';
import { BootdexClassicBootstrappable } from '../Bootdex/BootdexClassicBootstrappable';
import { DevdexDomRenderer } from './DevdexRenderer';

const l = logger('@showdex/pages/Devdex/DevdexClassicBootstrapper');

/**
 * Classic (backbone.js client) bootstrapper for the singleton Devdex panel.
 *
 * Mirrors `NotedexClassicBootstrapper`, but Devdex is a fixed singleton — no `instanceId`, no redux
 * slice, no `prepare()` — so the room id is the constant `view-devdex`.
 *
 * @since 1.2.5
 */
export class DevdexClassicBootstrapper extends BootdexClassicBootstrappable {
  public static override readonly scope = l.scope;

  public static readonly devdexRoomId = 'view-devdex';

  public static createDevdexRoom(
    focus?: boolean,
  ): Showdown.ClientHtmlRoom {
    if (!detectClassicHost(window)) {
      return null;
    }

    const { createHtmlRoom } = this as unknown as typeof BootdexClassicBootstrappable;
    const devdexRoom = createHtmlRoom(DevdexClassicBootstrapper.devdexRoomId, 'Devdex', {
      side: true,
      icon: 'terminal',
      focus,
    });

    if (!devdexRoom?.el) {
      return null;
    }

    devdexRoom.reactRoot = ReactDOM.createRoot(devdexRoom.el);

    return devdexRoom;
  }

  public readonly roomId = DevdexClassicBootstrapper.devdexRoomId;

  public get room() {
    return window.app.rooms?.[this.roomId] as ReturnType<typeof DevdexClassicBootstrapper.createDevdexRoom>;
  }

  protected renderDevdex(dom: ReactDOM.Root): void {
    if (!detectClassicHost(window) || !dom) {
      return;
    }

    DevdexDomRenderer(dom, {
      store: DevdexClassicBootstrapper.Adapter?.store,
      onLeaveRoom: () => void window.app.leaveRoom(this.roomId),
    });
  }

  public open(): void {
    if (!detectClassicHost(window) || !this.roomId) {
      return;
    }

    if (this.room?.id) {
      return void window.app.focusRoomRight(this.roomId);
    }

    const devdexRoom = DevdexClassicBootstrapper.createDevdexRoom(true);

    this.renderDevdex(devdexRoom?.reactRoot);
  }

  public close(): void {
    if (!detectClassicHost(window) || !this.room?.id) {
      return;
    }

    window.app.leaveRoom(this.roomId);
  }

  public destroy(): void {
    if (!detectClassicHost(window)) {
      return;
    }

    this.room?.reactRoot?.unmount?.();
  }

  public override run(): void { // eslint-disable-line class-methods-use-this
    this.startTimer();

    if (!detectClassicHost(window)) {
      return void this.endTimer('(bad classic)', window.__SHOWDEX_HOST);
    }

    l.silly(
      'Devdex classic bootstrapper was invoked;',
      'determining if there\'s anything to do...',
    );

    if (!env.bool('teledex-enabled')) {
      l.debug(
        'Devdex classic bootstrap request was ignored',
        'since teledex has been disabled by the environment.',
      );

      return void this.endTimer('(devdex denied)');
    }

    this.endTimer('(bootstrap complete)');
  }
}

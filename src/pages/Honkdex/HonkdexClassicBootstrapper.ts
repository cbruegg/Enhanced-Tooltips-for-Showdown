/**
 * @file `HonkdexClassicBootstrapper.ts`
 * @author Keith Choison <keith@tize.io>
 * @since 1.3.0
 */

import * as ReactDOM from 'react-dom/client';
import { logger } from '@showdex/utils/debug';
import { detectClassicHost } from '@showdex/utils/host';
import { BootdexClassicBootstrappable } from '../Bootdex/BootdexClassicBootstrappable';
import { MixinHonkdexBootstrappable } from './HonkdexBootstrappable';
import { HonkdexDomRenderer } from './HonkdexRenderer';

const l = logger('@showdex/pages/Honkdex/HonkdexClassicBootstrapper');

export class HonkdexClassicBootstrapper extends MixinHonkdexBootstrappable(BootdexClassicBootstrappable) {
  public static override readonly scope = l.scope;

  public static getHonkdexRoomId(
    this: void,
    instanceId: string,
  ): `view-honkdex-${string}` {
    return `view-honkdex-${instanceId}`;
  }

  /**
   * Creates a `Showdown.ClientHtmlRoom` via the `BootdexClassicBootstraappable`'s `createHtmlRoom()` that's specially made
   * to house a `Honkdex`.
   *
   * * honk honk
   *
   * @since 1.2.0
   */
  public static createHonkdexRoom(
    instanceId: string,
    focus?: boolean,
  ): Showdown.ClientHtmlRoom {
    if (!detectClassicHost(window)) {
      return null;
    }

    const { createHtmlRoom } = this as unknown as typeof BootdexClassicBootstrappable;
    const honkdexRoom = createHtmlRoom(this.getHonkdexRoomId(instanceId), 'Honkdex', {
      side: true,
      icon: 'car',
      focus,
    });

    if (!honkdexRoom?.el) {
      return null;
    }

    honkdexRoom.reactRoot = ReactDOM.createRoot(honkdexRoom.el);

    return honkdexRoom;
  }

  public get roomId() {
    return HonkdexClassicBootstrapper.getHonkdexRoomId(this.instanceId);
  }

  public get room() {
    return window.app.rooms?.[this.roomId] as ReturnType<typeof HonkdexClassicBootstrapper.createHonkdexRoom>;
  }

  protected renderHonkdex(dom: ReactDOM.Root): void {
    if (!detectClassicHost(window) || !this.instanceId || !dom) {
      return;
    }

    const { Adapter, Manager, getHonkdexRoomId } = HonkdexClassicBootstrapper;

    HonkdexDomRenderer(dom, {
      store: Adapter?.store,
      instanceId: this.instanceId,
      onRequestHellodex: () => void Manager?.openHellodex(),
      onRequestHonkdex: (...argv) => void Manager?.openHonkdex(...argv),
      onLeaveRoom: () => void window.app.leaveRoom(getHonkdexRoomId(this.instanceId)),
    });
  }

  public open(): void {
    if (!detectClassicHost(window) || !this.instanceId || !this.roomId) {
      return;
    }

    if (this.room?.id) {
      return void window.app.focusRoomRight(this.roomId);
    }

    const honkdexRoom = HonkdexClassicBootstrapper.createHonkdexRoom(this.instanceId, true);

    this.prepare();
    this.renderHonkdex(honkdexRoom.reactRoot);
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
    super.destroy(); // o_O !! not as cool as it sounds tho
  }

  public run(): void { // eslint-disable-line class-methods-use-this
    if (!detectClassicHost(window)) {
      throw new Error('HonkdexClassicBootstrapper can only be run in the classic Showdown Backbone.js client!');
    }
  }
}

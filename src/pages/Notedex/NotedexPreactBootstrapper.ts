/**
 * @file `NotedexPreactBootstrapper.ts`
 * @author Keith Choison <keith@tize.io>
 * @since 1.3.0
 */

import { notedexSlice } from '@showdex/redux/store';
import { env } from '@showdex/utils/core';
import { logger } from '@showdex/utils/debug';
import { detectPreactHost } from '@showdex/utils/host';
import { BootdexPreactBootstrappable } from '../Bootdex/BootdexPreactBootstrappable';
import { MixinNotedexBootstrappable } from './NotedexBootstrappable';
import { NotedexPreactPanel } from './NotedexPreactPanel';

const l = logger('@showdex/pages/Notedex/NotedexPreactBootstrapper');

export class NotedexPreactBootstrapper extends MixinNotedexBootstrappable(BootdexPreactBootstrappable) {
  public static override readonly scope = l.scope;

  public readonly roomId: Showdown.RoomID;

  public constructor(instanceId?: string) {
    super(instanceId);

    this.roomId = `notedex-${this.instanceId}` as Showdown.RoomID;
  }

  protected override startTimer(): void {
    super.startTimer(NotedexPreactBootstrapper.scope);
  }

  public open(): void {
    if (!detectPreactHost(window) || !this.roomId) {
      return;
    }

    if (window.PS.rooms[this.roomId] && window.PS.room?.id !== this.roomId) {
      return void window.PS.focusRoom(this.roomId);
    }

    this.prepare();
    window.PS.join(this.roomId);
  }

  public close(): void {
    if (!detectPreactHost(window) || !this.roomId) {
      return;
    }

    window.PS.leave(this.roomId);
  }

  public destroy(): void {
    if (!detectPreactHost(window) || !this.instanceId) {
      return;
    }

    const { store } = NotedexPreactBootstrapper.Adapter;

    this.close();
    store.dispatch(notedexSlice.actions.destroy({
      scope: l.scope,
      id: this.instanceId,
    }));
  }

  public run(): void {
    this.startTimer();

    if (!detectPreactHost(window)) {
      return void this.endTimer('(bad preact)', window.__SHOWDEX_HOST);
    }

    l.silly(
      'Notedex Preact bootstrapper was invoked;',
      'determining if there\'s anything to do...',
    );

    if (!env.bool('notedex-enabled')) {
      l.debug(
        'Notedex Preact bootstrap request was ignored',
        'since it has been disabled by the environment.',
      );

      return void this.endTimer('(notedex denied)');
    }

    l.debug('Adding the NotedexPreactPanel to the PS.roomTypes...');
    window.PS.addRoomType(NotedexPreactPanel);

    this.endTimer('(notedex enabled)');
  }
}

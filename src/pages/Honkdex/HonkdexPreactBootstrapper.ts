/**
 * @file `HonkdexPreactBootstrapper.ts`
 * @author Keith Choison <keith@tize.io>
 * @since 1.3.0
 */

import { type GenerationNum } from '@smogon/calc';
import { calcdexSlice } from '@showdex/redux/store';
import { logger } from '@showdex/utils/debug';
import { detectPreactHost } from '@showdex/utils/host';
import { BootdexPreactBootstrappable } from '../Bootdex/BootdexPreactBootstrappable';
import { MixinHonkdexBootstrappable } from './HonkdexBootstrappable';
import { HonkdexPreactPanel } from './HonkdexPreactPanel';

const l = logger('@showdex/pages/Honkdex/HonkdexPreactBootstrapper');

export class HonkdexPreactBootstrapper extends MixinHonkdexBootstrappable(BootdexPreactBootstrappable) {
  public static override readonly scope = l.scope;

  public readonly roomId: Showdown.RoomID;

  public constructor(instanceId?: string, gen?: GenerationNum, format?: string) {
    super(instanceId, gen, format);

    if (!this.instanceId) {
      return;
    }

    this.roomId = `honkdex-${this.instanceId}` as Showdown.RoomID;
  }

  protected override startTimer(): void {
    super.startTimer(HonkdexPreactBootstrapper.scope);
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

    const { store } = HonkdexPreactBootstrapper.Adapter;

    this.close();
    store.dispatch(calcdexSlice.actions.destroy(this.instanceId));
  }

  public run(): void {
    this.startTimer();

    if (!detectPreactHost(window)) {
      return void this.endTimer('(bad preact)', window.__SHOWDEX_HOST);
    }

    l.silly(
      'Honkdex Preact bootstrapper was invoked;',
      'determining if there\'s anything to do...',
    );

    l.debug('Adding the HonkdexPreactPanel to the PS.roomTypes...');
    window.PS.addRoomType(HonkdexPreactPanel);

    this.endTimer('(honkdex enabled)');
  }
}

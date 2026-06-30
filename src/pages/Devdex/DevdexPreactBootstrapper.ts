/**
 * @file `DevdexPreactBootstrapper.ts`
 * @author Keith Choison <keith@tize.io>
 * @since 1.2.5
 */

import { env } from '@showdex/utils/core';
import { logger } from '@showdex/utils/debug';
import { detectPreactHost } from '@showdex/utils/host';
import { BootdexPreactBootstrappable } from '../Bootdex/BootdexPreactBootstrappable';
import { DevdexPreactPanel } from './DevdexPreactPanel';

const l = logger('@showdex/pages/Devdex/DevdexPreactBootstrapper');

export class DevdexPreactBootstrapper extends BootdexPreactBootstrappable {
  public static override readonly scope = l.scope;

  public readonly roomId = 'devdex' as Showdown.RoomID;

  protected override startTimer(): void {
    super.startTimer(DevdexPreactBootstrapper.scope);
  }

  public open(): void {
    if (!detectPreactHost(window)) {
      return;
    }

    if (window.PS.rooms[this.roomId] && window.PS.room?.id !== this.roomId) {
      return void window.PS.focusRoom(this.roomId);
    }

    window.PS.join(this.roomId);
  }

  public close(): void {
    if (!detectPreactHost(window)) {
      return;
    }

    window.PS.leave(this.roomId);
  }

  public destroy(): void {
    this.close();
  }

  public run(): void {
    this.startTimer();

    if (!detectPreactHost(window)) {
      return void this.endTimer('(bad preact)', window.__SHOWDEX_HOST);
    }

    l.silly(
      'Devdex Preact bootstrapper was invoked;',
      'determining if there\'s anything to do...',
    );

    if (!env.bool('teledex-enabled')) {
      l.debug(
        'Devdex Preact bootstrap request was ignored',
        'since teledex has been disabled by the environment.',
      );

      return void this.endTimer('(devdex denied)');
    }

    l.debug('Adding the DevdexPreactPanel to the PS.roomTypes...');
    window.PS.addRoomType(DevdexPreactPanel);

    this.endTimer('(devdex enabled)');
  }
}

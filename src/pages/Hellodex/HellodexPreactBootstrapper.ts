/**
 * @file `HellodexPreactBootstrapper.ts`
 * @author Keith Choison <keith@tize.io>
 * @since 1.3.0
 */

import { env } from '@showdex/utils/core';
import { logger } from '@showdex/utils/debug';
import { detectPreactHost } from '@showdex/utils/host';
import { BootdexPreactAdapter } from '../Bootdex/BootdexPreactAdapter';
import { BootdexPreactBootstrappable } from '../Bootdex/BootdexPreactBootstrappable';
import { HellodexPreactPanel } from './HellodexPreactPanel';

const l = logger('@showdex/pages/Hellodex/HellodexPreactBootstrapper');

export class HellodexPreactBootstrapper extends BootdexPreactBootstrappable {
  public static override readonly scope = l.scope;
  public static override readonly Adapter = BootdexPreactAdapter;

  public readonly roomId = 'hellodex' as Showdown.RoomID;

  protected override startTimer(): void {
    super.startTimer(HellodexPreactBootstrapper.scope);
  }

  public open(): void {
    if (!detectPreactHost(window) || !this.roomId) {
      return;
    }

    const { rootState } = HellodexPreactBootstrapper.Adapter;
    const { hellodex: settings } = rootState?.showdex?.settings || {};
    const shouldFocus = !settings?.focusRoomsRoom;

    if (window.PS.rooms[this.roomId]) {
      if (window.PS.room?.id !== this.roomId && shouldFocus) {
        window.PS.focusRoom(this.roomId);
      }

      return;
    }

    window.PS.join(this.roomId, {
      noURL: true,
      autofocus: shouldFocus,
      autoclosePopups: false, // default: true; login popup might be open at this stage
    });

    if (shouldFocus) {
      return;
    }

    window.PS.focusRoom('rooms' as Showdown.RoomID);
  }

  public close(): void {
    if (!detectPreactHost(window) || !this.roomId) {
      return;
    }

    window.PS.leave(this.roomId);
  }

  public destroy(): void { // eslint-disable-line class-methods-use-this
    l.warn('one does not simply destroy() a Hellodex');
  }

  public run(): void {
    this.startTimer();

    if (!detectPreactHost(window)) {
      return void this.endTimer('(bad preact)', window.__SHOWDEX_HOST);
    }

    l.silly(
      'Hellodex Preact bootstrapper was invoked;',
      'determining if there\'s anything to do...',
    );

    if (!env.bool('hellodex-enabled')) {
      l.debug(
        'Hellodex Preact bootstrap request was ignored',
        'since it has been disabled by the environment.',
      );

      return void this.endTimer('(hellodex denied)');
    }

    l.debug('Adding the HellodexPreactPanel to the PS.roomTypes...');
    window.PS.addRoomType(HellodexPreactPanel);
    // l.debug('PS.roomTypes', window.PS.roomTypes);

    l.debug('Attempting to open the Hellodex w/ roomId', this.roomId);
    this.open();
    this.endTimer('(hellodex enabled)');
  }
}

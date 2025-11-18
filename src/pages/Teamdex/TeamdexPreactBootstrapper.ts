/**
 * @file `TeamdexPreactBootstrapper.ts`
 * @author Keith Choison <keith@tize.io>
 * @since 1.3.0
 */

import { logger } from '@showdex/utils/debug';
import { detectPreactHost } from '@showdex/utils/host';
import { BootdexPreactBootstrappable } from '../Bootdex/BootdexPreactBootstrappable';
import { MixinTeamdexBootstrappable } from './TeamdexBootstrappable';

const l = logger('@showdex/pages/Teamdex/TeamdexPreactBootstrapper');

export class TeamdexPreactBootstrapper extends MixinTeamdexBootstrappable(BootdexPreactBootstrappable) {
  public static override readonly scope = l.scope;

  protected updateDebounce = 1000; // in ms
  protected updateTimeout?: NodeJS.Timeout = null;

  protected queuePresetsUpdate(
    reason?: string,
  ): void {
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }

    this.updateTimeout = setTimeout(() => {
      l.debug(
        'PS.teams.update()', '->', 'queuePresetsUpdate()',
        '\n', 'Updating Teamdex presets due to Teambuilder', reason, 'update',
        '\n', 'PS.teams', window.PS.teams,
      );

      this.updateTeambuilderPresets();
      this.updateTimeout = null;
    }, this.updateDebounce);
  }

  protected override startTimer(): void {
    super.startTimer(TeamdexPreactBootstrapper.scope);
  }

  public open(): void { // eslint-disable-line class-methods-use-this
    l.info('coming soon to VHS !!!');
  }

  public close(): void { // eslint-disable-line class-methods-use-this
    l.info('nothing to close yet dummy');
  }

  public destroy(): void { // eslint-disable-line class-methods-use-this
    l.info('destroyed nothing cause there was nothing to destroy ... yet');
  }

  public run(): void {
    this.startTimer();

    if (!detectPreactHost(window)) {
      return void this.endTimer('(bad preact)', window.__SHOWDEX_HOST);
    }

    l.silly(
      'Teamdex Preact bootstrapper was invoked;',
      'determining if there\'s anything to do...',
    );

    l.debug('Subscribing to PS.teams...');

    window.PS.teams.subscribeAndRun((value) => {
      if (value !== 'team') {
        return;
      }

      this.queuePresetsUpdate(value);
    });

    this.endTimer('(bootstrap complete)');
  }
}

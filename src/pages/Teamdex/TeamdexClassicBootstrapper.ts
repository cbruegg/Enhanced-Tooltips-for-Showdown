/**
 * @file `TeamdexClassicBootstrapper.ts`
 * @author Keith Choison <keith@tize.io>
 * @since 1.1.3
 */

import { logger } from '@showdex/utils/debug';
import { detectClassicHost } from '@showdex/utils/host';
import { BootdexClassicBootstrappable } from '../Bootdex/BootdexClassicBootstrappable';
import { MixinTeamdexBootstrappable } from './TeamdexBootstrappable';

const l = logger('@showdex/pages/Teamdex/TeamdexClassicBootstrapper');

export class TeamdexClassicBootstrapper extends MixinTeamdexBootstrappable(BootdexClassicBootstrappable) {
  public static override readonly scope = l.scope;

  protected override startTimer(): void {
    super.startTimer(TeamdexClassicBootstrapper.scope);
  }

  public open(): void { // eslint-disable-line class-methods-use-this
    l.info('coming soon to a theater near you !!!');
  }

  public close(): void { // eslint-disable-line class-methods-use-this
    l.info('nothing to close yet dummy');
  }

  public destroy(): void { // eslint-disable-line class-methods-use-this
    l.info('destroyed nothing cause there was nothing to destroy ... yet');
  }

  public run(): void {
    if (!detectClassicHost(window)) {
      throw new Error('TeamdexClassicBootstrapper can only be run in the classic Showdown Backbone.js client!');
    }

    this.startTimer();

    l.silly(
      'Teamdex bootstrapper was invoked;',
      'determining if there\'s anything to do...',
    );

    // override app.user.trigger() to listen for 'saveteams', in order to update the converted presets
    if (typeof window.app.user?.trigger === 'function' && !window.app.user.teamdexInit) {
      l.debug('Hooking into the client\'s app.user.trigger()...');

      const userTrigger = window.app.user.trigger.bind(window.app.user) as Showdown.ClientApp['user']['trigger'];

      window.app.user.trigger = (name, ...argv) => {
        // run this first to make sure the data is freshly mutated before we run our injected bit
        const output = userTrigger(name, ...argv);

        if (name === 'saveteams') {
          this.updateTeambuilderPresets();
        }

        return output;
      };

      window.app.user.teamdexInit = true;
    }

    l.debug('Registering callback to Storage.whenTeamsLoaded()...');

    // on first init, either convert the presets if ready, or register a callback to convert once ready
    const teamsLoaded = window.Storage?.whenTeamsLoaded?.isLoaded;

    if (typeof teamsLoaded === 'boolean' && !teamsLoaded) {
      window.Storage.whenTeamsLoaded(
        this.updateTeambuilderPresets.bind(this) as TeamdexClassicBootstrapper['updateTeambuilderPresets'],
        null,
      );
    } else {
      // fuck it, attempt to update it anyways
      this.updateTeambuilderPresets();
    }

    this.endTimer('(bootstrap complete)');
  }
}

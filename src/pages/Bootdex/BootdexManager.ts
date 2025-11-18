/**
 * @file `BootdexManager.ts`
 * @author Keith Choison <keith@tize.io>
 * @since 1.3.0
 */

import { type GenerationNum } from '@smogon/calc';
import { logger, wtf } from '@showdex/utils/debug';
import { BootdexAdapter } from './BootdexAdapter';
import { type CalcdexBootstrappableLike } from '../Calcdex/CalcdexBootstrappable';
import { type HonkdexBootstrappableLike } from '../Honkdex/HonkdexBootstrappable';
import { type NotedexBootstrappableLike } from '../Notedex/NotedexBootstrappable';
import { type BootdexBootstrappableLike } from './BootdexBootstrappable';

export interface BootdexManagerBootstrappers {
  calcdex: CalcdexBootstrappableLike;
  hellodex: BootdexBootstrappableLike;
  honkdex: HonkdexBootstrappableLike;
  notedex: NotedexBootstrappableLike;
}

const l = logger('@showdex/pages/Bootdex/BootdexManager');

export class BootdexManager {
  public static readonly scope = l.scope;
  public static readonly Adapter = BootdexAdapter;
  private static readonly __bootstrappers: BootdexManagerBootstrappers = {
    calcdex: null,
    hellodex: null,
    honkdex: null,
    notedex: null,
  };

  public static get registry(): (keyof typeof BootdexManager.__bootstrappers)[] {
    return (Object.entries(this.__bootstrappers) as Entries<typeof BootdexManager.__bootstrappers>)
      .filter(([, bootstrapper]) => !!bootstrapper?.scope)
      .map(([name]) => name);
  }

  public static register<
    TName extends keyof typeof BootdexManager.__bootstrappers,
    TBootstrapper extends BootdexManagerBootstrappers[TName],
  >(
    name: TName,
    Bootstrapper: TBootstrapper,
  ): void {
    if (!name || !(name in this.__bootstrappers) || typeof Bootstrapper !== 'function') {
      return;
    }

    this.__bootstrappers[name] = Bootstrapper as BootdexManagerBootstrappers[typeof name];

    if (__DEV__) {
      l.debug(
        'registered', wtf(Bootstrapper), 'as the', name, 'bootstrapper',
        '\n', 'registry', this.registry,
      );
    }
  }

  public static registered(
    name: keyof typeof BootdexManager.__bootstrappers,
  ): boolean {
    return !!this.__bootstrappers[name]?.scope;
  }

  public static named<
    TName extends keyof typeof BootdexManager.__bootstrappers,
  >(
    name: TName,
  ) {
    const Bootstrapper = this.__bootstrappers[name];

    if (!this.registered(name)) {
      l.error(
        name, 'bootstrapper isn\'t registered into the BootdexManager;',
        'something is horribly wrong here!',
        '\n', 'Bootstrapper', '(typeof)', wtf(Bootstrapper), '(scope)', Bootstrapper?.scope, Bootstrapper,
      );

      throw new Error(`Showdex couldn't find the "${name}" bootstrapper thingymabobbers.`);
    }

    return Bootstrapper;
  }

  /**
   * Opens the existing Hellodex tab or creates a new one.
   *
   * @since 1.3.0
   */
  public static openHellodex(): void {
    new (this.named('hellodex'))().open();
  }

  /**
   * Closes the existing Hellodex tab.
   *
   * @since 1.3.0
   */
  public static closeHellodex(): void {
    new (this.named('hellodex'))().close();
  }

  /**
   * Runs the Calcdex bootstrapper for the provided `battleId`.
   *
   * @since 1.3.0
   */
  public static runCalcdex(battleId: string): void {
    if (!battleId) {
      return;
    }

    new (this.named('calcdex'))(battleId).run();
  }

  /**
   * Opens the existing Calcdex tab (or battle if overlayed) or creates a new one.
   *
   * @since 1.3.0
   */
  public static openCalcdex(battleId: string): void {
    if (!battleId) {
      return;
    }

    new (this.named('calcdex'))(battleId).open();
  }

  /**
   * Closes an existing Calcdex tab w/ the provided `battleId`.
   *
   * @since 1.3.0
   */
  public static closeCalcdex(battleId: string): void {
    if (!battleId) {
      return;
    }

    new (this.named('calcdex'))(battleId).close();
  }

  /**
   * Removes all traces of an existing Calcdex w/ the provided `battleId`.
   *
   * @since 1.3.0
   */
  public static destroyCalcdex(battleId: string): void {
    if (!battleId) {
      return;
    }

    new (this.named('calcdex'))(battleId).destroy();
  }

  /**
   * Opens the existing Honkdex tab or creates a new one if an `instanceId` wasn't provided.
   *
   * @since 1.3.0
   */
  public static openHonkdex(
    instanceId?: string,
    gen?: GenerationNum,
    format?: string,
  ): void {
    new (this.named('honkdex'))(instanceId, gen, format).open();
  }

  /**
   * Closes an existing Honkdex tab w/ the provided `instanceId`.
   *
   * @since 1.3.0
   */
  public static closeHonkdex(instanceId: string): void {
    if (!instanceId) {
      return;
    }

    new (this.named('honkdex'))(instanceId).close();
  }

  /**
   * Removes all traces of an existing Honkdex w/ the provided `instanceId`.
   *
   * @since 1.3.0
   */
  public static destroyHonkdex(instanceId: string): void {
    if (!instanceId) {
      return;
    }

    new (this.named('honkdex'))(instanceId).destroy();
  }

  /**
   * Opens the existing Notedex tab or creates a new one if an `instanceId` wasn't provided.
   *
   * @since 1.3.0
   */
  public static openNotedex(instanceId?: string): void {
    new (this.named('notedex'))(instanceId).open();
  }

  /**
   * Closes an existing Notedex tab w/ the provided `instanceId`.
   *
   * @since 1.3.0
   */
  public static closeNotedex(instanceId: string): void {
    if (!instanceId) {
      return;
    }

    new (this.named('notedex'))(instanceId).close();
  }

  /**
   * Removes all traces of an existing Notedex w/ the provided `instanceId`.
   *
   * @since 1.3.0
   */
  public static destroyNotedex(instanceId: string): void {
    if (!instanceId) {
      return;
    }

    new (this.named('notedex'))(instanceId).destroy();
  }
}

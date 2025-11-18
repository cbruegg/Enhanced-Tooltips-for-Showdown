/**
 * @file `BootdexBootstrappable.ts`
 * @author Keith Choison <keith@tize.io>
 * @since 1.3.0
 */

import { type SyncBattlePayload } from '@showdex/redux/actions';
import { logger, runtimer } from '@showdex/utils/debug';
import { BootdexAdapter } from './BootdexAdapter';
import { BootdexManager } from './BootdexManager';

export type BootdexBootstrappableLike =
  & Omit<typeof BootdexBootstrappable, 'constructor'>
  & (new () => BootdexBootstrappable);

const l = logger('@showdex/pages/Bootdex/BootdexBootstrappable');

export abstract class BootdexBootstrappable {
  public static readonly scope = l.scope;
  public static readonly Adapter = BootdexAdapter;
  public static readonly Manager = BootdexManager;

  private __runtimerActive = false;

  /**
   * Returns whether the current layout has a single panel from the client's options.
   *
   * * Returns `false` if the layout has left-right panels or the client's options couldn't be determined.
   * * Appears that while in battle, a viewport width less than `1275px` will collapse into a single panel.
   *
   * @since 1.0.3
   */
  public static hasSinglePanel: () => boolean = () => false;

  /**
   * Opens a user popup.
   *
   * @since 0.1.3
   */
  public static openUserPopup: (username: string) => void = () => void 0;

  /**
   * Opens the room containing the lists of active battles.
   *
   * @since 1.3.0
   */
  public static openBattlesRoom: () => void = () => void 0;

  /**
   * Accepts an Open Team Sheets (OTS) request, if any.
   *
   * @since 1.3.0
   */
  public static acceptBattleOts: SyncBattlePayload['onAcceptOts'] = () => void 0;

  protected endTimer?: ReturnType<typeof runtimer> = null;

  protected startTimer(scope = BootdexBootstrappable.scope): void {
    if (this.__runtimerActive) {
      return;
    }

    const endTimer = runtimer(scope, l);

    this.endTimer = (...args: Parameters<typeof endTimer>) => {
      const result = endTimer(...args);

      this.__runtimerActive = false;

      return result;
    };

    this.__runtimerActive = true;
  }

  public abstract open(): void;
  public abstract close(): void;
  public abstract run(): void;
  public abstract destroy(): void;
}

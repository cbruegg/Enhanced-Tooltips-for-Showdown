/**
 * @file `DevdexBootstrappable.ts`
 * @author Keith Choison <keith@tize.io>
 * @since 1.2.5
 */

import { logger } from '@showdex/utils/debug';
import { BootdexBootstrappable } from '../Bootdex/BootdexBootstrappable';

export type DevdexBootstrappableLike =
  & Omit<typeof DevdexBootstrappable, 'constructor'>
  & (new () => DevdexBootstrappable);

const l = logger('@showdex/pages/Devdex/DevdexBootstrappable');

/**
 * Singleton-flavored abstract base for Devdex bootstrappers.
 *
 * Unlike `NotedexBootstrappable`, there is no per-instance state, no redux slice,
 * and no `instanceId` — Devdex is a fixed singleton (`roomId = 'devdex'`).
 *
 * @since 1.2.5
 */
export abstract class DevdexBootstrappable extends BootdexBootstrappable {
  public static override readonly scope = l.scope;
}

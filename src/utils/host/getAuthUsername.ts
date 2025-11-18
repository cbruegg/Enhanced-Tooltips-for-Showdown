/**
 * @file `getAuthUsername.ts`
 * @author Keith Choison <keith@tize.io>
 * @since 1.0.3
 */

import { detectClassicHost } from './detectClassicHost';
import { detectPreactHost } from './detectPreactHost';

/**
 * Returns the name of the currently logged-in user.
 *
 * * Username will be formatted as provided by the user & not `formatId()`'d.
 * * Works on both `'preact'` (i.e., the Showdown client rewrite) & `'classic'` (i.e., Backbone.js) `__SHOWDEX_HOST`'s.
 * * `null` will be returned if the username couldn't be determined (probably cause there isn't a logged-in user lol).
 *
 * @example
 * ```ts
 * getAuthUsername();
 *
 * 'sumfuk'
 * ```
 * @default null
 * @since 1.0.3
 */
export const getAuthUsername = (): string => (
  (detectClassicHost(window) && window.app.user?.attributes?.name)
    || (detectPreactHost(window) && window.PS.user?.registered?.name)
    || null
);

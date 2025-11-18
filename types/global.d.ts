/**
 * @file `global.d.ts` - Primary file that declares globals.
 *
 * * Note that other files in the `types` directory may also declare globals.
 *   - Though, they should be moved here lol.
 *
 * @author Keith Choison <keith@tize.io>
 * @since 0.1.0
 */

/**
 * Convenient `isDevelopment` or `NODE_ENV === 'development'` global.
 *
 * * Can be safely used anywhere in the `src` directory.
 *   - Only in JavaScript/TypeScript files, obviously.
 * * Looking for where this is defined?
 *   - See `webpack.config.js`.
 *
 * @since 0.1.0
 */
declare const __DEV__: NodeJS.Global['__DEV__'];

// Firefox-exclusive WebExtension content script globals
declare const exportFunction: FirefoxBrowser.ExportFunction;
declare const cloneInto: FirefoxBrowser.CloneInto;

// DOM `window` globals
declare interface Window extends Window, Showdown.HostGlobals {
  /**
   * Showdex will populate this with its `BUILD_NAME` env once initialization starts to prevent other Showdexes from
   * potentially loading in.
   *
   * @example
   * ```ts
   * 'showdex-v1.2.1-b18CF1B54BEF.chrome'
   * ```
   * @since 1.2.1
   */
  __SHOWDEX_INIT?: string;

  /**
   * Showdex will populate this based on the Showdown client's detected MVC (i.e., Model-View-Controller) engine.
   *
   * * When in `'preact'` mode, Showdex will utilize the new exposed `PSModel` globals (e.g., `window.BattleRoom`) during
   *   the bootstrapping process.
   *   - For backwards compatibilty, Showdex will revert to using its traditional dodgy hooks (assuming the `window.app`
   *     is present) should this value be falsy (or `'classic'`).
   * * Preact detection works by looking for the `window.PS` global, regardless of `window.app`'s existence.
   *   - `'classic'` (Backbone.js-powered) client won't have that aforementioned `window.PS` global.
   *
   * @since 1.3.0
   */
  __SHOWDEX_HOST?: 'classic' | 'preact';
}

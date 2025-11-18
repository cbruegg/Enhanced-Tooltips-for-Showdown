/**
 * @file `client-globals.d.ts` - `window` globals exposed by the classic Backbone.js-powered Showdown client.
 * @author Keith Choison <keith@tize.io>
 * @since 0.1.0
 */

declare namespace Showdown {
  interface ClientGlobals {
    /**
     * Classic Backbone.js-powered `app` client global.
     *
     * * Typically won't exist when the `__SHOWDEX_HOST` is the `'preact'` Showdown client.
     *
     * @since 0.1.0
     */
    app: ClientApp;
    App: new () => ClientApp;
    Backbone: { VERSION: string; };
    BattleRoom: ClientBattleRoom;
    HtmlRoom: ClientHtmlRoom;
    UserPopup: UserPopup;
    /**
     * Showdown's custom `Storage` object.
     *
     * * Requires LOTS of type assertions since `Storage` is technically a built-in native Web API,
     *   specifically from the Web Storage API.
     * * Not recommended that you bind any function in here, since the referenced `Storage` is subject
     *   to change at any point during runtime!
     *   - Especially when the `data` object is asynchronously populated.
     *
     * @example
     * ```ts
     * // this will fail since TypeScript will think we're accessing the Web Storage API
     * Storage.prefs('theme');
     * //      ^~~ Property 'prefs' does not exist on type
     * //          `{ new (): Storage; prototype: Storage; }`.
     *
     * // hence the forceful type assertions here
     * (Storage as unknown as Showdown.ClientStorage).prefs('theme');
     * ```
     * @since 1.0.3
     */
    Storage: ClientStorage;
  }
}

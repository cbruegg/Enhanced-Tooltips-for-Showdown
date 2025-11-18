/**
 * @file `ps-user.d.ts` - Adapted from `pokemon-showdown-client/play.pokemonshowdown.com/src/client-main.ts`.
 * @author Keith Choison <keith@tize.io>
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license APGLv3
 * @since 0.1.0
 */

declare namespace Showdown {
  type PSLoginState = {
    error?: string;
    success?: boolean;
    name?: string;
    needsPassword?: boolean;
    needsGoogle?: boolean;
  };

  class PSUser extends PSStreamModel<PSLoginState> {
    public name = '';
    public group = '';
    public userid = '' as ID;
    public named = false;
    public registered?: { name: string; userid: ID; } = null;
    public avatar = 'lucas';
    public challstr = '';
    public loggingIn?: string = null;
    public initializing = true;
    public gapiLoaded = false;
    public nameRegExp?: RegExp = null;

    public setName(fullName: string, named: boolean, avatar: string): void;
    public validateName(name: string): string;
    public changeName(name: string): void;
    public changeNameWithPassword(name: string, password: string, special?: PSLoginState = { needsPassword: true }): void;
    public updateLogin(update: PSLoginState): void;
    public handleAssertion(name: string, assertion?: string): void;
    public logOut(): void;
    public updateRegExp(): void;
  }
}

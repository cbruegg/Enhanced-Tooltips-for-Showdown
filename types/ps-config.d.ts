/**
 * @file `ps-config.d.ts` - Adapted from `pokemon-showdown-client/play.pokemonshowdown.com/src/client-main.ts`.
 * @author Keith Choison <keith@tize.io>
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 * @since 0.1.0
 */

declare namespace Showdown {
  interface ServerInfo {
    id: ID;
    protocol: string;
    host: string;
    port: number;
    httpport?: number;
    altport?: number;
    prefix: string;
    afd?: boolean;
    registered?: boolean;
  }

  interface PSConfig {
    server: ServerInfo;
    defaultserver: ServerInfo;
    routes: {
      root: string;
      client: string;
      dex: string;
      replays: string;
      users: string;
      teams: string;
    };
    customcolors: Record<string, string>;
    whitelist?: string[];
    testclient?: boolean;
  }
}

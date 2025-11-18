/**
 * @file `ps-server.d.ts` - Adapted from `pokemon-showdown-client/play.pokemonshowdown.com/src/client-main.ts`.
 * @author Keith Choison <keith@tize.io>
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 * @since 0.1.0
 */

declare namespace Showdown {
  class PSServer {
    public id: ServerInfo['id'];
    public host: ServerInfo['host'];
    public port: ServerInfo['port'];
    public httpport: ServerInfo['httpport'];
    public altport: ServerInfo['altport'];
    public registered: ServerInfo['registered'];
    public prefix: ServerInfo['prefix'];
    public protocol: 'http' | 'https';
    public groups: { [symbol: string]: PSGroup; };
    public defaultGroup: PSGroup = { order: 108 };

    public getGroup(symbol?: string): PSGroup;
  }
}

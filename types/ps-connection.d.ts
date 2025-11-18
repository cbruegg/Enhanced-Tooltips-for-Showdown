/**
 * @file `ps-connection.d.ts` - Adapted from `pokemon-showdown-client/play.pokemonshowdown.com/src/client-connection.ts`.
 * @author Keith Choison <keith@tize.io>
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 * @since 0.1.0
 */

declare namespace Showdown {
  const POKEMON_SHOWDOWN_TESTCLIENT_KEY: string;

  class PSConnection {
    public socket?: WebSocket = null;
    public connected = false;
    public queue: string[] = [];
    public reconnectDelay = 1000;
    private reconnectCap = 15000;
    private shouldReconnect = true;
    public reconnectTimer?: NodeJS.Timeout = null;
    private worker?: Worker = null;

    public static connect(): void;

    public initConnection(): void;
    public canReconnect(): boolean;
    public tryConnectInWorker(): boolean;
    public directConnect(): void;
    private handleDisconnect(): void;
    private retryConnection(): void;
    public disconnect(): void;
    public reconnect(): void;
    public send(message: string): void;
  }
}

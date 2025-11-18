/**
 * @file `ps-storage.d.ts` - Adapted from `pokemon-showdown-client/play.pokemonshowdown.com/src/client-connection.ts`.
 * @author Keith Choison <keith@tize.io>
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 * @since 1.3.0
 */

/* eslint-disable max-classes-per-file */

declare namespace Showdown {
  class PSStorage {
    public static frame?: WindowProxy = null;
    public static requests?: Record<string, (data: unknown) => void> = null;
    public static requestCount = 0;
    public static readonly origin: string;
    public static loader?: () => void;
    public static loaded: Promise<void> | boolean = false;
    public static onMessage: (event: MessageEvent) => void;
    public static postCrossOriginMessage: (data: string) => false | void;

    public static init(): void | Promise<void>;
    public static request(
      type: NetRequestOptions['method'],
      uri: string,
      data: unknown,
    ): void | Promise<void>;
  }

  class PSLoginServer {
    public rawQuery(act: string, data: PostData): Promise<string>;
    public query(act: string, data: PostData = {}): Promise<Record<string, unknown>>;
  }
}

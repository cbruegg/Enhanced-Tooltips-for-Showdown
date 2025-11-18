/**
 * @file `ps-net.d.ts` - Adapted from `pokemon-showdown-client/play.pokemonshowdown.com/src/client-connection.ts`.
 * @author Keith Choison <keith@tize.io>
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 * @since 1.3.0
 */

/* eslint-disable max-classes-per-file */

declare namespace Showdown {
  interface PostData {
    [key: string]: string | number | boolean | null | undefined;
  }

  interface NetRequestOptions {
    method?: 'GET' | 'POST';
    body?: string | PostData;
    query?: PostData;
  }

  class HttpError extends Error {
    public statusCode?: number;
    public body: string;

    public constructor(message: string, statusCode?: number, body?: string);
  }

  class NetRequest {
    public uri: string;

    public constructor(uri: string);

    /**
     * Makes a basic HTTPS request to the URI & returns the response data.
     *
     * * `throw`'s if the response code isn't 200 OK.
     */
    public get(opts: NetRequestOptions = {}): Promise<string>;
    /** Makes a HTTPS POST request to the given link. */
    public post(opts: NetRequestOptions = {}, body?: PostData | string): Promise<string>;
  }

  type Net = ((uri: string) => NetRequest) & {
    defaultRoute: string;
    encodeQuery(data: string | PostData): string;
    formData(form: HTMLFormElement): Record<string, string | boolean>;
  };
}

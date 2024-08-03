import { replace } from '../battle/regex';

/**
 * What's a "uris" ?? LOL idk but this joins together URIs (Universal Resource Indentifiers).
 *
 * @example
 * ```ts
 * joinUris('https://bake.dex.tize.io/', '/v1', '/some//crazy////route');
 *
 * 'https://bake.dex.tize.io/v1/some/crazy/route'
 * ```
 * @since 1.2.4
 */
export const joinUris = (
  baseUrl: string,
  ...uris: string[]
): string => {
  const joined = (!baseUrl ? null : [
    baseUrl,
    ...uris,
  ].filter(Boolean).join('/'));

  const regex = '(?<!\\w:)\\/{2,}';
  const result = replace(joined, regex, '/', 'gi');
  return result;
};

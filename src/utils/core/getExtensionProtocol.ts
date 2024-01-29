import { env } from './getEnv';

export const getExtensionProtocol = (): string => (
  (env('build-target') === 'firefox' && 'moz-extension')
    || (env('build-target') === 'chrome' && 'safari-web-extension')
    || env('standalone-resource-protocol')
);

/**
 * @file `node.d.ts`
 * @author Keith Choison <keith@tize.io>
 * @since 0.1.0
 */

/// <reference types="node" />

declare namespace NodeJS {
  interface Global {
    readonly __DEV__: boolean;
  }
}

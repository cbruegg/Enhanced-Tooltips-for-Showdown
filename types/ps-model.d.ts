/**
 * @file `ps-models.d.ts` - Adapted from `pokemon-showdown-client/src/client-core.ts`.
 * @author Keith Choison <keith@tize.io>
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 * @since 1.3.0
 */

/* eslint-disable max-classes-per-file */

declare namespace Showdown {
  /**
   * "PS Models roughly implement the Observable spec.
   *
   * "By default, `PSModel` notifies listeners when the model is updated. With a value, `PSModel` can also stream data out.
   * Note that unlike React's usual paradigm, PS Models are not immutable."
   */
  class PSModel<T = unknown> {
    public subscriptions: PSSubscription<T>[] = [];

    public constructor();
    public subscribe(listener: (value: T) => void): PSSubscription<T>;
    public subscribeAndRun(listener: (value: T) => void): PSSubscription<T>;
    public update(value?: T): void;
  }

  /**
   * "The main difference is that StreamModel keeps a backlog, so events generated before something subscribes are not lost."
   *
   * * "Nullish values are not kept in the backlog."
   */
  class PSStreamModel<T = string> {
    public subscriptions: PSSubscription<T>[] = [];
    public backlog: NonNullable<T>[] = [];

    public constructor();
    public subscribe(listener: (value: T) => void): PSSubscription<T>;
    public subscribeAndRun(listener: (value: T) => void): PSSubscription<T>;
    public update(value: T): void;
  }

  class PSSubscription<T = unknown> {
    public observable: PSModel<T> | PSStreamModel<T>;
    public listener: (value: T) => void;

    public constructor(
      observable: PSModel<T> | PSStreamModel<T>,
      listener: (value: T) => void,
    );
    public unsubscribe(): void;
  }
}

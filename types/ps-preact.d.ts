/**
 * @file `ps-preact.d.ts` - Adapted from `pokemon-showdown-client/play.pokemonshowdown.com/js/lib/preact.d.ts`.
 * @author Keith Choison <keith@tize.io>
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 * @since 1.3.0
 */

declare namespace Showdown {
  namespace Preact {
    type RenderableProps<
      TProps extends object = object,
    > = Readonly<TProps & React.Attributes>;

    interface FunctionalComponent<
      TProps extends object = object,
      TContext = object,
    > {
      (props: RenderableProps<TProps>, context: TContext): VNode;
      name: string;
      displayName?: string;
      defaultProps?: Partial<TProps>;
    }

    abstract class Component<
      TProps extends object = object,
      TState extends object = object,
      TContext = object,
      TRef = HTMLElement,
    > {
      public static displayName?: string;
      public static defaultProps?: TProps;

      public state: Readonly<TState>;
      public props: RenderableProps<TProps>;
      public context: TContext;
      public base?: TRef;

      public constructor(props?: TProps, context?: TContext): void;
      public componentWillMount?(): void;
      public componentDidMount?(): void;
      public componentWillReceiveProps?(nextProps: Readonly<TProps>): void;
      public shouldComponentUpdate?(nextProps: Readonly<TProps>, nextState: Readonly<TState>, nextContext: TContext): boolean;
      public componentWillUpdate?(nextProps: Readonly<TProps>, nextState: Readonly<TState>, nextContext: TContext): void;
      public componentDidUpdate?(prevProps: Readonly<TProps>, prevState: Readonly<TState>, prevContext: TContext): void;
      public componentWillUnmount?(): void;
      public getChildContext?(): TContext;
      public setState<K extends keyof TState>(
        state: ((prevState: Readonly<TState>, props: Readonly<TProps>) => (Pick<TState, K> | TState)) | (Pick<TState, K> | TState),
        callback?: () => void,
      ): void;
      public forceUpdate(callback?: () => void): void;
      public abstract render(
        props?: RenderableProps<TProps>,
        state?: Readonly<TState>,
        context?: TContext,
      ): JSX.Element | VNode | JSX.Element[] | VNode[];
    }

    interface ComponentConstructor<
      TProps extends object = object,
      TState extends object = object,
      TContext = object,
    > {
      new (props: RenderableProps<TProps>, context: TContext): Component<TProps, TState, TContext>;
      name: string;
      displayName?: string;
      defaultProps?: Partial<TProps>;
    }

    type ComponentFactory<TProps extends object = object> =
      | ComponentConstructor<TProps>
      | FunctionalComponent<TProps>;

    type ComponentChild = VNode | string;
    type ComponentChildren = ComponentChild | ComponentChild[];

    /** Preact virtual node. */
    interface VNode<TProps = unknown> {
      key?: string | number;
      type?: ComponentFactory<TProps> | string;
      constructor?: ComponentConstructor<TProps>;
      ref?: React.RefObject<Element>;
      props: TProps & { children?: ComponentChildren; };
      __?: VNode;
      __b?: number;
      __c?: {
        base: Element;
        constructor: ComponentFactory;
        context: object;
        props: object;
        state: object;
        render: typeof render;
      };
      __d?: unknown;
      __e?: Element;
      __h?: unknown;
      __k?: unknown[];
      __v?: number;
    }

    function toChildArray(
      children: ComponentChildren,
    ): ComponentChild[];

    function createElement<TProps extends object = object>(
      type: ComponentFactory<TProps> | string,
      props?: React.Attributes & TProps,
      ...children: ComponentChild[]
    ): VNode;
    function createElement(
      type: string,
      params?: Record<string, unknown>,
      ...children: ComponentChild[]
    ): VNode;

    /** @alias `createElement()` */
    function h<TProps extends object = object>(
      type: ComponentFactory<TProps> | string,
      props?: React.Attributes & TProps,
      ...children: ComponentChild[]
    ): VNode;
    function h(
      type: string,
      params?: Record<string, unknown>,
      ...children: ComponentChild[]
    ): VNode;

    function render(
      element: VNode | JSX.Element,
      container: Element | Document | ShadowRoot | DocumentFragment,
      mergeWith?: Element,
    ): Element;
    function rerender(): void;

    function cloneElement(element: VNode | JSX.Element, props?: unknown): VNode;
    function createRef<TRef>(): React.RefObject<TRef>;

    interface Globals {
      Component: ComponentConstructor;
      Fragment: ComponentConstructor;
      createElement: typeof createElement;
      h: typeof h;
      cloneElement: typeof cloneElement;
      createRef: typeof createRef;
      hydrate: unknown;
      isValidElement: unknown;
      options: Record<string, unknown>;
      render: typeof render;
      toChildArray: typeof toChildArray;
    }
  }
}

/**
 * @file `DevdexPreactPanel.ts`
 * @author Keith Choison <keith@tize.io>
 * @since 1.2.5
 */

/* eslint-disable max-classes-per-file */

import * as ReactDOM from 'react-dom/client';
import cx from 'classnames';
import { logger } from '@showdex/utils/debug';
import { detectPreactHost } from '@showdex/utils/host';
import {
  BootdexPreactBootstrappable as Bootstrappable,
  preact,
  PSPanelWrapper,
  PSRoom,
  PSRoomPanel,
} from '../Bootdex/BootdexPreactBootstrappable';
import { DevdexDomRenderer } from './DevdexRenderer';

const l = logger('@showdex/pages/Devdex/DevdexPreactPanel');

export class DevdexPreactRoom extends PSRoom {
  public static readonly scope = l.scope;

  public override title = 'Devdex';
  public override type = 'devdex';
  public override readonly classType = 'devdex';
  public override location = 'right' as const;
  public override noURL = true;

  public rewriteHistory(): void { // eslint-disable-line class-methods-use-this
    Bootstrappable.rewriteHistory('/devdex', '/');
  }
}

export class DevdexPreactPanel extends PSRoomPanel<DevdexPreactRoom> {
  public static readonly scope = l.scope;
  public static readonly id = 'devdex';
  public static readonly routes = ['devdex'];
  public static readonly Model = DevdexPreactRoom;
  public static readonly location = 'right' as const;
  public static readonly icon = preact?.h('i', { class: cx('fa', 'fa-terminal'), 'aria-hidden': true });
  public static readonly title = 'Devdex';
  public static readonly noURL = true;

  private readonly __devdexRef = preact?.createRef<HTMLDivElement>();
  private __reactRoot?: ReactDOM.Root = null;

  public override componentDidMount() {
    super.componentDidMount();

    if (!detectPreactHost(window) || !this.__devdexRef?.current || this.__reactRoot) {
      return;
    }

    const { room } = this.props;
    const { Adapter } = Bootstrappable;

    this.__reactRoot = ReactDOM.createRoot(this.__devdexRef.current);

    DevdexDomRenderer(this.__reactRoot, {
      store: Adapter.store,
      onLeaveRoom: () => void window.PS.leave(room.id),
    });
  }

  public override componentWillUnmount() {
    super.componentWillUnmount();

    if (!detectPreactHost(window) || !this.__reactRoot) {
      return;
    }

    this.__reactRoot.unmount();
    this.__reactRoot = null;
  }

  protected get devdexPanelRoom() {
    return this.props.room;
  }

  public override focus(): void {
    super.focus();
    this.devdexPanelRoom?.rewriteHistory();
  }

  public override render(): Showdown.Preact.VNode {
    return preact?.h(PSPanelWrapper, { room: this.props.room }, preact?.h('div', {
      ref: this.__devdexRef,
      'data-showdex': 'devdex',
    }));
  }
}

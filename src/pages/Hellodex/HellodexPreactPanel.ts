/**
 * @file `HellodexPreactPanel.ts`
 * @author Keith Choison <keith@tize.io>
 * @since 1.3.0
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
import { HellodexDomRenderer } from './HellodexRenderer';

const l = logger('@showdex/pages/Hellodex/HellodexPreactPanel');

export class HellodexPreactRoom extends PSRoom {
  public static readonly scope = l.scope;

  public override title = 'Hellodex';
  public override type = 'hellodex';
  public override readonly classType = 'hellodex';
  public override location = 'right' as const;
  public override noURL = true;
  public override width = 320;

  public rewriteHistory(): void { // eslint-disable-line class-methods-use-this
    Bootstrappable.rewriteHistory('/hellodex', '/');
  }
}

export class HellodexPreactPanel extends PSRoomPanel<HellodexPreactRoom> {
  public static readonly scope = l.scope;
  public static readonly id = 'hellodex';
  public static readonly routes = ['hellodex'];
  public static readonly Model = HellodexPreactRoom;
  public static readonly location = 'right';
  public static readonly icon = preact?.h('i', {
    class: cx('fa', Math.random() > 0.5 ? 'fa-smile-o' : 'fa-heart'),
    'aria-hidden': true,
  });
  public static readonly title = 'Hellodex';
  public static readonly noURL = true;

  /** Note: React virtual nodes don't render properly in Preact, so we'll just do it the 'ol fashioned way (via `ReactDOM`). */
  private readonly __hellodexRef = preact?.createRef<HTMLDivElement>();
  private __reactRoot?: ReactDOM.Root = null;

  public override componentDidMount() {
    super.componentDidMount();

    if (!this.__hellodexRef?.current || this.__reactRoot) {
      return;
    }

    const {
      Adapter,
      Manager,
      openUserPopup,
      openBattlesRoom,
    } = Bootstrappable;

    this.__reactRoot = ReactDOM.createRoot(this.__hellodexRef.current);

    HellodexDomRenderer(this.__reactRoot, {
      store: Adapter.store,
      onUserPopup: openUserPopup,
      onRequestBattles: openBattlesRoom,
      onRequestCalcdex: (id) => void Manager?.openCalcdex(id),
      onRequestHonkdex: (id) => void Manager?.openHonkdex(id),
      onRequestNotedex: (id) => void Manager?.openNotedex(id),
      onCloseCalcdex: (id) => void Manager?.closeCalcdex(id),
      onRemoveHonkdex: (id) => void Manager?.destroyHonkdex(id),
      onRemoveNotedex: (id) => void Manager?.destroyNotedex(id),
    });
  }

  public override componentWillUnmount() {
    super.componentWillUnmount();

    if (!this.__reactRoot) {
      return;
    }

    this.__reactRoot.unmount();
    this.__reactRoot = null;
  }

  protected get hellodexPanelRoom() {
    return this.props.room;
  }

  public override focus(): void {
    super.focus();
    this.hellodexPanelRoom?.rewriteHistory();
  }

  public override render(): Showdown.Preact.VNode {
    const { room } = this.props;

    if (!detectPreactHost(window)) {
      return null;
    }

    // note: PSPanelWrapper's width & fullSize props are only used for 'mini-window' & popups (not regular panels lol)
    return preact.h(PSPanelWrapper, { room }, preact.h('div', {
      ref: this.__hellodexRef,
      'data-showdex': 'hellodex',
    }));
  }
}

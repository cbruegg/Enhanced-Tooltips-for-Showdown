/**
 * @file `CalcdexPreactBattleTimerButton.ts`
 * @author Keith Choison <keith@tize.io>
 * @since 1.3.0
 */

import { logger } from '@showdex/utils/debug';
import { detectPreactHost } from '@showdex/utils/host';

const PSTimerButton = detectPreactHost(window) ? window.TimerButton : null;

const l = logger('@showdex/pages/Calcdex/CalcdexPreactBattleTimerButton');

export class CalcdexPreactBattleTimerButton extends PSTimerButton {
  public static readonly scope = l.scope;

  public override render(): Showdown.Preact.VNode {
    const button = super.render();

    if ((button?.props as Record<'style', string>)?.style) {
      delete (button.props as Record<'style', string>).style;
    }

    return button;
  }
}

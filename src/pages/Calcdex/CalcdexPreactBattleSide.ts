/**
 * @file `CalcdexPreactBattleSide.ts`
 * @author Keith Choison <keith@tize.io>
 * @since 1.3.0
 */

import { type CalcdexPlayerKey } from '@showdex/interfaces/calc';
import { detectPreactHost } from '@showdex/utils/host';
import { logger } from '@showdex/utils/debug';
import { type CalcdexPreactBattle } from './CalcdexPreactBattle';

const l = logger('@showdex/pages/Calcdex/CalcdexPreactBattleSide');

// note: same Showdown.Side class is used on both 'classic' & 'preact' __SHOWDEX_HOST's
const { Side: PSBattleSide } = window;

export class CalcdexPreactBattleSide extends PSBattleSide {
  public static readonly scope = l.scope;

  public declare battle: CalcdexPreactBattle;
  public declare sideid: CalcdexPlayerKey;

  public constructor(
    battle: CalcdexPreactBattle,
    n: number,
  ) {
    super(battle, n);
  }

  public get calcdexAuthPlayerKey() {
    return !!this.sideid
      && !!this.battle?.calcdexAuthPlayerKey
      && this.sideid === this.battle.calcdexAuthPlayerKey;
  }

  public override addPokemon(
    name: string,
    ident: string,
    details: string,
    replaceSlot = -1,
  ): Showdown.Pokemon {
    if (!detectPreactHost(window) || typeof this.battle?.calcdexClientIdPatcher !== 'function') {
      return super.addPokemon(name, ident, details, replaceSlot);
    }

    return this.battle.calcdexClientIdPatcher(
      this.sideid,
      super.addPokemon.bind(this) as Showdown.Side['addPokemon'],
      [name, ident, details, replaceSlot],
    );
  }
}

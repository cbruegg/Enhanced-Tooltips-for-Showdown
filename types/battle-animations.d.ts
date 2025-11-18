/**
 * @file `battle-animations.d.ts` - Adapted from `pokemon-showdown-client/play.pokemonshowdown.com/src/battle-animations.ts`.
 * @author Keith Choison <keith@tize.io>
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license MIT
 * @since 0.1.0
 */

declare namespace Showdown {
  interface ScenePos {
    /** `-` = left, `+` = right */
    x?: number;
    /** `-` = down, `+` = up */
    y?: number;
    /** `-` = player, `+` = opponent */
    z?: number;
    scale?: number;
    xscale?: number;
    yscale?: number;
    opacity?: number;
    time?: number;
    display?: number;
  }

  interface InitScenePos extends ScenePos {
    x: number;
    y: number;
    z: number;
  }

  interface AnimData {
    anim(scene: BattleScene, args: PokemonSprite[]): void;
    prepareAnim?(scene: BattleScene, args: PokemonSprite[]): void;
    residualAnim?(scene: BattleScene, args: PokemonSprite[]): void;
  }

  type AnimTable = { [K: string]: AnimData; };
}

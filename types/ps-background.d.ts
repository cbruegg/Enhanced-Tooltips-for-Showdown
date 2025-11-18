/**
 * @file `ps-background.d.ts` - Adapted from `pokemon-showdown-client/src/client-core.ts`.
 * @author Keith Choison <keith@tize.io>
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 * @since 1.3.0
 */

declare namespace Showdown {
  class PSBackground extends PSStreamModel<string> {
    public id = '';
    public curId = '';
    public attrib?: {
      url?: string;
      title: string;
      artist: string;
    } = null;
    public changeCount = 0;
    public menuColors: string[] = [];

    public constructor();
    public save(bgUrl: string): void;
    public set(bgUrl: string, bgid?: string): void;
    public load(bgUrl: string, bgid: string, menuColors?: string[]): void;
    public extractMenuColors(bgUrl: string): void;
    public extractMenuColorsFromImg(img: HTMLImageElement, bgUrl: string): void;
    public getHueStat(r: number, g: number, b: number): number;
  }
}

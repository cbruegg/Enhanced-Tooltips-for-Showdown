/**
 * @file `battle-log.d.ts` - Adapted from `pokemon-showdown-client/play.pokemonshowdown.com/src/battle-log.ts`.
 * @author Keith Choison <keith@tize.io>
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license MIT
 * @since 0.1.0
 */

declare namespace Showdown {
  class BattleLog {
    public static colorCache: { [userid: string]: string; } = {};
    public static interstice: {
      isWhitelisted(uri: string): boolean;
      getURI(uri: string): string;
    };
    public static players: unknown[] = [];
    public static ytLoading?: LoadTracker = null;

    public static tagPolicy?: (tagName: string, attribs: string[]) => unknown = null;

    public elem: HTMLDivElement;
    public innerElem: HTMLDivElement;
    public scene?: BattleScene = null;
    public preemptElem?: HTMLDivElement = null;
    public atBottom = true;
    public className: string;
    public battleParser?: BattleTextParser = null;
    public joinLeave?: {
      joins: string[];
      leaves: string[];
      element: HTMLDivElement;
    } = null;
    public lastRename?: {
      from: string;
      to: string;
      element: HTMLDivElement;
    } = null;
    /**
     * * `-1` = spectator: "Red sent out Pikachu!" "Blue's Eevee used Tackle!"
     * * `0` = player: "Go! Pikachu!" "The opposing Eevee used Tackle!"
     * * `1` = opponent: "Red sent out Pikachu!" "Eevee used Tackle!"
     *
     * @default -1
     */
    public perspective: -1 | 0 | 1 = -1;

    public onClick: (event: Event) => void;
    public onScroll: () => void;
    public updateScroll: () => void;

    public static unlinkNodeList(nodeList: ArrayLike<HTMLElement>, classStart: string): void;
    public static escapeFormat(formatid = '', fixGen6?: boolean): string;
    public static formatName(formatid = '', fixGen6?: boolean): string;
    public static escapeHTML(str: string | number, jsEscapeToo?: boolean): string;
    /** Template string tag function for escaping HTML. */
    public static html(strings: TemplateStringsArray | string[], ...args: unknown[]): string[];
    public static unescapeHTML(str: string | number): string;
    /** @deprecated */
    public static hashColor(name: ID): string;
    public static usernameColor(name: ID): string;
    public static HSLToRGB(H: number, S: number, L: number): { R: number; G: number; B: number; };
    public static prefs<T = unknown>(name: string): T;
    public static parseMessage(str: string, isTrusted = false): string;
    public static initSanitizeHTML(): void;
    public static localizeTime(full: string, date: string, time: string, timezone?: string): string;
    public static sanitizeHTML(input: string): string;
    public static initYoutubePlayer(idx: number): void;
    public static async ensureYoutube(): Promise<void>;
    public static createReplayFile<T = unknown>(room: T): string;
    public static createReplayFileHref<T = unknown>(room: T): string;

    public constructor(elem: HTMLDivElement, scene?: BattleScene, innerElem?: HTMLDivElement);

    public reset(): void;
    public destroy(): void;

    public add(args: Args, kwArgs?: KwArgs, preempt?: boolean): void;
    public addSeekEarlierButton(): void;
    public addBattleMessage(args: Args, kwArgs?: KwArgs): void;
    public addAFDMessage(args: Args, kwArgs?: KwArgs): boolean | void; // AFD = April Fools' Day?
    public messageFromLog(line: string): void;
    public textList(list: string[]): string;
    /** To avoid trolling with nicknames, we can't just run this through `parseMessage`. */
    public parseLogMessage(message: string): [string, string];
    public message(message: string, sceneMessage?: string): void;
    public addNode<T extends HTMLElement = HTMLElement>(node: T, preempt?: boolean): void;
    public addDiv(className: string, innerHTML: string, preempt?: boolean): void;
    public prependDiv(className: string, innerHTML: string, preempt?: boolean): void;
    public addSpacer(): void;
    public changeUhtml(id: string, htmlSrc: string, forceAdd?: boolean): void;
    public hideChatFrom(userid: ID, showRevealButton = true, lineCount = 0): void;
    public unlinkChatFrom(userid: ID): void;
    public preemptCatchup(): void;
    public parseChatMessage(message: string, name: string, timestamp: string, isHighlighted?: boolean): [string, string, boolean?];
  }
}

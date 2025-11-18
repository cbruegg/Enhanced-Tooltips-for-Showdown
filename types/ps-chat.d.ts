/**
 * @file `ps-chat.d.ts` - Adapted from `pokemon-showdown-client/play.pokemonshowdown.com/src/panel-chat.tsx`.
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @author Keith Choison <keith@tize.io>
 * @license AGPLv3
 * @since 1.3.0
 */

/* eslint-disable max-classes-per-file */

declare namespace Showdown {
  interface Challenge {
    formatName: string;
    teamFormat: string;
    message?: string;
    acceptButtonLabel?: string;
    rejectButtonLabel?: string;
  }

  class ChatRoom extends PSRoom {
    public static highlightRegExp?: Record<string, RegExp> = null;

    public override readonly classType: 'chat' | 'battle' = 'chat';
    public override readonly canConnect = true as const;
    /** Note: This includes offline users! Use `onlineUsers` if you don't want them. */
    public users: { [userid: string]: string; } = {};
    /** Not equal to `onlineUsers.length` cause guests exist. */
    public userCount = 0;
    public onlineUsers: [ID, string][] = [];

    // pm-only props
    public pmTarget?: string = null;
    public challengeMenuOpen = false;
    public initialSlash = false;
    public challenging?: Challenge = null;
    public challenged?: Challenge = null;
    /** Note: Expect this to be `null` outside of `BattleRoom`'s! */
    public battle?: Battle = null;
    public log?: BattleLog = null;
    public tour?: ChatTournament = null;
    public lastMessage?: Args = null;
    public lastMessageTime?: number = null;
    public joinLeave?: ChatTournament['joinLeave'] = null;
    /** Ordered from least to most recent. */
    public userActivity: ID[] = [];
    public timeOffset = 0;

    public static getHighlight(message: string, roomid: string): boolean;
    public static updateHighlightRegExp(highlights: Record<string, string[]>): void;

    public handleHighlight: (args: Args) => boolean;

    public updateTarget(name?: string): void;
    public openChallenge(): void;
    public cancelChallenge(): void;
    public parseChallenge(challengeString?: string): Challenge;
    public updateChallenge(name: string, challengeString: string): void;
    public markUserActive(name: string): void;
    public setUsers(count: number, usernames: string[]): void;
    public sortOnlineUsers(): void;
    public addUser(username: string): void;
    public removeUser(username: string, noUpdate?: boolean): void;
    public renameUser(username: string, oldUsername: string): void;
    public handleJoinLeave(action: 'join' | 'leave', name: string, silent: boolean): void;
    public formatJoinLeave(preList: string[], action: 'joined' | 'left'): string;
  }

  interface CopyableURLBoxProps {
    url: string;
  }

  class CopyableURLBox extends Preact.Component<CopyableURLBoxProps> {
    public copy: () => void;
  }

  interface ChatTextEntryProps {
    room: ChatRoom;
    left?: number;
    tinyLayout?: boolean;
    onMessage: (message: string, element: HTMLElement) => void;
    onKey: (event: KeyboardEvent) => boolean;
  }

  class ChatTextEntry extends Preact.Component<ChatTextEntryProps> {
    public subscription?: PSSubscription = null;
    public textbox?: HTMLTextAreaElement = null;
    public miniedit?: MiniEdit = null;
    public history: string[] = [];
    public historyIndex = 0;
    public tabComplete?: {
      candidates: {
        userid: string;
        prefixIndex: number;
      }[];
      candidateIndex: number;
      /** Text left of the cursor before tab completing. */
      prefix: string;
      /** Text right of the cursor after tab completing. */
      cursor: string;
    } = null;

    public update: () => void;
    public focusIfNoSelection: (event: Event) => void;
    public onKeyDown: (event: KeyboardEvent) => void;

    public submit(): boolean;

    // direct manipulation functions
    public getValue(): string;
    public setValue(value: string, start: number, end = start): void;
    public getSelection(): MiniEditSelection & { value: string; };
    public setSelection(start: number, end: number): void;
    public replaceSelection(text: string): void;
    public historyUp(ifSelectionCorrect?: boolean): void;
    public historyDown(ifSelectionCorrect?: boolean): void;
    public historyPush(line: string): void;
    public handleKey(event: KeyboardEvent): boolean;
    public handleTabComplete(reverse: boolean): boolean;
    public undoTabComplete(): boolean;
    public toggleFormatChar(formatChar: string): boolean;
  }

  interface ChatTextBoxProps {
    placeholder: string;
    disabled?: boolean;
  }

  class ChatTextBox extends Preact.Component<ChatTextBoxProps> {
    public handleFocus: () => void;
    public handleBlur: () => void;
  }

  class ChatPanel extends PSRoomPanel<ChatRoom> {
    public static readonly id = 'chat';
    public static readonly routes = ['dm-*', 'groupchat-*', '*'];
    public static readonly Model = ChatRoom;
    public static readonly location = 'right' as const;
    public static readonly icon: JSX.Element;

    public send: (text: string, element: HTMLElement) => void;
    public onKey: (event: KeyboardEvent) => boolean;
    public makeChallenge: (event: Event, format: string, team?: Team) => void;
    public acceptChallenge: (event: Event, format: string, team?: Team) => void;
  }

  interface ChatUserListProps {
    room: ChatRoom;
    left?: number;
    top?: number;
    minimized?: boolean;
    static?: boolean;
  }

  class ChatUserList extends Preact.Component<ChatUserListProps> {}

  interface ChatLogProps {
    class: string;
    room: ChatRoom;
    left?: number;
    top?: number;
    noSubscription?: boolean;
    children?: React.ReactNode;
  }

  class ChatLog extends Preact.Component<ChatLogProps> {
    public subscription?: PSSubscription = null;

    public setControlsJSX(jsx: React.ReactNode): void;
    public updateScroll(): void;
  }
}

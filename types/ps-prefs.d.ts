/**
 * @file `ps-prefs.d.ts` - Adapted from `pokemon-showdown-client/play.pokemonshowdown.com/src/client-main.ts`.
 * @author Keith Choison <keith@tize.io>
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license APGLv3
 * @since 0.1.0
 */

declare namespace Showdown {
  class PSPrefs extends PSStreamModel<string> {
    /**
     * Theme to use. `'system'` matches the theme of the system accessing the client.
     */
    public theme: ColorSchemeOption = 'light';

    /**
     * Disables animated GIFs, but keeps other animations enabled.
     *
     * * `true` = disables GIFs, will be automatically re-enabled if you switch away from Chrome 64.
     * * `false` = enable GIFs all the time.
     * * `null` = enable GIFs only on Chrome 64.
     *
     * @default null
     */
    public nogif?: boolean = null;

    // gfx prefs
    public noanim?: boolean = null;
    public bwgfx?: boolean = null;
    public nopastgens?: boolean = null;

    // chat prefs
    public blockPMs?: boolean = null;
    public blockChallenges?: boolean = null;
    public inchatpm?: boolean = null;
    public noselfhighlight?: boolean = null;
    public temporarynotifications?: boolean = null;
    public leavePopupRoom?: boolean = null;
    public refreshprompt?: boolean = null;
    public language = 'english';
    public chatformatting = {
      hidegreentext: false,
      hideme: false,
      hidespoiler: false,
      hidelinks: false,
      hideinterstice: true,
    };
    public nounlink?: boolean = null;

    // battle prefs
    public ignorenicks?: boolean = null;
    public ignorespects?: boolean = null;
    public ignoreopp?: boolean = null;
    public autotimer?: boolean = null;
    public rightpanelbattles?: boolean = null;
    public disallowspectators?: boolean = null;
    public starredformats?: { [formatid: string]: boolean; } = null;

    public showdebug?: boolean = null;
    public showbattles = true;

    /**
     * Comma-separated lists of room titles to autojoin. Single `string` is for Main.
     */
    public autojoin?: { [serverid: string]: string; } | string = null;

    /**
     * List of users whose messages should be ignored.
     *
     * * `userid` table.
     * * Uses `1` & `0` instead of `boolean`'s for JSON packing reasons.
     */
    public ignore?: { [userid: string]: 1 | 0; } = null;

    /**
     * * `'hide'` = hide regular display
     * * `'notify'` = notify on new tours
     * * `null` = notify on joined tours
     *
     * @default null
     */
    public tournaments?: 'hide' | 'notify' = null;

    /**
     * Show "User joined" & "User left" messages.
     *
     * * `serverid:roomid` table.
     * * Uses `1` & `0` instead of `boolean`'s for JSON packing reasons.
     */
    public showjoins?: {
      [serverid: string]: {
        [roomid: string]: 1 | 0;
      };
    } = null;

    /**
     * * `true` = one panel
     * * `false` = two panels: left & right
     * * `'vertical'` = left-sided tab strip & big chunga panel
     *
     * @default false
     */
    public onepanel?: boolean | 'vertical' = false;
    public timestamps: { chatrooms?: TimestampOptions; pms?: TimestampOptions; } = {};

    public mute = false;
    public effectvolume = 50;
    public musicvolume = 50;
    public notifvolume = 50;
    public uploadprivacy = false;

    public afd: boolean | 'sprites' = false;

    public highlights?: Record<string, string[]> = null;
    public logtimes?: Record<string, { [roomid: RoomID]: number; }> = null;

    public storageEngine: 'localStorage' | 'iframeLocalStorage' | '' = '';
    public storage: { [k: string]: unknown; } = {};
    public readonly origin: string;

    public set<T extends keyof PSPrefs>(key: T, value: PSPrefs[T]): void;
    public load(newPrefs: object, noSave?: boolean): void;
    public save(): void;
    public fixPrefs(newPrefs: unknown): void;
    public setAFD(mode?: typeof this.afd): void;
    public doAutojoin(): void;
  }
}

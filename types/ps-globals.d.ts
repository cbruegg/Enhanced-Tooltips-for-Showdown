/**
 * @file `ps-globals.d.ts` - `window` globals exposed by the Preact Showdown client.
 * @author Keith Choison <keith@tize.io>
 * @since 1.3.0
 */

declare namespace Showdown {
  interface PSGlobals {
    /**
     * Preact Showdown client's `PS` global.
     *
     * * Typically won't exist when the `__SHOWDEX_HOST` is the `'classic'` (Backbone.js-based) Showdown client.
     *
     * @since 1.3.0
     */
    PS: PS;
    PSBackground: typeof PSBackground;
    PSConnection: typeof PSConnection;
    PSHeader: unknown;
    PSIcon: PSIcon;
    PSLoginServer: typeof PSLoginServer;
    PSMiniHeader: unknown;
    PSModel: typeof PSModel;
    PSPanelWrapper: PSPanelWrapper;
    PSPrefs: typeof PSPrefs;
    PSPrefsDefaults: Record<string, unknown>;
    PSRoom: typeof PSRoom;
    PSRoomPanel: typeof PSRoomPanel;
    PSRouter: typeof PSRouter;
    PSSearchResults: unknown;
    PSServer: typeof PSServer;
    PSStorage: typeof PSStorage;
    PSStreamModel: typeof PSStreamModel;
    PSSubscription: typeof PSSubscription;
    PSTeambuilder: typeof PSTeambuilder;
    PSTeams: typeof PSTeams;
    PSURL: string;
    PSUser: typeof PSUser;
    PSUtils: unknown;
    PSView: typeof PSView;

    BattleDiv: typeof BattleDiv;
    BattleForfeitPanel: typeof BattleForfeitPanel;
    BattleOptionsPanel: typeof BattleOptionsPanel;
    BattlePanel: typeof BattlePanel;
    BattleRoom: typeof BattleRoom;
    BattlesPanel: typeof BattlesPanel;
    BattlesRoom: typeof BattlesRoom;
    ChangePasswordPanel: unknown;
    ChatFormattingPanel: unknown;
    ChatLog: typeof ChatLog;
    ChatPanel: typeof ChatPanel;
    ChatRoom: typeof ChatRoom;
    ChatTextBox: typeof ChatTextBox;
    ChatTextEntry: typeof ChatTextEntry;
    ChatTournament: typeof ChatTournament;
    ChatUserList: typeof ChatUserList;
    CopyableURLBox: typeof CopyableURLBox;
    DetailsForm: unknown;
    FormatDropdown: typeof FormatDropdown;
    FormatDropdownPanel: typeof FormatDropdownPanel;
    GetParams: unknown;
    GooglePasswordBox: unknown;
    HttpError: typeof HttpError;
    LadderFormatPanel: unknown;
    LadderFormatRoom: unknown;
    LadderListPanel: unknown;
    LeaveRoomPanel: unknown;
    LoginPanel: unknown;
    MAX_UNDO_HISTORY: typeof MAX_UNDO_HISTORY;
    MainMenuPanel: typeof MainMenuPanel;
    MainMenuRoom: typeof MainMenuRoom;
    NARROW_MODE_HEADER_WIDTH: number;
    Net: typeof Net;
    NetRequest: typeof NetRequest;
    NewsPanel: typeof NewsPanel;
    OptionsPanel: unknown;
    PageLadderHelp: unknown;
    PagePanel: typeof PagePanel;
    PageRoom: typeof PageRoom;
    PlaceholderRoom: typeof PlaceholderRoom;
    PopupPanel: unknown;
    PopupRoom: unknown;
    preact: Preact.Globals;
    RegisterPanel: unknown;
    ReplacePlayerPanel: unknown;
    ResourcePanel: unknown;
    RoomTabListPanel: unknown;
    RoomsPanel: typeof RoomsPanel;
    RoomsRoom: typeof RoomsRoom;
    RulesPanel: unknown;
    SanitizedHTML: SanitizedHTML;
    StatForm: unknown;
    TeamBox: unknown;
    TeamDropdown: typeof TeamDropdown;
    TeamDropdownPanel: typeof TeamDropdownPanel;
    TeamEditor: unknown;
    TeamEditorState: unknown;
    TeamForm: typeof TeamForm;
    TeamPanel: typeof TeamPanel;
    TeamStoragePanel: typeof TeamStoragePanel;
    TeamTextbox: unknown;
    TeamWizard: unknown;
    TeambuilderPanel: typeof TeambuilderPanel;
    TeambuilderRoom: typeof TeambuilderRoom;
    TimerButton: typeof TimerButton;
    TourPopOutPanel: typeof TourPopOutPanel;
    TournamentBox: typeof TournamentBox;
    TournamentBracket: typeof TournamentBracket;
    TournamentTreeBracket: typeof TournamentTreeBracket;
    UserListPanel: unknown;
    UserOptionsPanel: unknown;
    UserPanel: unknown;
    UserRoom: unknown;
    VERTICAL_HEADER_WIDTH: number;
    ViewTeamPanel: typeof ViewTeamPanel;
    VolumePanel: unknown;
  }
}

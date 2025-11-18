/**
 * @file `host-globals.d.ts` - Common `window` globals exposed by both the classic & Preact Showdown clients.
 * @author Keith Choison <keith@tize.io>
 * @since 1.3.0
 */

declare namespace Showdown {
  /**
   * Exposed `window` globals available on both classic (i.e., Backbone.js) & Preact versions of the Showdown client.
   *
   * * Optionally includes the `app` & `PS` globals for determining the current `__SHOWDEX_HOST`.
   * * Note: `unknown` types indicate I didn't bother typing them any further lol.
   *   - Also not an exhaustive list!
   *
   * @since 1.3.0
   */
  interface HostGlobals {
    app?: Showdown.ClientGlobals['app'];
    PS?: Showdown.PSGlobals['PS'];

    Ability: typeof Ability;
    Battle: typeof Battle;
    BattleAbilities: BattleAbilities;
    BattleAliases: Record<ID, string>;
    BattleArticleTitles: Record<ID, string>;
    BattleAvatarNumbers: Record<`${number}`, string>;
    BattleBackdrops: string[];
    BattleBackdropsFive: string[];
    BattleBackdropsFour: string[];
    BattleBackdropsThree: string[];
    BattleBaseSpeciesChart: string[];
    BattleBGM: BattleBGM;
    BattleCategorySearch: unknown;
    BattleChatCommands: Record<string, string[]>;
    BattleFormats: BattleFormats;
    BattleItemSearch: unknown;
    BattleItems: BattleItems;
    BattleLog: typeof BattleLog;
    BattleMoveAnims: unknown;
    BattleMoveSearch: unknown;
    BattleMovedex: BattleMovedex;
    BattleNatures: Record<NatureName, Partial<Record<'plus' | 'minus', StatNameNoHp>>>;
    BattleOtherAnims: unknown;
    BattlePokedex: Record<ID, Species>;
    BattlePokemonIconIndexes: Record<ID, number>;
    BattlePokemonIconIndexesLeft: Record<ID, number>;
    BattlePokemonSearch: unknown;
    BattlePokemonSprites: Record<ID, unknown>;
    BattlePokemonSpritesBW: Record<ID, unknown>;
    BattleScene: typeof BattleScene;
    BattleSound: BattleSound;
    BattleStatGuesser: typeof BattleStatGuesser;
    BattleStatusAnims: Record<Exclude<PokemonStatus, '???'> | 'attracted' | 'confused' | 'confusedselfhit' | 'cursed' | 'flinch' | 'focuspunch', AnimData>;
    BattleTeambuilderTable: BattleTeambuilderTable;
    BattleText: unknown;
    BattleTextAFD: unknown;
    BattleTextNotAFD: unknown;
    BattleTextParser: BattleTextParser;
    BattleTooltips: BattleTooltips;
    BattleTypeChart: Record<TypeName, Type>;
    BattleTypeSearch: unknown;
    BattleTypedSearch: unknown;
    ColorThief: unknown;
    Config: unknown;
    Dex: Dex;
    DexSearch: unknown;
    Item: typeof Item;
    ModdedDex: ModdedDex;
    ModifiableValue: ModifiableValue;
    Move: typeof Move;
    NonBattleGames: Record<ID, string>;
    Pokemon: Pokemon;
    PokemonSprite: typeof PokemonSprite;
    PureEffect: typeof PureEffect;
    Side: typeof Side;
    Species: typeof Species;
    Sprite: Sprite;
    Teams: unknown;
    TextFormatter: unknown;
  }
}

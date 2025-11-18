/**
 * @file `ps-teams.d.ts` - Adapted from `pokemon-showdown-client/play.pokemonshowdown.com/src/client-main.ts`.
 * @author Keith Choison <keith@tize.io>
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 * @since 0.1.0
 */

declare namespace Showdown {
  interface Team {
    name: string;
    format: ID;
    folder: string;
    /** Note that this can be wrong if `.uploaded?.notLoaded`. */
    packedTeam: string;
    /** Icon cache must be cleared (to `null`) whenever `packedTeam` is modified. */
    iconCache?: React.ReactNode;
    /**
     * Used in roomids (`team-[key]`) to refer to the team.
     *
     * Always persists within a single session, but not always between refreshes.
     * As long as a team still exists, pointers to a Team are equivalent to a key.
     */
    key: string;
    isBox: boolean;
    /**
     * Locally tracked uploaded team ID.
     *
     * * Won't exist for teams that aren't uploaded.
     */
    teamid?: number;
    /** `uploaded` will only exist if you're logged into the correct account; otherwise, `teamid` is still tracked. */
    uploaded?: {
      teamid: number;
      /** `Promise` = loading. */
      notLoaded: boolean | Promise<void>;
      /**
       * Password, if private.
       *
       * * `null` = public.
       * * `undefined` = unknown, not loaded yet.
       */
      private?: string;
    };
    /** Team at the point it was last uploaded outside of `uploaded`, so it can track the loading state. */
    uploadedPackedTeam?: string;
  }

  interface UploadedTeam {
    name: string;
    teamid: number;
    format: ID;
    /** Comma-separated list of species for generating the icon cache. */
    team: string;
    /** Password, if private. */
    private?: string;
  }

  /**
   * Model tracks teams & formats, updating when either is updated.
   */
  class PSTeams extends PSStreamModel<'team' | 'format'> {
    /** `false` if it uses the ladder in the website. */
    public usesLocalLadder = false;
    public list: Team[] = [];
    public byKey: { [key: string]: Team; } = {};
    public deletedTeams: [Team, number][] = [];
    public uploading?: Team = null;

    public teambuilderFormat(format: string): ID;
    public getKey(name: string): string;
    public unpackAll(buffer?: string): void;
    public push(team: Team): void;
    public unshift(team: Team): void;
    public delete(team: Team): false | void;
    public undelete(): void;
    public unpackOldBuffer(buffer: string): void;
    public packAll(teams: Team[]): string;
    public save(): void;
    public unpackLine(line: string): Team;
    public loadRemoteTeams(): void;
    public loadTeam(team?: Team, ifNeeded?: boolean): void | Promise<void>;
    public compareTeams(serverTeam: UploadedTeam, localTeam: Team): boolean;
  }
}

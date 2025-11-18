/**
 * @file `pokemon-species.d.ts` - Adapted from `pokemon-showdown-client/src/battle-dex-data.ts`.
 * @author Keith Choison <keith@tize.io>
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license MIT
 * @since 0.1.0
 */

declare namespace Showdown {
  type SpeciesEvoType =
    | 'trade'
    | 'useItem'
    | 'levelMove'
    | 'levelExtra'
    | 'levelFriendship'
    | 'levelHold'
    | 'other';

  class Species implements Effect {
    public readonly effectType = 'Species' as const;
    public readonly id: ID;
    public readonly name: string;
    public readonly gen: number;
    public readonly exists: boolean;

    // name
    public readonly baseSpecies: string;
    public readonly forme: string;
    public readonly formeid: string;
    public readonly spriteid: string;
    public readonly baseForme: string;

    // basic data
    public readonly num: number;
    public readonly types: readonly TypeName[];
    public readonly abilities: Readonly<Partial<Record<'0' | '1' | 'H' | 'S', string>>>;
    public readonly baseStats: Readonly<Required<StatsTable>>;
    public readonly bst: number;
    public readonly weightkg: number;

    // flavor data
    public readonly heightm: number;
    public readonly gender: GenderName;
    public readonly color: string;
    public readonly genderRatio?: Readonly<Record<Exclude<GenderName, 'N'>, number>>;
    public readonly eggGroups: string[];
    public readonly tags: string[];

    // format data
    public readonly otherFormes?: string[];
    public readonly cosmeticFormes?: string[];
    public readonly evos?: string[];
    public readonly prevo: string;
    public readonly evoType: SpeciesEvoType | '';
    public readonly evoLevel: number;
    public readonly evoMove: string;
    public readonly evoItem: string;
    public readonly evoCondition: string;
    public readonly nfe: boolean; // i.e., Not Fully Evolved
    public readonly requiredItems: string[];
    public readonly tier: string;
    public readonly isTotem: boolean;
    public readonly isMega: boolean;
    public readonly isPrimal: boolean;
    public readonly canGigantamax: boolean;
    public readonly cannotDynamax: boolean;
    public readonly requiredTeraType: TypeName;
    public readonly battleOnly?: string | string[];
    public readonly isNonstandard?: string;
    public readonly unreleasedHidden: boolean | 'Past';
    public readonly changesFrom?: string;

    public constructor(id: ID, name: string, data: unknown);
  }
}

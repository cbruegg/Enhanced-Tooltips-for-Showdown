/**
 * @file `ShowdexHonkdexSettings.ts`
 * @author Keith Choison <keith@tize.io>
 * @since 1.2.0
 */

/**
 * Honkdex-specific settings.
 *
 * @since 1.2.0
 */
export interface ShowdexHonkdexSettings {
  /**
   * Whether the Honkdex is *visually* enabled.
   *
   * * When enabled (default), Honks can be viewed & created in the Hellodex.
   * * Disabling this won't clear any saved Honks.
   *
   * @default true
   * @since 1.2.0
   */
  visuallyEnabled: boolean;

  /**
   * Whether to show all formats in the format dropdown.
   *
   * * When disabled (default), all Randoms & Customs formats will be excluded from the list of options.
   *
   * @default false
   * @since 1.2.0
   */
  showAllFormats: boolean;

  /**
   * Whether to always allow Pokemon types to be edited.
   *
   * * When disabled, the `editPokemonTypes` Calcdex setting will be used.
   *
   * @default true
   * @since 1.2.0
   */
  alwaysEditTypes: boolean;

  /**
   * Whether to expand the stats table to show all stats.
   *
   * * When enabled (default), base stats, IVs & EVs will be shown.
   *   - EVs may be hidden in legacy gens, unless the `showLegacyEvs` Calcdex setting is enabled.
   * * When disabled, the `lockGeneticsVisibility` Calcdex setting will be used.
   *
   * @default true
   * @since 1.2.0
   */
  alwaysShowGenetics: boolean;

  /**
   * Whether to include damage from stage hazards (e.g., *Stealth Rock*) in the NHKO chance.
   *
   * * Unlike the `ShowdexCalcdexSettings` prop of the same name, this is enabled by default to be more consistent with
   *   the behavior of the traditional damage calculator.
   * * Doesn't affect the damage ranges since they're of the attacker's move itself.
   *
   * @default true
   * @since 1.3.0
   */
  includeHazardsDamage: boolean;

  /**
   * Whether to include damage from end-of-turn effects (e.g., *Burned*, *Sandstorm*) in the NHKO chance.
   *
   * * Unlike the `ShowdexCalcdexSettings` prop of the same name, this is enabled by default to be more consistent with
   *   the behavior of the traditional damage calculator.
   * * Doesn't affect the damage ranges since they're of the attacker's move itself.
   *
   * @default true
   * @since 1.3.0
   */
  includeEotDamage: boolean;
}

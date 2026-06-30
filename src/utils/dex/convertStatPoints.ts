/**
 * Champions EV <-> stat point conversion.
 *
 * * Per the PS `champions` mod (`data/mods/champions/scripts.ts`): *"the first stat point gives 4 EVs and the
 *   others give 8 EVs"* -- so `EV = 8*pts - 4` (for `pts > 0`), inverse `pts = (EV + 4) / 8`.
 * * `evToStatPoint()` rounds to the nearest **integer** point, since Champions stat points are always integers
 *   (PS validates 0-32 integers -- there's no "31.5 SPs"). Smogon Champions sets stored with standard EVs not of
 *   the form `8N-4` (e.g. a `248 HP` bulk spread -> `31.5`) would otherwise display fractional points.
 *
 * @since 1.4.0
 */

/** Converts a standard EV (0-252) to a Champions stat point (0-32, rounded to the nearest integer). */
export const evToStatPoint = (ev: number): number => (ev > 0 ? Math.min(Math.round((ev + 4) / 8), 32) : 0);

/** Converts a Champions stat point (0-32) back to its EV-equivalent (0-252) for paste export etc. */
export const statPointToEv = (points: number): number => (points > 0 ? Math.min(Math.round(8 * points - 4), 252) : 0);

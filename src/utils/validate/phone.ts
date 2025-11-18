/**
 * @file `phone.ts`
 * @author Keith Choison <keith@tize.io>
 * @since 1.3.0
 */

const regex = (): RegExp => /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/i;

/**
 * @deprecated This only supports `+1` country codes (i.e., US & Canada), so prefer using the `'phone'` dependency instead.
 *   (Note that as to keep the client bundle sizes low, `'phone'` is not a direct dependency of `@zedz/common`
 *   [i.e., where this is].)
 */
export const validatePhone = (value: string): boolean => regex().test(value);
export const execPhone = (value: string): RegExpExecArray => regex().exec(value);

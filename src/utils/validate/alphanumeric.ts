/**
 * @file `alphanumeric.ts`
 * @author Keith Choison <keith@tize.io>
 * @since 1.3.0
 */

const regex = (): RegExp => /^[a-z0-9]+$/i;

export const validateAlphanumeric = (value: string): boolean => regex().test(value);
export const execAlphanumeric = (value: string): RegExpExecArray => regex().exec(value);

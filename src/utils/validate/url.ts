/**
 * @file `url.ts`
 * @author Keith Choison <keith@tize.io>
 * @since 1.3.0
 */

const regex = (): RegExp => /(?:^|\s)((https?:\/\/)?(?:localhost|[\w-]+(?:\.[\w-]+)+)(:\d+)?(\/\S*)?)/i;

export const validateUrl = (value: string): boolean => regex().test(value);
export const execUrl = (value: string): RegExpExecArray => regex().exec(value);

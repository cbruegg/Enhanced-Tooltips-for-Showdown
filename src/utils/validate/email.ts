/**
 * @file `email.ts`
 * @author Keith Choison <keith@tize.io>
 * @since 1.3.0
 */

const regex = (): RegExp => /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const validateEmail = (value: string): boolean => regex().test(value);
export const execEmail = (value: string): RegExpExecArray => regex().exec(value);

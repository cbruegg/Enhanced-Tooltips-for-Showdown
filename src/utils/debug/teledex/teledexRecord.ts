import { v4 as uuidv4 } from 'uuid';
import { type LoggerLevel } from '../logger';
import { LoggerLevelValues } from '../levelMap';

export interface TeledexRecord {
  id: string;
  ts: number;
  session: string;
  level: LoggerLevel;
  value: number;
  scope: string;
  args: unknown[];
}

/** one id per page-load so flushes can group/separate sessions. */
export const teledexSession: string = uuidv4();

let __seq = 0;

export const buildTeledexRecord = (
  level: LoggerLevel,
  scope: string,
  args: unknown[],
  now = Date.now(),
): TeledexRecord => ({
  id: `${now.toString(36)}-${(__seq++).toString(36)}`,
  ts: now,
  session: teledexSession,
  level,
  value: LoggerLevelValues[level] ?? 0,
  scope: scope || '',
  args: args ?? [],
});

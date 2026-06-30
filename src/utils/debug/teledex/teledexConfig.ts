import { type Duration } from 'date-fns';
import { env } from '@showdex/utils/core/getEnv';

export interface TeledexConfig {
  enabled: boolean;
  maxRecords: number;
  maxAge: Duration;
}

export const resolveTeledexConfig = (overrides?: Partial<TeledexConfig>): TeledexConfig => ({
  enabled: env.bool('teledex-enabled'),
  maxRecords: env.int('teledex-retention-max', 5000),
  maxAge: { [env('teledex-retention-age-unit', 'hours')]: env.int('teledex-retention-age', 24) },
  ...overrides,
});

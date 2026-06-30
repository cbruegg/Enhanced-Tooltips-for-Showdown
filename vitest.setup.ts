/**
 * Vitest setup: load the repo `.env` into `process.env` so env-backed utils (e.g. `getDefaultSpreadValue()`,
 * which reads `CALCDEX_*` defaults via `env()`) resolve real config values under test.
 *
 * * Runs before each test file's imports, so `getEnv.ts` captures the loaded values.
 *
 * @since 1.4.0
 */
import 'dotenv/config';

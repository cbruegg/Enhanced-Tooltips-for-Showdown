import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

/**
 * Lean Vitest config for unit-testing pure utilities.
 *
 * * `node` environment only -- no jsdom/chrome/IndexedDB mocks until a test actually needs them.
 * * `@showdex/*` is resolved manually (single alias, mirrors `tsconfig.json` `paths`) to sidestep
 *   the `vite-tsconfig-paths` -> `tsconfck` peer mismatch w/ TypeScript 6.
 *
 * @since 1.4.0
 */
export default defineConfig({
  resolve: {
    alias: {
      '@showdex': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  define: {
    __DEV__: 'true',
  },
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: ['./vitest.setup.ts'],
    clearMocks: true,
  },
});

#!/usr/bin/env bash
set -euo pipefail

# Showdex v1.4+ requires Node 24 and pnpm.
if [[ -d "/opt/homebrew/opt/node@24/bin" ]]; then
  export PATH="/opt/homebrew/opt/node@24/bin:$PATH"
fi

rm -rf node_modules
pnpm install
pnpm build:chrome

echo "If this produced no output files, run 'pnpm dev:chrome' for more verbose messages."

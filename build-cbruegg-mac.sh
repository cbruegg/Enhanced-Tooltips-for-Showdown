#!/usr/bin/env bash
set -euo pipefail

# Currently this project does not build with Node 19+
export PATH="/opt/homebrew/opt/node@18/bin:$PATH"

rm -rf node_modules
yarn install
yarn build:chrome

echo "If this produced no output files, run 'yarn dev:chrome' for more verbose messages."

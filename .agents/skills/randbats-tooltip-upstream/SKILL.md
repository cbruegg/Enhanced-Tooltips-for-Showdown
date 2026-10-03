---
name: randbats-tooltip-upstream
description: Use when updating this fork's bundled Pokémon Showdown Randbats Tooltip from a pkmn/randbats release. Sync only src/index-randbats.js; use showdex-upstream-release for Showdex updates.
---

# Randbats Tooltip upstream update

The bundled script is `src/index-randbats.js`. Its upstream source is [`pkmn/randbats/extension/index.js`](https://github.com/pkmn/randbats/blob/main/extension/index.js). Showdex loads the bundled script from `src/main.ts`; the Randbats set data is fetched at runtime and is not vendored here.

1. Inspect `git status --short` and the current bundled file. Preserve unrelated work.
2. Verify the newest appropriate **published Randbats Tooltip release** at <https://github.com/pkmn/randbats/releases/latest>, then inspect `extension/index.js` at that exact tag. Check the direct release page rather than relying on a cached release list. If the user names a tag, use that tag.
3. Compare the tagged script with `src/index-randbats.js`. Apply its relevant script changes to **that file only**, preserving any intentional fork-specific behavior and checking the complete diff. Do not copy generated data, extension manifests, assets, or changes from the `main` branch merely because they are newer than the release.
4. Validate with `node --check src/index-randbats.js` and `git diff --check`. Run a focused behavior check or browser-extension build when the code change warrants it. Report any untested runtime behavior.
5. Report the source tag, what changed, validation, and working-tree state. Commit only when the user requests a commit. Do not push unless explicitly asked.

This workflow does not bump package or Xcode versions, build Xcode targets, or tag a fork release. A Showdex update uses the separate `showdex-upstream-release` skill.

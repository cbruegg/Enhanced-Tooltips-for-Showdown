---
name: showdex-upstream-release
description: Use when merging a new upstream showdex release tag into this Safari-wrapper fork, resolving README/package conflicts, validating dist output, bumping Xcode versions, and tagging the fork release.
---

# Showdex Upstream Release Merge

Use this skill when the user asks to merge a newly released upstream `showdex` tag into this fork of `Enhanced-Tooltips-for-Showdown` and perform the Safari-wrapper follow-up work.

## Goals

1. Merge the latest upstream `showdex` release tag into this fork.
2. Preserve this fork's project identity and rewritten README.
3. Ensure the browser-extension build produces fresh `dist/` output consumed by the Xcode project.
4. Commit any required build fixes before bumping the Xcode app version.
5. Make the Xcode version bump the final release commit and place the fork release tag on that commit.

## Important repository conventions

- Upstream remote: `upstream` (`https://github.com/doshidak/showdex.git`).
- Fork remote: `origin`.
- Local branch is usually `master`.
- The fork README is intentionally rewritten; when README conflicts, usually keep this fork's README.
- `package.json` should keep this fork's identity fields:
  - `name`: `pokemon-showdown-enhanced-tooltips-safari`
  - `description`: `Displays additional information on tooltips of Pokémon Showdown. Additionally it provides a damage calculator.`
  - `author`: `Various Authors`
  - `homepage`: `https://github.com/cbruegg/Enhanced-Tooltips-for-Showdown`
  - repository/bugs URLs should point at this fork when present.
- Upstream dependency/tooling changes should generally be accepted, while preserving the fork identity above.
- `build-cbruegg-mac.sh` is the primary browser-extension build validation command.
- The Xcode project references files from `dist/`, especially `dist/chrome`.
- Do not push commits/tags unless explicitly asked.

## Workflow

### 1. Inspect current state

Before changing anything:

```bash
git status --short --branch
git remote -v
git log --oneline --decorate -10
git tag --list --sort=-creatordate
```

Confirm the working tree is clean. If not clean, ask before proceeding.

### 2. Fetch upstream and identify the tag

```bash
git fetch upstream --tags --prune
git tag --list --sort=-creatordate
git show --no-patch --oneline --decorate <upstream-tag>
```

Use the latest appropriate upstream release tag. If there are multiple plausible release lines, ask the user which tag to merge.

### 3. Merge upstream normally

Use a normal merge, not squash or rebase:

```bash
git merge <upstream-tag>
```

If conflicts occur, inspect them and resolve intentionally.

Typical conflict handling:

- `README.md`: keep ours unless the user says otherwise.
- `package.json`: take upstream dependency/tooling/script changes, but restore this fork's identity fields.
- Lockfile changes: if upstream migrates package managers, follow upstream's current lockfile/tooling. For example, v1.4.0 moved from Yarn to pnpm, so `yarn.lock` was deleted and `pnpm-lock.yaml` kept.
- Build script: update `build-cbruegg-mac.sh` to use the package manager and Node version required by the merged upstream code.

After resolving conflicts:

```bash
git diff --check
git status --short
```

Stage the merge resolution and create a merge commit such as:

```bash
git commit -m "Merge tag '<upstream-tag>'"
```

### 4. Validate the browser-extension build before Xcode version bump

Run:

```bash
./build-cbruegg-mac.sh
```

Then verify fresh output exists:

```bash
ls -la dist
ls -la dist/chrome
```

Expected output includes `dist/chrome` and usually a Chrome zip/html artifact in `dist/`.

Do not rely only on a friendly build message. Webpack can call back with `stats.hasErrors()` even when the script's `err` argument is empty. If the build script reports success but `dist/chrome` is missing, inspect webpack stats/errors and fix the real issue.

If build fixes are needed, commit them before the Xcode version bump, for example:

```bash
git commit -m "Fix Chrome build after <upstream-tag> merge"
```

### 5. Bump Xcode versions after build fixes

Only after the merge and any build-fix commits are done, update the Xcode project version in:

```text
src/safari/Pokemon Showdown Enhanced Tooltips/Enhanced Tooltips for Showdown.xcodeproj/project.pbxproj
```

Update all build configurations:

- `CURRENT_PROJECT_VERSION`: increment by 1.
- `MARKETING_VERSION`: increment the fork release version, e.g. `2.13` → `2.14`.

Verify all occurrences changed consistently:

```bash
grep -n "CURRENT_PROJECT_VERSION = " "src/safari/Pokemon Showdown Enhanced Tooltips/Enhanced Tooltips for Showdown.xcodeproj/project.pbxproj"
grep -n "MARKETING_VERSION = " "src/safari/Pokemon Showdown Enhanced Tooltips/Enhanced Tooltips for Showdown.xcodeproj/project.pbxproj"
```

Commit the version bump last:

```bash
git add "src/safari/Pokemon Showdown Enhanced Tooltips/Enhanced Tooltips for Showdown.xcodeproj/project.pbxproj"
git commit -m "v<fork-version>"
```

The intended final order is:

```text
v<fork-version>                         # final commit, Xcode version bump
Fix Chrome build after <tag> merge       # if needed
Merge tag '<upstream-tag>'
```

### 6. Validate Xcode wrapper builds

At minimum list schemes:

```bash
xcodebuild -list -project "src/safari/Pokemon Showdown Enhanced Tooltips/Enhanced Tooltips for Showdown.xcodeproj"
```

Useful validation commands with signing disabled:

```bash
xcodebuild \
  -project "src/safari/Pokemon Showdown Enhanced Tooltips/Enhanced Tooltips for Showdown.xcodeproj" \
  -scheme "Enhanced Tooltips for Showdown (macOS)" \
  -configuration Release \
  -derivedDataPath "/var/folders/ns/z1yglh496fq45tcvsq93_25h0000gn/T/opencode/EnhancedTooltipsDerivedData" \
  CODE_SIGNING_ALLOWED=NO \
  build

xcodebuild \
  -project "src/safari/Pokemon Showdown Enhanced Tooltips/Enhanced Tooltips for Showdown.xcodeproj" \
  -scheme "Enhanced Tooltips for Showdown (iOS)" \
  -configuration Release \
  -destination "generic/platform=iOS Simulator" \
  -derivedDataPath "/var/folders/ns/z1yglh496fq45tcvsq93_25h0000gn/T/opencode/EnhancedTooltipsDerivedData-iOS" \
  CODE_SIGNING_ALLOWED=NO \
  build
```

### 7. Tag the fork release

Only tag after successful browser-extension and Xcode validation.

The tag should point to the final `v<fork-version>` commit, not to an earlier merge or build-fix commit:

```bash
git tag v<fork-version>
git show --no-patch --oneline --decorate v<fork-version>
```

If the tag was created too early and has not been pushed, rewrite local history or move the tag so the final order is correct. For example, if the version commit and build-fix commit were accidentally reversed:

```bash
git reset --hard <merge-commit>
git cherry-pick <build-fix-commit>
git cherry-pick <version-commit>
git tag -f v<fork-version> HEAD
```

Ask before rewriting if anything may already have been pushed or shared.

### 8. Final report

Report:

- upstream tag merged
- merge commit hash
- build-fix commit hash, if any
- Xcode version commit hash
- tag name and target commit
- build validations performed
- final `git status --short --branch`

Do not push unless explicitly requested.

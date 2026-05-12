# CLAUDE.md

Working notes for Claude Code sessions on this repo. Keep tight — only things that aren't obvious from reading the code.

## What this is

Spotify Organiser — a React SPA that helps users clean up and organise their Spotify playlists. Single-user PWA, deployed to Firebase Hosting at https://spotify-organiser.web.app/. Uses Firebase Realtime Database (`database.rules.json`) and Firebase Auth for login.

## Stack

- **Runtime:** Node 24 (`.nvmrc`), Yarn 4.7 via Corepack (`packageManager` in `package.json`). Always `corepack enable` before `yarn`.
- **Build:** Vite 6 (migrated from webpack in commit `bb4fd8b`). Dev server on port 1337.
- **Framework:** React 19 + TypeScript (strict). JSX runtime: `react-jsx`.
- **State:** Redux (legacy `createStore`) + redux-saga + redux-persist (localforage backend, `whitelist: ['user']`) + redux-first-history. Reducers in `src/reducers/`, sagas in `src/sagas/`, action creators in `src/actions/`. Sagas use `typed-redux-saga` for type-safe effects.
- **Styling:** Tailwind 3 + SCSS. Stylelint for `.scss`.
- **Lint + format:** [Biome](https://biomejs.dev) (`biome.jsonc`) — one tool for both, replaced ESLint + Prettier (migrated in this branch). `yarn lint` = `biome check .` (lint + format-check + import-sort); `yarn lint:fix` = `biome check --fix .`; `yarn format` = `biome format --write .`. Biome owns `.ts`/`.tsx`/`.js`/`.jsx`/`.json`/`.jsonc`/`.html`; SCSS stays on Stylelint (Biome's CSS parser doesn't grok SCSS syntax). `a11y` rules are turned off (weren't enforced before); `noExplicitAny`/`noDoubleEquals`/`noArrayIndexKey`/`noNonNullAssertion` off to match the old config.
- **Testing:** Vitest + Testing Library + jsdom. `__tests__/` at repo root, `__mocks__/` for module mocks. Coverage exists (`yarn test:cover`) but is commented out in CI.
- **PWA:** `vite-plugin-pwa` with `registerType: 'prompt'` — see `src/components/ReloadPrompt.tsx`.

## Path alias

`~/*` → `./src/*` (configured in both `tsconfig.json` and `vite.config.ts`). Prefer this over relative paths in `src/`.

## Conventions

- **Code style** (enforced by Biome — `yarn lint:fix` auto-fixes): tabs width 4, no semicolons, single quotes, JSX double quotes, `arrowParens: asNeeded`, `trailingCommas: none`, line width 120 (2-space for `*.yml`/`package.json`). No space before function parens (Biome can't do `foo ()` — the old ESLint style; the migration reformatted accordingly).
- **Commits:** Conventional Commits, enforced by commitlint via `.husky/commit-msg`. `feat:` / `fix:` drive semantic-release.
- **Releases:** `semantic-release` on `master`. The deploy workflow runs `scripts/semver.sh` first to compute the next version, injects it as `PACKAGE_VERSION` env var into the Vite build, deploys, then runs `yarn release` to publish the GitHub release. Skipping `feat:`/`fix:` commits means no version bump and no release.
- **Pre-push hook:** runs `yarn lint` and `yarn stylelint`. Do not bypass with `--no-verify`.

## Conductor

`conductor.json` defines `setup` (`corepack enable && yarn install --immutable`), `run` (`yarn dev`), and `archive` (rm `node_modules dist .firebase`). No env files to copy — Firebase/Spotify config is baked in via `package.json` env vars at build time, so new workspaces should `yarn dev` cleanly after setup.

## Gotchas

- **Husky hooks need `node_modules`.** Fresh clones / worktrees must `yarn --immutable` before the first commit/push, or commit-msg/pre-push will fail with "Couldn't find the node_modules state file".
- **`yarn lint` (Biome) covers the whole repo** — including `scripts/`, configs, tests. Native binary; CI installs the right platform build via `yarn --immutable` (all platforms are in `yarn.lock`).
- **`react-spring` peer dep mismatch** with React 19 is expected (warning, not error). Don't try to "fix" it by downgrading React.
- **Redux store uses `legacy_createStore`**, not Redux Toolkit. Persist whitelist is intentionally `['user']` only — playlists are refetched from Spotify.
- **`process.env.PACKAGE_VERSION`** is replaced at build time via Vite `define`. Local dev shows `-local`; preview builds get `-beta`; prod gets the semantic-release version.
- **Service worker:** `cleanupOutdatedCaches: true` + 10MB cache cap. `sw.js` is served with `no-cache` headers (see `firebase.json`).

## Commands

| Task             | Command                                     |
| ---------------- | ------------------------------------------- |
| Dev server       | `yarn dev`                                  |
| Production build | `yarn prod` (alias for `yarn build`)        |
| Tests            | `yarn test` (single run), `yarn test:watch` |
| Lint + format    | `yarn lint` (check) / `yarn lint:fix` (Biome) |
| Format only      | `yarn format` (Biome — write)               |
| Lint SCSS        | `yarn stylelint`                            |

## CI

- `.github/workflows/preview.yml` — PR preview: lint, build, deploy to a Firebase preview channel (`pr-N`, expires 7d), comment URL on the PR.
- `.github/workflows/deploy.yml` — push to `master`: lint, compute version, build, deploy hosting + database rules, publish release.
- `.github/workflows/codeql-analysis.yml` — security scanning.

All Node workflows pin `node-version: 24.x`, run `corepack enable`, then `yarn --immutable`. Yarn cache is wired through `actions/setup-node@v4`'s `cache: 'yarn'`.

**After opening a PR, wait for checks before declaring it done.** Branch protection does _not_ currently enforce required status checks on this repo, so a failing preview can be merged anyway — and the production deploy on `master` will then fail on the same step (PR #82 broke prod lint this way). Poll with `gh pr checks <N> --watch` until the preview workflow goes green. The preview runs the same `yarn lint` / `yarn stylelint` / `yarn prod` steps as the deploy workflow, so a red preview guarantees a red production deploy.

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
- **Testing:** Vitest + Testing Library + jsdom. `__tests__/` at repo root, `__mocks__/` for module mocks. Coverage exists (`yarn test:cover`) but is commented out in CI.
- **PWA:** `vite-plugin-pwa` with `registerType: 'prompt'` — see `src/components/ReloadPrompt.tsx`.

## Path alias

`~/*` → `./src/*` (configured in both `tsconfig.json` and `vite.config.ts`). Prefer this over relative paths in `src/`.

## Conventions

- **Prettier:** tabs (width 4), no semicolons, single quotes, `printWidth: 120`, `arrowParens: avoid`, `trailingComma: none`. YAML/`.prettierrc` use spaces (2). Don't fight these — `yarn format` enforces.
- **Commits:** Conventional Commits, enforced by commitlint via `.husky/commit-msg`. `feat:` / `fix:` drive semantic-release.
- **Releases:** `semantic-release` on `master`. The deploy workflow runs `scripts/semver.sh` first to compute the next version, injects it as `PACKAGE_VERSION` env var into the Vite build, deploys, then runs `yarn release` to publish the GitHub release. Skipping `feat:`/`fix:` commits means no version bump and no release.
- **Pre-push hook:** runs `yarn lint` and `yarn stylelint`. Do not bypass with `--no-verify`.

## Gotchas

- **Husky hooks need `node_modules`.** Fresh clones / worktrees must `yarn --immutable` before the first commit/push, or commit-msg/pre-push will fail with "Couldn't find the node_modules state file".
- **`yarn lint` covers `src` + `vite.config.ts` only** — other root TS files (e.g. `scripts/migrate.ts`) aren't linted.
- **`react-spring` peer dep mismatch** with React 19 is expected (warning, not error). Don't try to "fix" it by downgrading React.
- **Redux store uses `legacy_createStore`**, not Redux Toolkit. Persist whitelist is intentionally `['user']` only — playlists are refetched from Spotify.
- **`process.env.PACKAGE_VERSION`** is replaced at build time via Vite `define`. Local dev shows `-local`; preview builds get `-beta`; prod gets the semantic-release version.
- **Service worker:** `cleanupOutdatedCaches: true` + 10MB cache cap. `sw.js` is served with `no-cache` headers (see `firebase.json`).

## Commands

| Task | Command |
|---|---|
| Dev server | `yarn dev` |
| Production build | `yarn prod` (alias for `yarn build`) |
| Tests | `yarn test` (single run), `yarn test:watch` |
| Lint TS | `yarn lint` |
| Lint SCSS | `yarn stylelint` |
| Format | `yarn format` (write) / `yarn format:check` |

## CI

- `.github/workflows/preview.yml` — PR preview: lint, build, deploy to a Firebase preview channel (`pr-N`, expires 7d), comment URL on the PR.
- `.github/workflows/deploy.yml` — push to `master`: lint, compute version, build, deploy hosting + database rules, publish release.
- `.github/workflows/codeql-analysis.yml` — security scanning.

All Node workflows pin `node-version: 24.x`, run `corepack enable`, then `yarn --immutable`. Yarn cache is wired through `actions/setup-node@v4`'s `cache: 'yarn'`.

**After opening a PR, wait for checks before declaring it done.** Branch protection does *not* currently enforce required status checks on this repo, so a failing preview can be merged anyway — and the production deploy on `master` will then fail on the same step (PR #82 broke prod lint this way). Poll with `gh pr checks <N> --watch` until the preview workflow goes green. The preview runs the same `yarn lint` / `yarn stylelint` / `yarn prod` steps as the deploy workflow, so a red preview guarantees a red production deploy.

# CLAUDE.md

Working notes for Claude Code sessions on this repo. Keep tight — only things that aren't obvious from reading the code.

## What this is

Spotify Organiser — a React SPA that helps users clean up and organise their Spotify playlists. Single-user PWA, deployed as a Cloudflare Pages project at https://spotify-organiser.pages.dev/ (adluna.no Cloudflare account). The project lives in `workers/`: Pages serves the SPA, and a Pages Function serves the tRPC API, the OAuth server and the remote MCP server. Play and skip counts live in D1. Moved off Firebase (Hosting, Realtime Database, anonymous Auth) in Oct 2026.

## Stack

- **Runtime:** Node 24 (`.nvmrc`), Yarn 4.7 via Corepack (`packageManager` in `package.json`). Always `corepack enable` before `yarn`.
- **Build:** Vite 6 (migrated from webpack in commit `bb4fd8b`). Dev server on port 1337. Builds into `workers/dist`, which the Pages project deploys.
- **Framework:** React 19 + TypeScript (strict). JSX runtime: `react-jsx`.
- **State:** Redux (legacy `createStore`) + redux-saga + redux-persist (localforage backend, `whitelist: ['user']`) + redux-first-history. Reducers in `src/reducers/`, sagas in `src/sagas/`, action creators in `src/actions/`. Sagas use `typed-redux-saga` for type-safe effects.
- **Styling:** Tailwind 3 + SCSS. Stylelint for `.scss`.
- **Lint + format:** [Biome](https://biomejs.dev) (`biome.jsonc`) — one tool for both, replaced ESLint + Prettier (migrated in this branch). `yarn lint` = `biome check .` (lint + format-check + import-sort); `yarn lint:fix` = `biome check --fix .`; `yarn format` = `biome format --write .`. Biome owns `.ts`/`.tsx`/`.js`/`.jsx`/`.json`/`.jsonc`/`.html`; SCSS stays on Stylelint (Biome's CSS parser doesn't grok SCSS syntax). `a11y` rules are turned off (weren't enforced before); `noExplicitAny`/`noDoubleEquals`/`noArrayIndexKey`/`noNonNullAssertion` off to match the old config.
- **Testing:** Vitest + Testing Library + jsdom. `__tests__/` at repo root, `__mocks__/` for module mocks. Coverage exists (`yarn test:cover`) but is commented out in CI.
- **PWA:** `vite-plugin-pwa` with `registerType: 'prompt'` — see `src/components/ReloadPrompt.tsx`.
- **Backend:** `workers/` is a Yarn workspace (`spotify-organiser-workers`) and a Cloudflare Pages project: `functions/[[path]].ts` runs `src/index.ts` for the paths in `public/_routes.json`. Same stack as Macromaxxing (Pages Functions, Hono, D1, tRPC, MCP SDK v1 stateless transport + `CfWorkerJsonSchemaValidator`, MCP tools derived from the tRPC router), except auth: `@cloudflare/workers-oauth-provider` instead of Clerk, with Spotify sign-in through the same Spotify client ID (PKCE, no secret). No personal access tokens. The SPA calls the API through `src/utils/api.ts` (`@trpc/client`, typed from `workers/src/lib/router`) with its Spotify access token; the Worker checks it with Spotify `/me`. See `workers/README.md`.

## Path alias

`~/*` → `./src/*` (configured in both `tsconfig.json` and `vite.config.ts`). Prefer this over relative paths in `src/`.

## Conventions

- **Code style** (enforced by Biome — `yarn lint:fix` auto-fixes): tabs width 4, no semicolons, single quotes, JSX double quotes, `arrowParens: asNeeded`, `trailingCommas: none`, line width 120 (2-space for `*.yml`/`package.json`). No space before function parens (Biome can't do `foo ()` — the old ESLint style; the migration reformatted accordingly).
- **Commits:** Conventional Commits, enforced by commitlint via `.husky/commit-msg`. `feat:` / `fix:` drive semantic-release.
- **Releases:** `semantic-release` on `master`. The deploy workflow runs `scripts/semver.sh` first to compute the next version, injects it as `PACKAGE_VERSION` env var into the Vite build, deploys, then runs `yarn release` to publish the GitHub release. Skipping `feat:`/`fix:` commits means no version bump and no release.
- **Pre-push hook:** runs `yarn lint` and `yarn stylelint`. Do not bypass with `--no-verify`.

## Conductor

`conductor.json` defines `setup` (`corepack enable && yarn install --immutable`), `run` (`yarn dev`), and `archive` (rm `node_modules`, `workers/dist`, `workers/.wrangler`). No env files to copy — the Spotify client ID is baked in, so new workspaces should `yarn dev` cleanly after setup. The API and OAuth paths need the Worker running too (see Commands).

## Gotchas

- **Husky hooks need `node_modules`.** Fresh clones / worktrees must `yarn --immutable` before the first commit/push, or commit-msg/pre-push will fail with "Couldn't find the node_modules state file".
- **`yarn lint` (Biome) covers the whole repo** — including `scripts/`, configs, tests. Native binary; CI installs the right platform build via `yarn --immutable` (all platforms are in `yarn.lock`).
- **`react-spring` peer dep mismatch** with React 19 is expected (warning, not error). Don't try to "fix" it by downgrading React.
- **Redux store uses `legacy_createStore`**, not Redux Toolkit. Persist whitelist is intentionally `['user']` only — playlists are refetched from Spotify.
- **`process.env.PACKAGE_VERSION`** is replaced at build time via Vite `define`. Local dev shows `-local`; preview builds get `-beta`; prod gets the semantic-release version.
- **Service worker:** `cleanupOutdatedCaches: true` + 10MB cache cap. `sw.js` is served with `no-cache` headers (see `public/_headers`).
- **Worker paths live in two places:** `public/_routes.json` (which paths reach the Pages Function) and `WORKER_PATHS` in `vite.config.ts` (dev proxy + the service worker's `navigateFallbackDenylist`). Keep them in sync. Without the denylist, an installed PWA answers `/authorize` and `/callback` with the app shell and MCP sign-in breaks. Workbox matches the denylist against pathname + query string.
- **Workspaces:** the root package is `private: true` because Yarn requires it for `workspaces`. Root Vitest excludes `workers/**`; the Worker has its own Vitest config. The root `tsconfig.json` lists `@cloudflare/workers-types` because the `AppRouter` type import pulls Worker files into the app's type graph (Macromaxxing does the same).
- **MCP tokens are bound to the origin.** The Worker builds one OAuth provider per request origin, so a new origin (custom domain, `127.0.0.1:8788` in dev) needs its own `<origin>/callback` redirect URI in the Spotify dashboard. Spotify rejects `localhost` redirect URIs, so dev runs on `127.0.0.1`.
- **MCP tools come from tRPC.** Only procedures in `workers/src/lib/routes/` with `.meta({ description })` become tools (`namespace_method`). Annotations are derived from the procedure type and method prefix (`mcp-tools.ts`); override with `.meta()` when the name misleads (e.g. `playlist.reorder` is a relative move, so `idempotent: false`). Keep `.input()` a bare `z.object`: a wrapped schema publishes no properties, which `unwrapInputSchema` guards against.
- **Stateless MCP:** `GET`/`DELETE /mcp` answer 405 before the SDK runs. A stateless SSE stream never writes and trips Cloudflare's hang detector.
- **Play and skip counts:** D1 table `track_stats` (`workers/migrations/`), one row per user, context URI and track. The SPA loads them once at login (`stats.all` → Redux `stats`) and counts new plays and skips locally, then writes them in the background (`stats.record`). There is no live sync between devices.
- **Worker tests:** wrangler's `createTestHarness` runs Workers, not Pages projects, so `workers/test/wrangler.jsonc` runs `src/index.ts` directly and the tests apply D1 migrations with `applyD1Migrations`. `harness.fetch()` downgrades `https` URLs to `http`; use `harness.getWorker().fetch()`. The fake Spotify gets wired in through the `SPOTIFY_ACCOUNTS_URL` / `SPOTIFY_API_URL` vars.

## Commands

| Task             | Command                                     |
| ---------------- | ------------------------------------------- |
| Dev server       | `yarn dev`                                  |
| Production build | `yarn prod` (alias for `yarn build`)        |
| Tests            | `yarn test` (single run), `yarn test:watch` |
| Lint + format    | `yarn lint` (check) / `yarn lint:fix` (Biome) |
| Format only      | `yarn format` (Biome — write)               |
| Lint SCSS        | `yarn stylelint`                            |
| Worker (API, OAuth, MCP) | `yarn workspace spotify-organiser-workers dev` (port 8788; needs `yarn prod` once) / `test` / `typecheck` |
| Local D1         | `yarn workspace spotify-organiser-workers db:migrate` |

## CI

- `.github/workflows/preview.yml` — PR preview: lint, Worker typecheck + tests, build, deploy to `pr-<N>.spotify-organiser.pages.dev`, comment URL on the PR. Skips the deploy (with a notice) without `CLOUDFLARE_API_TOKEN`. Spotify sign-in doesn't work on previews: Spotify needs every redirect URI listed in advance.
- `.github/workflows/deploy.yml` — push to `master`: lint, Worker typecheck + tests, compute version, build, apply D1 migrations, `wrangler pages deploy --branch master`, publish release. Needs the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets.
- `.github/workflows/codeql-analysis.yml` — security scanning.

All Node workflows pin `node-version: 24.x`, run `corepack enable`, then `yarn --immutable`. Yarn cache is wired through `actions/setup-node@v4`'s `cache: 'yarn'`.

**After opening a PR, wait for checks before declaring it done.** Branch protection does _not_ currently enforce required status checks on this repo, so a failing preview can be merged anyway — and the production deploy on `master` will then fail on the same step (PR #82 broke prod lint this way). Poll with `gh pr checks <N> --watch` until the preview workflow goes green. The preview runs the same `yarn lint` / `yarn stylelint` / `yarn prod` steps as the deploy workflow, so a red preview guarantees a red production deploy.

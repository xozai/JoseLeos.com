---
name: test-triage-fix
description: Autonomous QA loop for CivicSecondBrain — generate new tests against high-risk modules, run the full gate suite (lint, Vitest, build/type-check, Playwright smoke), file GitHub issues for confirmed failures, prioritize, fix by priority with regression tests, and iterate until green. Use when the user says "test the latest and fix what's broken", "run a full QA pass", "file issues for failures and fix by priority", or "iterate until the suite is green".
---

# Test → Triage → Fix Loop (CivicSecondBrain)

Runs a closed loop: generate real Vitest tests for under-covered, high-risk
code → run the full quality-gate suite → for every genuine (non-flaky,
non-pre-existing) failure, file a GitHub issue with repro → prioritize by
severity → fix the highest priority first with a regression test → re-run
gates → repeat until everything is green or the iteration cap is hit. Every
fix follows this repo's existing conventions (Vitest + `vi.resetModules()`
pattern, wiki YAML quoting rules, manifest mutex, etc.) — this skill never
introduces a new test framework or weakens an assertion to make it pass.

## When to Use

- "Test the latest changes and fix what's broken"
- "Run a full QA pass on the repo and iterate until it's green"
- "File issues for any failures you find and fix them by priority"
- "Give the ingest/wiki/auth code a thorough test pass"

## When NOT to Use

- A single already-known bug with a clear fix — just fix it directly, no
  need for the full loop/triage machinery.
- Pure questions, code review, or refactors with no behavior change.
- Changes to shared infra (Railway volume, `INGEST_SECRET` rotation,
  scheduled-ingest cron, branch protection) — those need human review before
  anything is touched, let alone looped on.

## Repository Facts (verify before relying on them)

- **Stack**: Next.js 16.2.7 (App Router) + React 18 + TypeScript 5 (strict
  mode), Node 22 locally / Node 20 in CI. Anthropic SDK (`@anthropic-ai/sdk`)
  drives ingest/query/lint/briefing. Verified from `package.json` and
  `tsconfig.json` on 2026-07-19.
- **Test frameworks**: Vitest 4 for unit/integration tests
  (`app/__tests__/*.test.ts`, config in `vitest.config.ts` — `environment:
  "node"`, `globals: true`, 15s timeout). Playwright 1.61 for e2e smoke
  (`e2e/*.spec.ts`, config in `playwright.config.ts`). Do not introduce a
  new framework — extend these.
- **Vitest quirk**: module-level constants (`WIKI_PATH`, `MANIFEST_PATH`,
  etc.) are read once at import time from env vars. Every existing test file
  uses the pattern: `vi.resetModules()` inside a helper, then dynamic
  `import(...)` **after** setting `process.env.WIKI_PATH` (or similar) in
  `beforeEach`, with `fs.rmSync` cleanup in `afterEach` against a
  `fs.mkdtempSync(os.tmpdir())` fixture dir. See
  [wiki-reader.test.ts](../../../app/__tests__/wiki-reader.test.ts) for the
  canonical example. New tests touching `WIKI_PATH`/`RAW_SOURCES_PATH`/
  manifest paths MUST follow this pattern or they will silently read stale
  module state.
- **Playwright quirk**: `e2e/` and `playwright.config.ts` are excluded from
  `tsconfig.json` specifically so `tsc`/`next build` don't need
  `@playwright/test` types — don't "fix" that exclusion. The e2e suite's
  `webServer` runs `npm run build && npm start` itself and never receives
  `ANTHROPIC_API_KEY` (smoke tests must not exercise AI-dependent paths);
  `reuseExistingServer` is true outside CI.
- **High-risk modules to prioritize for new test coverage** (per
  `CLAUDE.md` architecture + `app/lib/manifest.ts` inspection):
  - `app/lib/manifest.ts` — atomic manifest read/write, `needsIngestion`,
    `markIngested`, `fileChecksum`, `docId`. Workers share a Promise-chain
    mutex for manifest writes — a race here causes duplicate/lost ingest
    records.
  - `app/lib/auth.ts`, `app/api/admin/**`, `app/api/export/**` — auth
    gating; `f2f7d31` recently added auth to `/api/export/*`, so this is a
    recently-changed, security-sensitive area.
  - `app/lib/wiki/writer.ts` — YAML frontmatter quoting (`title`,
    `last_updated`), a documented past source of parse bugs.
  - `app/lib/wiki/reader.ts` — auto-repair for malformed YAML frontmatter.
  - `app/lib/wiki/select.ts` — TF-IDF/keyword page selection shared by
    QUERY and BRIEFING; wrong ranking silently degrades answer quality
    rather than crashing, so it's easy to miss without tests.
  - `app/lib/scraper/*.ts` — `Promise.allSettled` discovery and
    cookie-authenticated Laserfiche JSON API; partial-failure handling.
  - `app/lib/parser/pdf-parser.ts` — file-size skip threshold, xlsx/docx
    stub path.
- **Auth on POST routes**: `/api/ingest`, `/api/lint`, `/api/briefing`
  (and now `/api/export/*`, per `CLAUDE.md`) require
  `Authorization: Bearer <INGEST_SECRET>` when `INGEST_SECRET` is set; open
  in dev if unset. Any new test/fix touching these routes must preserve
  that gate — never weaken it to make a test pass.
- **Gitignored / off-limits paths** — never read, write, or commit:
  `raw-sources/`, `chat-log/`, `wiki/decisions/`, `wiki/log.md`,
  `wiki/people/`, `wiki/queries/`, `wiki/recommendations/`, `wiki/topics/`,
  `.env`, `.env.local`, `.env.*.local`. Only `wiki/SCHEMA.md` and
  `wiki/index.md` are committed seed files. Tests must use
  `fs.mkdtempSync(os.tmpdir())` fixtures and point `WIKI_PATH`/
  `RAW_SOURCES_PATH` env vars at them — never touch the real `wiki/` or
  `raw-sources/` dirs.
- **Issue tracker**: `gh` CLI is authenticated (`xozai/CivicSecondBrain`).
  Labels that exist today (verified 2026-07-19): `bug`, `documentation`,
  `enhancement`, `security`, `performance`, `ux`, `devops`,
  `priority: high`, `priority: medium`, `priority: low`, plus standard
  `dependencies`/`github_actions`/`javascript`. There is **no** `P0`-style
  or `needs-triage` label yet — create `needs-triage` with `gh label create`
  the first time it's needed (verify it doesn't already exist first).
- **Commit convention**: Conventional Commits, enforced by the `PR Title`
  workflow (`amannn/action-semantic-pull-request`) — types: `feat`, `fix`,
  `docs`, `refactor`, `test`, `chore`, `perf`, `ci`, `style`, `build`.
  Release automation is `release-please`, so commit messages matter beyond
  style — use `fix: … (closes #N)` / `test: …` correctly.

## Commands

| Purpose | Command |
|---|---|
| Install deps | `npm ci` |
| Baseline / full unit+integration suite | `npm test` |
| Watch mode | `npm run test:watch` |
| Single test file | `npx vitest run app/__tests__/<file>.test.ts` |
| Coverage | `npm run test:coverage` |
| Lint | `npm run lint` |
| Type-check (standalone, faster than a full build) | `npx tsc --noEmit` |
| Production build (also type-checks — no `ignoreBuildErrors` set) | `npm run build` |
| E2E smoke suite (builds + boots its own server) | `npm run test:e2e` |
| Single e2e spec | `npx playwright test e2e/smoke.spec.ts` |
| Run app for manual smoke test | `npm run dev` (localhost:3000) |
| Wiki health check (not a CI gate, but relevant for wiki-writer/reader changes) | `npm run lint:wiki` |

## Procedure

1. **Baseline.** Run `npm run lint`, `npm test`, `npx tsc --noEmit` (or
   `npm run build`), and `npm run test:e2e` if e2e-relevant code changed.
   Record pass/fail per gate. Any pre-existing failure is noted in the
   final report but is **not** fixed as part of this loop unless the user
   asked for it — only failures this loop introduces or newly discovers
   count toward "iterate until green."

2. **Generate a test-case matrix.** For the module(s) in scope, enumerate
   concrete cases covering: happy path, edge cases (empty/malformed input,
   boundary sizes — e.g. the 25MB PDF skip threshold), error handling
   (network failure in scrapers, malformed YAML in wiki pages), and the
   high-risk behaviors listed above (manifest mutex races, auth bypass
   attempts on protected POST routes, YAML frontmatter quoting, TF-IDF
   selection ranking). Write these as real Vitest tests in
   `app/__tests__/`, following the `vi.resetModules()` + dynamic-import +
   `mkdtempSync` fixture pattern from existing tests. Do not add a new test
   runner, mocking library, or fixture convention.

3. **Execute.** Run the new tests together with the full existing suite
   (`npm test`). For each failure, capture: test name, file, expected vs.
   actual, and a minimal repro. Re-run the failing test in isolation
   (`npx vitest run <file> -t "<test name>"`) at least twice to confirm
   it's deterministic — discard/flag anything that doesn't reproduce
   reliably as flaky rather than filing it.

4. **Log confirmed bugs.** `gh issue list --search "<keywords>"` first to
   avoid duplicates; if a match exists, `gh issue comment` with the new
   repro instead of opening a duplicate. Otherwise `gh issue create` with:
   repro steps, expected vs. actual, affected file(s)/line(s), and the
   failing test name. Apply an existing label (`bug`, `security`,
   `performance`, etc.) plus a `priority: *` label from step 5. Create
   `needs-triage` via `gh label create` if it doesn't exist yet and this is
   the first bug that needs it.

5. **Prioritize.**
   - **P0** (`priority: high` + `bug`): crash/500, data loss or corruption
     (manifest/wiki write corruption, checksum mismatch), or an auth/security
     regression (e.g. an export or ingest route callable without the bearer
     token when `INGEST_SECRET` is set).
   - **P1** (`priority: high`): wrong results on a common path (bad wiki
     page selection, broken chat streaming) or a dispatch/routing failure.
   - **P2** (`priority: medium`): edge-case correctness (rare malformed
     input, an uncommon scraper failure mode).
   - **P3** (`priority: low`): cosmetic, perf, or minor cleanup.
   Produce an ordered work list from the filed issues.

6. **Fix by priority.** Smallest correct change that follows existing
   conventions (wiki YAML quoting rules, manifest mutex pattern, auth
   middleware shape). Add a regression test in the relevant
   `app/__tests__/*.test.ts` file that fails before the fix and passes
   after. Re-run the affected test file, then the full gate set from step
   1. Commit with a Conventional Commit message referencing the issue,
   e.g. `fix: prevent manifest write race on concurrent ingest (closes #123)`.
   Local commits only — do not push without asking first.

7. **Iterate.** Repeat steps 3–6 until every gate is green and no
   loop-filed issue remains open (excluding anything explicitly deferred
   as `needs-triage`/flaky).

8. **Report.** Summarize: tests added (count + files), issues filed
   (numbers + priority), issues fixed/closed, issues still open (and why),
   final status of each gate (lint/test/type-check/build/e2e).

## Guardrails

- **Iteration cap**: 5 full execute→fix loops by default, or a
  user-specified limit. If still red at the cap, stop, leave remaining bugs
  filed and open, label unfixable/flaky ones `needs-triage`, and report
  clearly rather than continuing indefinitely.
- **Never** use `--no-verify`, delete or skip a test, or weaken an
  assertion just to reach green.
- **Never** weaken the `INGEST_SECRET` bearer-token check or any auth logic
  in `app/lib/auth.ts` / route handlers to make a test pass — fix the real
  defect or the test, not the guard.
- **Never** commit a stale generated artifact — this repo has none checked
  in for the wiki (only `SCHEMA.md`/`index.md` seeds are tracked; everything
  else under `wiki/` is gitignored), but if a build output or generated file
  ever needs updating, regenerate it, don't hand-edit it stale.
- **Never** close a GitHub issue without a passing regression test proving
  the fix — link the test file/name in the closing comment.
- **Never** touch `raw-sources/`, `chat-log/`, `wiki/decisions/`,
  `wiki/log.md`, `wiki/people/`, `wiki/queries/`, `wiki/recommendations/`,
  `wiki/topics/`, or any `.env*` file. Tests use temp fixtures only.
- Local commits are fine as you go; **ask before `git push`** unless the
  user already told you to push.
- Only file issues for confirmed, reproducible bugs — never for
  flaky/environmental failures (note those in the report instead).

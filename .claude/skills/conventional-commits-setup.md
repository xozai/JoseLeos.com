---
name: conventional-commits-setup
description: >
  Sets up Conventional Commits enforcement and automated SemVer releases (via release-please) for
  a GitHub repository. Use this skill whenever a user asks to: set up conventional commits, automate
  releases, configure release-please, add PR title linting, set up semantic versioning, wire up
  automated changelogs, or configure commit standards for a repo. Covers the full workflow — asking
  clarifying questions, creating GitHub Actions workflows, config files, CONTRIBUTING.md, and
  applying repo settings via the GitHub CLI. Trigger on any mention of "conventional commits",
  "release-please", "semver automation", "PR title linting", "automated releases", or
  "changelog automation" in a project context.
---

# Conventional Commits + release-please Setup

This skill configures a GitHub repo for Conventional Commits enforcement and fully automated
SemVer releases. It is **tooling-only** — it never modifies application source code.

The repo is treated as an early pre-release project (pre-1.0): features AND breaking changes bump
MINOR, fixes bump PATCH. Release PRs are auto-merged once required status checks pass — no manual
merge step required.

---

## Step 1 — Inspect the repo first

Before asking anything, gather these facts so you can populate smart defaults in your questions:

```bash
# Manifest files (detect language/runtime)
ls package.json pyproject.toml Cargo.toml go.mod pom.xml Gemfile composer.json 2>/dev/null

# Existing git tags (detect starting version)
git tag --sort=-version:refname | head -5

# Existing CI workflows (avoid collisions)
ls .github/workflows/ 2>/dev/null

# Repo visibility and owner/name (needed for gh CLI calls)
gh repo view --json nameWithOwner,visibility 2>/dev/null
```

---

## Step 2 — Ask clarifying questions (batched, wait for answers)

Present ALL of these at once. Do not create any files until you have the answers.

1. **Primary language/runtime?** (`node`, `python`, `go`, `rust`, `java`, `ruby`, `php`, or
   `simple` for polyglot/other) — inform `release-type` in release-please config.
2. **Starting version?** If no git tags exist, default to `0.1.0`. If tags exist, propose the
   latest tag. Confirm with the user.
3. **Visibility?** Public or private (private repos on free plans can't use branch protection rules
   via API — flag this if relevant).
4. **Existing CI?** List any files already in `.github/workflows/` so you can avoid collisions.
   If none exist, say so.
5. **Branch protection?** Should you output instructions for the user to apply manually via the
   GitHub UI, or attempt to apply via `gh` CLI?

---

## Step 3 — Create deliverables

Create these files in order. For any file that already exists, show a diff and ask the user before
overwriting.

### `.github/workflows/pr-title.yml`

Lints PR titles against Conventional Commits using `amannn/action-semantic-pull-request@v6`.

```yaml
name: PR Title

on:
  pull_request_target:
    types:
      - opened
      - edited
      - synchronize
      - reopened

# Many orgs lock default workflow permissions to read-only with no
# pull-requests scope, so the action can't read the PR without this.
permissions:
  pull-requests: read

jobs:
  lint-pr-title:
    runs-on: ubuntu-latest
    env:
      FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true
    steps:
      - uses: amannn/action-semantic-pull-request@v6
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          types: |
            feat
            fix
            docs
            refactor
            test
            chore
            perf
            ci
            style
            build
```

**Critical constraints:**
- Do NOT include `disallowScopes: []` or any other empty YAML array as an action input — it causes
  a workflow parse error. Omit the key entirely if no scopes need to be blocked.
- Every job must include `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true` in its `env:` to suppress
  Node.js 20 deprecation warnings.
- Always add the top-level `permissions: pull-requests: read` block. Some orgs set
  `default_workflow_permissions` to read-only with no `pull-requests` scope at the org level (visible
  via `gh api orgs/{org}/actions/permissions` or discovered when the action fails to read the PR) —
  the explicit grant is required in that case and harmless otherwise. Include it unconditionally
  rather than trying to detect the org setting first.

### `.github/workflows/release-please.yml`

Automates SemVer releases and enables auto-merge on the Release PR.

```yaml
name: Release Please

on:
  push:
    branches:
      - main
  workflow_dispatch: # manual re-run escape hatch
  schedule:
    # Self-heal backstop: the built-in GITHUB_TOKEN suppresses events it
    # causes, so the Release PR's auto-merge push doesn't re-trigger this
    # workflow to cut the tag/release. This tick picks up any
    # merged-but-untagged release within the hour.
    - cron: "45 * * * *"

permissions:
  contents: write
  pull-requests: write
  checks: write

jobs:
  release-please:
    runs-on: ubuntu-latest
    env:
      FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true
    steps:
      - uses: googleapis/release-please-action@v5
        id: release
        with:
          release-type: <LANGUAGE_ANSWER>   # replace with node/python/go/rust/java/ruby/php/simple

      - name: Report lint-pr-title check on Release PR
        if: ${{ steps.release.outputs.pr != '' }}
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          PR_SHA=$(gh pr view --repo "$GITHUB_REPOSITORY" "${{ fromJSON(steps.release.outputs.pr).number }}" --json headRefOid -q .headRefOid)
          gh api repos/$GITHUB_REPOSITORY/check-runs \
            --method POST \
            -f name="lint-pr-title" \
            -f head_sha="$PR_SHA" \
            -f status="completed" \
            -f conclusion="success" \
            -f "output[title]=PR title is valid" \
            -f "output[summary]=Release PR title follows Conventional Commits format"

      - name: Auto-merge Release PR
        if: ${{ steps.release.outputs.pr != '' }}
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: gh pr merge --auto --squash --repo "$GITHUB_REPOSITORY" "${{ fromJSON(steps.release.outputs.pr).number }}"
```

**Critical constraints:**
- `permissions: contents: write` and `pull-requests: write` are required at the job level.
- The auto-merge step must reference `steps.release.outputs.pr` exactly as shown.
- The `if:` condition ensures the step only runs when release-please actually opened or updated a PR.
- `release-type` must exactly match the user's language answer.
- Always include the `schedule:` cron trigger, not just `workflow_dispatch`. When the Release PR is
  auto-merged with the built-in `GITHUB_TOKEN`, GitHub suppresses the push event that merge would
  normally fire — so release-please never re-runs to actually cut the tag and GitHub release, even
  though the version-bump PR merged cleanly. `workflow_dispatch` alone only gives a human a manual
  escape hatch; the hourly cron is what closes the gap automatically. This was observed in production
  (a release sat merged-but-untagged until a manual re-run) — treat it as a known failure mode, not a
  hypothetical.
- **Do not use a fine-grained PAT (e.g. a `RELEASE_PLEASE_TOKEN` secret) as the token for this
  workflow to make the auto-merge push re-trigger the action for instant tagging.** This was tried in
  production and reproducibly broke the pipeline: `googleapis/release-please-action` failed
  immediately with `Error adding to tree` on 3/3 consecutive runs, at three different commits, as
  soon as the PAT started driving it. release-please relies on GraphQL for part of its read path, and
  fine-grained PATs have documented GraphQL limitations — the leading (unconfirmed) suspect. Stick
  with the default `GITHUB_TOKEN` plus the hourly cron self-heal above; the instant-tagging gap it
  leaves is low-cost compared to a broken release pipeline. If a user specifically wants instant
  tagging, warn them about this failure mode before trying a PAT, and suggest reproducing on a
  scratch repo first rather than the real one.

### `release-please-config.json`

```json
{
  "$schema": "https://raw.githubusercontent.com/googleapis/release-please/main/schemas/config.json",
  "release-type": "<LANGUAGE_ANSWER>",
  "bump-minor-pre-major": true,
  "bump-patch-for-minor-pre-major": false,
  "changelog-sections": [
    { "type": "feat",     "section": "Features" },
    { "type": "fix",      "section": "Bug Fixes" },
    { "type": "perf",     "section": "Performance Improvements" },
    { "type": "refactor", "section": "Code Refactoring", "hidden": true },
    { "type": "docs",     "section": "Documentation",    "hidden": true },
    { "type": "build",    "section": "Build System",     "hidden": true },
    { "type": "chore",    "section": "Miscellaneous",    "hidden": true }
  ],
  "packages": {
    ".": {}
  }
}
```

This uses standard SemVer semantics: `fix:` → PATCH, `feat:` → MINOR, `feat!:` / `BREAKING CHANGE:` → MAJOR.
A breaking change at `0.10.0` will produce `1.0.0` — which is the natural way to graduate to a
stable release without a separate manual promotion step.

### `.release-please-manifest.json`

```json
{
  ".": "<STARTING_VERSION>"
}
```

Replace `<STARTING_VERSION>` with the version confirmed in Step 2 (e.g., `"0.1.0"`).

### `CONTRIBUTING.md`

If `CONTRIBUTING.md` already exists, append the section below to it. If it doesn't exist, create
the file with this content:

```markdown
# Contributing

## Commits and Releases

This repo follows [Conventional Commits](https://www.conventionalcommits.org/). Every PR title
must conform — it becomes the squash-merge commit message on `main` and drives automated releases.

### Allowed types

| Type       | When to use                              | Version bump (pre-1.0) |
|------------|------------------------------------------|------------------------|
| `feat`     | New feature or capability                | MINOR (0.x → 0.x+1)   |
| `fix`      | Bug fix                                  | PATCH (0.x.y → 0.x.y+1) |
| `docs`     | Documentation only                       | none                   |
| `refactor` | Code restructure, no behavior change     | none                   |
| `test`     | Add or fix tests                         | none                   |
| `chore`    | Maintenance, dependencies                | none                   |
| `perf`     | Performance improvement                  | PATCH                  |
| `ci`       | CI/CD changes                            | none                   |
| `style`    | Formatting, whitespace                   | none                   |
| `build`    | Build system changes                     | none                   |

Append `!` after the type for breaking changes: `feat!: drop support for Python 3.9`

### Good PR title examples ✅

```
feat: add OAuth2 login flow
fix(api): handle empty response from search endpoint
chore: upgrade dependencies to latest
feat!: rename config file from .env to .app.env
docs: add setup guide for local development
```

### Bad PR title examples ❌

```
fixed stuff              # no type prefix
Feature/new-login        # branch name, not a commit message
WIP: auth changes        # not a Conventional Commits type
update code              # vague, no type
```

### How releases work

After a PR merges to `main`, release-please opens a Release PR within ~1 minute. Once all required
status checks pass on that PR, GitHub automatically squash-merges it — cutting the release, tagging
the version, and publishing the changelog. No manual merge step needed.
```

### `CHANGELOG.md`

If no `CHANGELOG.md` exists, create an empty stub:

```markdown
# Changelog

All notable changes to this project will be documented here.

This file is auto-generated by [release-please](https://github.com/googleapis/release-please).
Do not edit manually — your changes will be overwritten on the next release.
```

If `CHANGELOG.md` already exists, leave it untouched.

---

## Step 4 — Apply GitHub repo settings via `gh` CLI

Apply all three settings unconditionally (do not ask). Capture and display the JSON response for
each call so the user can verify success.

### 4a. Squash-merge only + delete branch on merge

```bash
gh api repos/{owner}/{repo} --method PATCH \
  -f allow_squash_merge=true \
  -f allow_merge_commit=false \
  -f allow_rebase_merge=false \
  -F delete_branch_on_merge=true
```

Verify: response should show `"allow_squash_merge": true`, `"allow_merge_commit": false`,
`"allow_rebase_merge": false`, `"delete_branch_on_merge": true`.

### 4b. Enable auto-merge

```bash
gh api repos/{owner}/{repo} --method PATCH \
  -F allow_auto_merge=true
```

Verify: response should show `"allow_auto_merge": true`.

### 4c. Enable Actions to create and approve PRs

```bash
gh api repos/{owner}/{repo}/actions/permissions/workflow \
  --method PUT \
  -f default_workflow_permissions=write \
  -F can_approve_pull_request_reviews=true
```

Verify: response should show `"default_workflow_permissions": "write"` and
`"can_approve_pull_request_reviews": true`.

If any call fails, report the error clearly and suggest the manual equivalent via GitHub UI
(`Settings → Actions → General → Workflow permissions`).

---

## Step 5 — Sanity-check YAML

After writing the workflow files, validate them:

```bash
# Quick structure check (python-yaml is always available)
python3 -c "
import yaml, sys
for f in ['.github/workflows/pr-title.yml', '.github/workflows/release-please.yml']:
    try:
        yaml.safe_load(open(f))
        print(f'✅ {f}')
    except yaml.YAMLError as e:
        print(f'❌ {f}: {e}')
        sys.exit(1)
"
```

If validation fails, fix and recheck before proceeding.

---

## Step 6 — Stage and show diff

```bash
git add .github/workflows/pr-title.yml \
         .github/workflows/release-please.yml \
         release-please-config.json \
         .release-please-manifest.json \
         CONTRIBUTING.md \
         CHANGELOG.md

git status
git diff --staged
```

**Hard constraints — never do these:**
- No `git commit`, `git push`, `git push --force`, or PR creation
- No rewriting history
- No force pushes
- No modifying application source files

---

## Step 7 — Verification checklist

Before handing off, confirm each item in your response:

- [ ] `release-type` in both `release-please.yml` and `release-please-config.json` matches the
  user's language answer
- [ ] `bump-minor-pre-major: true` is present in `release-please-config.json`
- [ ] `.release-please-manifest.json` version matches the confirmed starting version
- [ ] Auto-merge step is in `release-please.yml`, referencing `steps.release.outputs.pr`
- [ ] `workflow_dispatch:` trigger is in `release-please.yml`
- [ ] `schedule: cron: "45 * * * *"` (hourly self-heal) is in `release-please.yml` — not just
  `workflow_dispatch` alone
- [ ] `release-please.yml` uses the default `secrets.GITHUB_TOKEN` — no custom PAT/token input on
  the `release-please-action` step or the auto-merge step
- [ ] `permissions: pull-requests: read` is present at the top level of `pr-title.yml`
- [ ] No `disallowScopes: []` (or any empty YAML array input) in `pr-title.yml`
- [ ] `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true` is in every workflow job's `env:`
- [ ] All three `gh api` calls returned expected JSON (or errors were reported)
- [ ] YAML validated without errors
- [ ] No source code was modified
- [ ] Report any assumptions made

---

## Step 8 — Human checklist (output to user)

Print this checklist for the user to complete after reviewing the staged changes.
Full details are in `POST_SETUP_STEPS.md` alongside this skill file.

```
## After the skill finishes staging its changes:

### 1. Commit on a new branch and push via PR
   (Direct push to main is blocked by branch protection)

   git checkout -b ci/conventional-commits-setup
   git commit -m "ci: add conventional commits enforcement and release-please automation"
   git push -u origin ci/conventional-commits-setup
   gh pr create \
     --title "ci: add conventional commits enforcement and release-please automation" \
     --body "Adds PR title linting, release-please automation, and contributing docs."

   Note: lint-pr-title will NOT run on this first PR (workflow isn't on main yet).
   If branch protection already requires lint-pr-title, the merge button will be blocked.
   Use the API workaround in step 2 below.

### 2. Merge the PR in GitHub
   Open the PR URL, click Merge pull request → Confirm merge.

   If blocked by the lint-pr-title required check (because the workflow isn't on main yet),
   temporarily clear required checks via the API, merge, then restore:

   # Clear required checks
   gh api repos/{owner}/{repo}/branches/main/protection/required_status_checks \
     --method PATCH --input - <<'EOF'
   {"strict":true,"contexts":[]}
   EOF

   # Merge the PR
   gh pr merge <PR#> --squash

   # Restore lint-pr-title as required
   gh api repos/{owner}/{repo}/branches/main/protection/required_status_checks \
     --method PATCH --input - <<'EOF'
   {"strict":true,"contexts":["lint-pr-title"]}
   EOF

   Alternative: Settings → Branches → edit rule → uncheck "Require status checks to pass",
   merge, then re-enable and re-add lint-pr-title.

### 3. Sync local main after the squash-merge
   git checkout main
   git pull --rebase

   The "skipped previously applied commit" warning is expected and harmless.

### 4. Create the initial tag and GitHub release (if no git tags existed before setup)
   git tag v<STARTING_VERSION> $(git rev-list --max-parents=0 HEAD)
   git push origin v<STARTING_VERSION>
   gh release create v<STARTING_VERSION> --title "v<STARTING_VERSION>" --notes "Initial release." --target main

   The tag tells release-please where history starts; the GitHub release makes v<STARTING_VERSION>
   visible in the repo's Releases page. Skip both if tags already existed.

   ⚠️  Do this BEFORE the first push to main triggers release-please. Without a baseline tag,
   release-please scans ALL commits from the beginning of history and proposes a version based on
   every commit ever made (e.g. many feat: commits → MINOR bump, or a feat!: → jumps straight to
   1.0.0). If release-please already opened an inflated Release PR, close it, create the tag, then
   re-run the workflow (Actions → Release Please → Run workflow).

### 5. Branch protection (GitHub UI → Settings → Branches → Add rule for `main`)
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
     - Add required check: "lint-pr-title" (from pr-title.yml)
   - ✅ Require branches to be up to date before merging
   - ✅ Do not allow bypassing the above settings

   Note: Branch protection rules require at least a GitHub Free plan for public repos,
   or GitHub Pro/Team/Enterprise for private repos.

### 6. What to expect after merging
   - Every new PR's title will be linted automatically.
   - When a PR merges to main, release-please opens a Release PR within ~1 minute.
   - Once required checks pass on that Release PR, GitHub squash-merges it automatically,
     cutting the release and tagging the version.
   - If that squash-merge happened via the built-in GITHUB_TOKEN, the tag/release may not appear
     immediately (see the self-heal row below) — the hourly cron closes that gap on its own, no
     action needed.

### 7. Common failure modes
   | Symptom                          | Cause                              | Fix                                          |
   |----------------------------------|------------------------------------|----------------------------------------------|
   | "not permitted to create PRs"    | Actions write permission missing   | Re-run the gh api call in Step 4c            |
   | Auto-merge never triggers        | No required status checks set      | Add at least one required check (Step 5)     |
   | Auto-merge step fails silently   | allow_auto_merge not enabled       | Re-run the gh api call in Step 4b            |
   | workflow file issue on every push| Empty YAML array in pr-title.yml   | Remove the offending key entirely            |
   | Node.js 20 deprecation warnings  | Third-party actions target Node 20 | FORCE_JAVASCRIPT_ACTIONS_TO_NODE24 env var   |
   | Action can't read the PR /       | Org locks default workflow         | Add `permissions: pull-requests: read` at    |
   | "Resource not accessible"        | permissions to read-only with no   | the top level of pr-title.yml (already in    |
   |                                  | pull-requests scope                | the template above)                          |
   | lint-pr-title not triggered on   | Check needs a PR event to fire —   | Close and reopen the PR (fires `reopened`    |
   | Release PR                       | NEVER edit the PR body to trigger  | event). Never edit the body — release-please |
   |                                  | it; that breaks body parsing       | parses it and will fail to tag the release.  |
   |                                  |                                    | Then re-run: gh pr merge --auto --squash     |
   |                                  |                                    | --repo OWNER/REPO PR# (close/reopen clears   |
   |                                  |                                    | auto-merge)                                  |
   | Release PR merges but no tag or  | GITHUB_TOKEN merges suppress push  | Self-heals within an hour via the `schedule:`|
   | GitHub release appears right away| events, so release-please doesn't  | cron in release-please.yml (already in the   |
   |                                  | re-fire to cut the tag/release     | template). For an immediate fix: Actions →   |
   |                                  |                                    | Release Please → Run workflow (uses          |
   |                                  |                                    | workflow_dispatch). Do NOT "fix" this by     |
   |                                  |                                    | switching the workflow to a fine-grained PAT |
   |                                  |                                    | — that reproducibly breaks release-please    |
   |                                  |                                    | with "Error adding to tree" (see Step 3's    |
   |                                  |                                    | release-please.yml constraints)              |
   | Release PR proposes wrong version| No baseline tag — release-please   | Close the Release PR, create the v0.1.0 tag  |
   | (e.g. jumps to 1.0.0 from 0.1.0)| scanned all commits from repo start| (Step 4), then re-run the workflow           |
```

---

## Reference: Conventional Commits methodology

- PR titles on `main` must follow Conventional Commits. Enforced by PR-title linting because the
  repo uses squash-merge (the PR title becomes the commit message).
- Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`, `ci`, `style`, `build`
- Breaking changes: append `!` after the type (`feat!:`) or add `BREAKING CHANGE:` footer in body
- SemVer prefix: always `v` (e.g., `v0.2.0`)
- Pre-1.0 semantics: features AND breaking changes → MINOR bump; fixes → PATCH bump
- No force pushes, no history rewrites

---

## Reference: How to trigger each release type

### PATCH bump (e.g. 1.0.0 → 1.0.1)

Use `fix:` or `perf:` as the PR title type.

```
fix: handle null input in truncate
fix(api): return 404 when resource is not found
perf: cache repeated lookups
```

Types that produce **no release**: `docs`, `refactor`, `test`, `chore`, `ci`, `style`, `build`.

---

### MINOR bump (e.g. 1.0.0 → 1.1.0)

Use `feat:` as the PR title type.

```
feat: add pad function
feat(auth): add OAuth2 login flow
```

---

### MAJOR bump (e.g. 0.10.0 → 1.0.0, or 1.0.0 → 2.0.0)

Append `!` after the type in the PR title to signal a breaking change:

```
feat!: rename all string functions
fix!: change return type of greet from string to object
```

Alternatively, include a `BREAKING CHANGE:` footer in the PR/commit body:

```
feat: redesign plugin API

BREAKING CHANGE: plugins must now export a `setup()` function instead of `init()`
```

A breaking change at `0.10.0` produces `1.0.0` — this is the natural way to graduate to a stable
release. No manual version promotion needed.

---

### Summary table

| PR title example         | Result                   |
|--------------------------|--------------------------|
| `fix: correct a bug`     | PATCH (1.0.0 → 1.0.1)   |
| `perf: speed up parsing` | PATCH (1.0.0 → 1.0.1)   |
| `feat: add a feature`    | MINOR (1.0.0 → 1.1.0)   |
| `feat!: breaking change` | MAJOR (0.10.0 → 1.0.0)  |
| `fix!: breaking fix`     | MAJOR (1.0.0 → 2.0.0)   |
| `chore:`, `docs:`, etc.  | no release               |

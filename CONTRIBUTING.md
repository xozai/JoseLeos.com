# Contributing

## Commits and Releases

This repo uses [Conventional Commits](https://www.conventionalcommits.org/) enforced via PR title
linting. Because PRs are **squash-merged**, the PR title becomes the single commit message on `main`.

### PR Title Format

```
<type>(<optional scope>): <short description>
```

The description must be lowercase and must **not** end with a period.

### Valid Types

| Type       | When to use                                          |
|------------|------------------------------------------------------|
| `feat`     | New feature or capability                            |
| `fix`      | Bug fix                                              |
| `docs`     | Documentation only                                   |
| `refactor` | Code change that isn't a feat or fix                 |
| `test`     | Adding or updating tests                             |
| `chore`    | Tooling, dependencies, housekeeping                  |
| `perf`     | Performance improvement                              |
| `ci`       | CI/CD pipeline changes                               |
| `style`    | Formatting, whitespace (no logic change)             |
| `build`    | Build system or external dependency changes          |

### Breaking Changes

Append `!` after the type/scope to signal a breaking change:

```
feat!: rename /blog route to /writing
refactor(auth)!: drop support for magic-link login
```

Or add a `BREAKING CHANGE:` footer in the PR body (the linter checks the title; the footer is
read by release-please when it computes the version bump).

### Good PR Title Examples

```
feat: add dark mode toggle to settings
fix: correct og-image dimensions on mobile
chore: upgrade Next.js to 16.3
perf: lazy-load below-the-fold portfolio images
feat(blog)!: rename /blog to /writing and add redirect
```

### Bad PR Title Examples

```
update stuff                  ← no type prefix
feat - add dark mode          ← wrong separator (must be colon)
Fixed the og image            ← no type, capital letter
feat: Add dark mode.          ← capital letter, trailing period
WIP: working on search        ← WIP is not a valid type
```

### Versioning (pre-1.0)

The repo follows SemVer with a `v` prefix. While the major version is `0`:

| Commit type(s)                | Version bump |
|-------------------------------|--------------|
| `fix`, `chore`, `docs`, etc.  | Patch → `0.1.x` |
| `feat`                        | Minor → `0.x.0` |
| `feat!` / `BREAKING CHANGE:`  | Minor → `0.x.0` (not major until 1.0) |

Breaking changes will bump **major** (→ `1.0.0`) only after the app has committed to backward
compatibility and the major version is manually advanced.

### Release Process

Releases are fully automated via [release-please](https://github.com/googleapis/release-please):

1. Merge a Conventional Commits PR to `main`.
2. release-please opens a **Release PR** (within ~1 minute) that bumps `package.json`, updates
   `CHANGELOG.md`, and sets the release title.
3. Review the Release PR — it accumulates multiple commits until you merge it.
4. Merging the Release PR cuts the GitHub Release and creates the `vX.Y.Z` git tag automatically.

> **Common failure modes:** missing workflow permissions (`contents: write`,
> `pull-requests: write`), or org-level settings that block `GITHUB_TOKEN` from opening PRs
> (fix: add a `RELEASE_PLEASE_TOKEN` PAT in repo secrets and pass it to the action).

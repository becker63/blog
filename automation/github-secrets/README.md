# GitHub Secrets Setup

This project does not store secrets in the repo. There is no SOPS, age, encrypted YAML, or secret source-of-truth file here.

GitHub Actions secrets and variables are the source of truth. This helper is only an ergonomic installer around the GitHub CLI.

`pnpm secrets:setup` is missing-only by default: it checks the target repositories, skips already configured secrets and variables, and only prompts for values that are missing.

## Usage

```bash
nix develop
gh auth login
pnpm secrets:setup
```

For a no-write preview:

```bash
pnpm secrets:setup --dry-run
```

Optional flags:

- `--blog-repo owner/repo`
- `--source-repos owner/repo,owner/other-repo`
- `--dry-run`
- `--overwrite` to rotate or replace existing values
- `--force` as an alias for `--overwrite`

Use overwrite mode only when you intend to replace configured GitHub Actions values:

```bash
pnpm secrets:setup --overwrite --blog-repo owner/repo
```

`--dry-run` still reads existing secrets and variables and still skips configured values unless overwrite mode is enabled. It does not write anything.

## Blog Repo

The blog repo receives these Actions secrets:

- `CURSOR_API_KEY`
- `GH_REPO_INSIGHT_TOKEN`

Optional Actions variables:

- `CURSOR_MODEL`
- `CURSOR_COMPACTION_MODEL`
- `CACHIX_CACHE_NAME`

`GH_REPO_INSIGHT_TOKEN` should be a fine-grained read-only token for the source repos the agent may inspect. Use read-only Contents and Metadata permissions.

Optional Nix binary cache:

- `CACHIX_AUTH_TOKEN`

Magic Nix Cache and FlakeHub are intentionally not used. Cachix is the optional Nix binary cache for GitHub Actions speed only; it is not part of repo-insight product logic. `CACHIX_CACHE_NAME` defaults to `becker63`.

## Source Repos

Source repos receive:

- `BLOG_REPO_DISPATCH_TOKEN`

This token lets source repos dispatch `repo-insight` events to the blog repo. Scope it to the blog repo only if possible, with enough permission to call `repository_dispatch`.

Source repos still need the tiny notify workflow copied into `.github/workflows/` from `automation/repo-insight/workflows/source-repo-notify-template.yml`.

The helper never writes secret values to disk and does not print them. No SOPS, encrypted YAML, or secret files are added.

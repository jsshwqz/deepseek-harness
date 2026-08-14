# Releasing (dual-mirror)

This fork publishes to both **GitHub** (`jsshwqz/deepseek-harness`) and **Gitee** (`gitee.com/jsshwqz/deepseek-harness`). Every release must land on both remotes.

## Fast path (one command)

```bash
bash scripts/release.sh 0.1.4
```

`scripts/release.sh <version>` does, in order:

1. Bumps the version across every `package.json` / lock that carries the current version.
2. Commits the bump as `release(dsh): <version>`.
3. Creates an annotated tag `v<version>`.
4. Pushes `main` and the tag to **both** `github` and `gitee` remotes.

Optional: pass commit SHAs to merge before the bump:

```bash
bash scripts/release.sh 0.1.4 3620a5e 9a2f223
```

Each listed SHA is cherry-picked onto `main` before the version bump (useful when pulling a feature branch into the release line).

## Manual path

If you prefer to step through it:

```bash
# 1. bump version across packages
for f in $(git grep -l "<OLD_VER>" -- "*.json" "*.yaml"); do
  sed -i "s/<OLD_VER>/<NEW_VER>/g" "$f"
done
git add -A
git commit -m "release(dsh): <NEW_VER>"

# 2. annotated tag
git tag -a v<NEW_VER> -m "release(dsh): <NEW_VER>"

# 3. push to both remotes
bash scripts/dual-push.sh main
git push github v<NEW_VER> --force   # tag
git push gitee   v<NEW_VER> --force
```

## Remotes (one-time setup)

```bash
git remote add github  https://github.com/<user>/<repo>.git
git remote add gitee   https://<user>:<TOKEN>@gitee.com/<user>/<repo>.git
git remote -v
```

The `gitee` token lives in `.git/config` (not committed). To keep it out of config dumps, use a git credential helper and pass the token via `GITEE_TOKEN` instead.

## Network resilience

Both remotes should stay in sync. On this machine `github.com:443` is intermittently unreachable (21s timeouts); the release script retries each remote independently and reports which one failed. If a push fails, re-run — it will only finish the missing remote since `git push` skips already-present refs. A background retry job is also available in the repo notes for hands-off release on slow links.

## Branches

- `main` / `master` — release baseline (upstream rc line). Release tags point here.
- `feat/*` — feature branches; merge into `main` before a release when ready.
- `fix/*` — bug-fix branches; cherry-pick or merge into `main` before a release.

After a release, keep feature branches mirrored with `bash scripts/dual-push.sh <branch>`.

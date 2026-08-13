#!/usr/bin/env bash
# dual-push: mirror branches to both GitHub (jsshwqz) and Gitee (gitee).
# Usage: scripts/dual-push.sh [branch ...]   (no args = all local branches)
# Setup: gitee remote -> https://<USER>:<TOKEN>@gitee.com/<user>/<repo>.git
# Credential is in .git/config (not committed); or use a credential helper + GITEE_TOKEN.

set -euo pipefail
GIT=${GIT:-git}
GH=jsshwqz
GT=gitee

if [ $# -gt 0 ]; then
  BRANCHES=("$@")
else
  mapfile -t BRANCHES < <("$GIT" for-each-ref --format=%(refname:short) refs/heads/)
fi

echo ">>> dual-push: will push ${#BRANCHES[@]} branch(es) to $GH (github) + $GT (gitee)"
failed=0
for b in "${BRANCHES[@]}"; do
  echo "--- pushing: $b ---"
  set +e
  "$GIT" -c http.postBuffer=524288000 push "$GH" "$b" 2>&1
  gh_rc=$?
  "$GIT" -c http.postBuffer=524288000 push "$GT" "$b" --force 2>&1
  gt_rc=$?
  set -e
  if [ $gh_rc -ne 0 ] || [ $gt_rc -ne 0 ]; then
    echo "!! $b: github=$gh_rc gitee=$gt_rc" >&2
    failed=1
  fi
done

if [ $failed -eq 0 ]; then
  echo ">>> dual-push: all done."
else
  echo ">>> dual-push: some pushes failed (transient network common; re-run)." >&2
fi
exit $failed

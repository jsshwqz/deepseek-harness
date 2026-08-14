#!/usr/bin/env bash
# release: bump version, tag, commit, dual-push (GitHub + Gitee).
# usage: scripts/release.sh <version> [commit... commit]

set -euo pipefail
GIT=${GIT:-git}
REPO=$(dirname "$0")/..
cd "$REPO"

NEW_VER=${1:-}
if [ -z "$NEW_VER" ]; then echo "usage: $0 <version> [commit...]" >&2; exit 2; fi

SHIFTED=("${@:2}")
if [ ${#SHIFTED[@]} -gt 0 ]; then
  echo ">>> merging onto main: ${SHIFTED[*]}"
  "$GIT" checkout main
  for c in "${SHIFTED[@]}"; do "$GIT" cherry-pick "$c" || exit 1; done
fi

OLD_VER=$(grep -h -m1 ""version"" package.json | grep -oE ""[0-9][^"]*"" | tr -d """)
if [ -z "$OLD_VER" ]; then OLD_VER="0.1.0-rc.5"; fi

echo ">>> bumping $OLD_VER -> $NEW_VER"
mapfile -t FILES < <("$GIT" grep -l "$OLD_VER" -- "*.json" "*.yaml" "*.yml" 2>/dev/null || true)
echo "    files: ${#FILES[@]}"
for f in "${FILES[@]}"; do sed -i "s/$OLD_VER/$NEW_VER/g" "$f"; done

"$GIT" add -A
"$GIT" commit -m "release(dsh): ${NEW_VER}" || echo "    (nothing to commit)"
"$GIT" tag -a "v${NEW_VER}" -m "release(dsh): ${NEW_VER}" 2>/dev/null || true

echo ">>> pushing main + v${NEW_VER} to github and gitee"
failed=0
for remote in github gitee; do
  echo "--- $remote ---"
  set +e
  "$GIT" -c http.postBuffer=524288000 -c http.version=HTTP/1.1 push "$remote" main 2>&1; r1=$?
  "$GIT" -c http.postBuffer=524288000 -c http.version=HTTP/1.1 push "$remote" "v${NEW_VER}" --force 2>&1; r2=$?
  set -e
  if [ $r1 -ne 0 ] || [ $r2 -ne 0 ]; then echo "!! $remote failed (main=$r1 tag=$r2)" >&2; failed=1; fi
done

if [ $failed -eq 0 ]; then echo ">>> release ${NEW_VER} complete: dual-mirrored."; else echo ">>> released locally; re-run to push." >&2; fi
exit $failed
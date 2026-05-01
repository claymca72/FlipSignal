#!/usr/bin/env bash
# Claude Code WorktreeRemove hook.
# Reads JSON from stdin: { worktree_path, ... }. Removes the worktree cleanly.
# Always exits 0 — failure to remove is logged but never fatal, since the agent
# is already done and a leftover dir is recoverable manually.

set -uo pipefail

INPUT=$(cat)

extract_field() {
    local key="$1"
    if command -v python3 >/dev/null 2>&1; then
        python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('$key', ''))" <<<"$INPUT" 2>/dev/null || true
    else
        echo "$INPUT" | grep -o "\"$key\"[[:space:]]*:[[:space:]]*\"[^\"]*\"" | sed 's/.*: *"\(.*\)"/\1/' | head -n1
    fi
}

WORKTREE_PATH=$(extract_field worktree_path)
[ -z "$WORKTREE_PATH" ] && exit 0
[ ! -e "$WORKTREE_PATH" ] && exit 0

# A worktree's .git is a file like: "gitdir: <repo>/.git/worktrees/<name>"
GITFILE="$WORKTREE_PATH/.git"
REPO=""
if [ -f "$GITFILE" ]; then
    GITDIR=$(awk '/^gitdir:/{print $2}' "$GITFILE")
    if [ -n "$GITDIR" ]; then
        # Strip "/.git/worktrees/<name>" suffix
        REPO=$(printf '%s' "$GITDIR" | sed 's|/\.git/worktrees/.*||')
    fi
fi

# Try the clean path first
if [ -n "$REPO" ] && [ -d "$REPO/.git" ]; then
    git -C "$REPO" worktree remove --force "$WORKTREE_PATH" 2>/dev/null && exit 0
    # Branch name follows the convention from worktree-create.sh
    BRANCH="claude/$(basename "$WORKTREE_PATH")"
    git -C "$REPO" branch -D "$BRANCH" 2>/dev/null || true
fi

# Fallback: just remove the directory and prune
rm -rf "$WORKTREE_PATH" 2>/dev/null || true
[ -n "$REPO" ] && [ -d "$REPO/.git" ] && git -C "$REPO" worktree prune 2>/dev/null || true

exit 0

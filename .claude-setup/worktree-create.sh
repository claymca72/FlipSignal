#!/usr/bin/env bash
# Claude Code WorktreeCreate hook.
# Reads JSON from stdin: { cwd, name, ... }. Creates a git worktree from a
# detected git repo. Writes the absolute worktree path to stdout.
#
# Repo detection priority:
#   1. CLAUDE_WORKTREE_REPO env var (if it's a git repo)
#   2. cwd from the hook input (if it's inside a git repo)
#   3. Walk up from cwd to find a git repo
#   4. Walk through entries in CLAUDE_WORKTREE_REPO_HINTS (colon-separated paths)
#   5. Fail with a clear error
#
# Worktree location: <repo>/.claude-worktrees/<sanitized-name>
# This matches Claude Code's native convention for worktree paths.

set -euo pipefail

INPUT=$(cat)

# Extract fields with python3 (ships on macOS); fall back to grep/sed if unavailable.
extract_field() {
    local key="$1"
    if command -v python3 >/dev/null 2>&1; then
        python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('$key', ''))" <<<"$INPUT" 2>/dev/null || true
    else
        # Fragile fallback: assumes simple string values.
        echo "$INPUT" | grep -o "\"$key\"[[:space:]]*:[[:space:]]*\"[^\"]*\"" | sed 's/.*: *"\(.*\)"/\1/' | head -n1
    fi
}

CWD=$(extract_field cwd)
NAME=$(extract_field name)
[ -z "$NAME" ] && NAME="agent"

# Sanitize name: keep only [A-Za-z0-9_-]
SAFE_NAME=$(printf '%s' "$NAME" | tr -c 'A-Za-z0-9_-' '_' | cut -c1-64)
# Append a short pid+timestamp suffix to avoid collisions
SUFFIX="$(date +%s)-$$"
WORKTREE_NAME="${SAFE_NAME}-${SUFFIX}"

is_git_repo() {
    [ -n "${1:-}" ] && [ -d "$1" ] && git -C "$1" rev-parse --show-toplevel >/dev/null 2>&1
}

# 1) Explicit env var
REPO=""
if [ -n "${CLAUDE_WORKTREE_REPO:-}" ] && is_git_repo "$CLAUDE_WORKTREE_REPO"; then
    REPO=$(git -C "$CLAUDE_WORKTREE_REPO" rev-parse --show-toplevel)
fi

# 2) cwd from input
if [ -z "$REPO" ] && [ -n "$CWD" ] && is_git_repo "$CWD"; then
    REPO=$(git -C "$CWD" rev-parse --show-toplevel)
fi

# 3) Walk up from cwd
if [ -z "$REPO" ] && [ -n "$CWD" ] && [ -d "$CWD" ]; then
    p="$CWD"
    while [ "$p" != "/" ] && [ -n "$p" ]; do
        if is_git_repo "$p"; then
            REPO="$p"
            break
        fi
        p=$(dirname "$p")
    done
fi

# 4) Try the hint list
if [ -z "$REPO" ] && [ -n "${CLAUDE_WORKTREE_REPO_HINTS:-}" ]; then
    IFS=':' read -ra HINTS <<<"$CLAUDE_WORKTREE_REPO_HINTS"
    for hint in "${HINTS[@]}"; do
        if is_git_repo "$hint"; then
            REPO=$(git -C "$hint" rev-parse --show-toplevel)
            break
        fi
    done
fi

if [ -z "$REPO" ]; then
    echo "WorktreeCreate hook: could not locate a git repo (cwd=$CWD, name=$NAME). Set CLAUDE_WORKTREE_REPO or CLAUDE_WORKTREE_REPO_HINTS." >&2
    exit 1
fi

WORKTREE_PARENT="$REPO/.claude-worktrees"
mkdir -p "$WORKTREE_PARENT"
WORKTREE_PATH="$WORKTREE_PARENT/$WORKTREE_NAME"
BRANCH="claude/$WORKTREE_NAME"

# Make sure .claude-worktrees is gitignored (idempotent)
GITIGNORE="$REPO/.gitignore"
if [ -f "$GITIGNORE" ]; then
    if ! grep -qE '^\.claude-worktrees/?$' "$GITIGNORE" 2>/dev/null; then
        printf '\n.claude-worktrees/\n' >>"$GITIGNORE"
    fi
fi

git -C "$REPO" worktree add -b "$BRANCH" "$WORKTREE_PATH" HEAD >&2

# Output the absolute path on stdout (one line, nothing else).
echo "$WORKTREE_PATH"

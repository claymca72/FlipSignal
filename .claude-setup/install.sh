#!/usr/bin/env bash
# One-shot installer for the WorktreeCreate / WorktreeRemove hooks.
# Reads files from this directory and installs them into ~/.claude/.
# Backs up any existing settings.json before merging.

set -euo pipefail

SETUP_DIR="$(cd "$(dirname "$0")" && pwd)"
CLAUDE_DIR="$HOME/.claude"
HOOKS_DIR="$CLAUDE_DIR/hooks"
SETTINGS="$CLAUDE_DIR/settings.json"
FRAGMENT="$SETUP_DIR/settings-fragment.json"

mkdir -p "$HOOKS_DIR"

cp "$SETUP_DIR/worktree-create.sh" "$HOOKS_DIR/worktree-create.sh"
cp "$SETUP_DIR/worktree-remove.sh" "$HOOKS_DIR/worktree-remove.sh"
chmod +x "$HOOKS_DIR/worktree-create.sh" "$HOOKS_DIR/worktree-remove.sh"

echo "Installed hook scripts to $HOOKS_DIR"

# Merge the fragment into existing settings.json.
# If settings.json exists, deep-merge (preserve other keys; only add hooks).
# If it doesn't, create it from the fragment.

if [ -f "$SETTINGS" ]; then
    cp "$SETTINGS" "$SETTINGS.bak.$(date +%Y%m%d%H%M%S)"
    echo "Backed up existing settings.json"

    if ! command -v python3 >/dev/null 2>&1; then
        echo "ERROR: python3 not found. Install Xcode Command Line Tools (xcode-select --install) or merge $FRAGMENT into $SETTINGS by hand." >&2
        exit 1
    fi

    python3 - "$SETTINGS" "$FRAGMENT" <<'PY'
import json, sys, pathlib

settings_path = pathlib.Path(sys.argv[1])
fragment_path = pathlib.Path(sys.argv[2])

settings = json.loads(settings_path.read_text())
fragment = json.loads(fragment_path.read_text())

def deep_merge(dst, src):
    for k, v in src.items():
        if k in dst and isinstance(dst[k], dict) and isinstance(v, dict):
            deep_merge(dst[k], v)
        elif k in dst and isinstance(dst[k], list) and isinstance(v, list):
            # Append fragment list entries; user can dedupe later if needed.
            dst[k].extend(v)
        else:
            dst[k] = v

deep_merge(settings, fragment)
settings_path.write_text(json.dumps(settings, indent=2) + "\n")
print(f"Merged hooks into {settings_path}")
PY
else
    cp "$FRAGMENT" "$SETTINGS"
    echo "Created $SETTINGS from fragment"
fi

echo
echo "Done. Hooks are installed at:"
echo "  $HOOKS_DIR/worktree-create.sh"
echo "  $HOOKS_DIR/worktree-remove.sh"
echo
echo "Settings updated at: $SETTINGS"
echo
echo "If your project repos live somewhere unusual, you can also set"
echo "  export CLAUDE_WORKTREE_REPO=/path/to/your/repo"
echo "or"
echo "  export CLAUDE_WORKTREE_REPO_HINTS=/path/to/repo1:/path/to/repo2"
echo "in your shell profile, so the hook can find the repo when the session's"
echo "cwd isn't inside one. The hook also auto-detects by walking up from cwd."

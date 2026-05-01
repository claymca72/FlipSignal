# Claude Worktree Hooks — One-Time Install

These four files configure Claude Code's `WorktreeCreate` / `WorktreeRemove` hooks so that the `Agent` tool's `isolation: "worktree"` parameter works in Cowork sessions whose own working directory isn't a git repo.

Once installed, when an agent is launched with `isolation: "worktree"`, Claude Code:

1. Calls `~/.claude/hooks/worktree-create.sh` with the session's cwd.
2. The hook locates a git repo (env vars → cwd → walking up → hint list), creates a fresh worktree at `<repo>/.claude-worktrees/<name>` on a new branch `claude/<name>`, and prints the worktree path.
3. The agent runs in that worktree.
4. When the agent ends, Claude Code calls `worktree-remove.sh`, which cleans up the worktree and the temp branch.

The `.claude-worktrees/` directory is automatically added to your repo's `.gitignore`.

## Files

- `worktree-create.sh` — the create hook
- `worktree-remove.sh` — the remove hook
- `settings-fragment.json` — the JSON block that gets merged into `~/.claude/settings.json`
- `install.sh` — the installer

## Install

From a regular Terminal on your Mac (not from inside Cowork), run:

```sh
bash "/Volumes/MyStuff/Projects/FlipSignal/.claude-setup/install.sh"
```

The installer:

- Copies the two `.sh` files to `~/.claude/hooks/` and makes them executable.
- Backs up your existing `~/.claude/settings.json` (if any) to `settings.json.bak.<timestamp>`.
- Deep-merges the fragment into `settings.json` so any other settings you have are preserved.

## Verifying

After running the installer:

```sh
ls -la ~/.claude/hooks/
cat ~/.claude/settings.json | python3 -m json.tool
```

You should see both scripts and a `hooks` block with `WorktreeCreate` and `WorktreeRemove` entries.

## Optional environment variables

The hook auto-detects a git repo by walking up from the session's cwd. If your sessions usually run from a non-repo cwd (e.g., Cowork's outputs folder), set one of these in `~/.zshrc` or `~/.bashrc`:

- `CLAUDE_WORKTREE_REPO=/Volumes/MyStuff/Projects/FlipSignal` — pin a single repo.
- `CLAUDE_WORKTREE_REPO_HINTS=/Volumes/MyStuff/Projects/FlipSignal:/Volumes/MyStuff/Projects/gymdiy-2-0` — colon-separated list, tried in order.

## Uninstall

```sh
rm ~/.claude/hooks/worktree-create.sh ~/.claude/hooks/worktree-remove.sh
```

And remove the `WorktreeCreate` / `WorktreeRemove` blocks from `~/.claude/settings.json`. The most recent `.bak` file is your safety net.

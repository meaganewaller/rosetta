# Checkpoint

Save or review a named point in your workflow.

## Usage

```
/checkpoint create <name>
/checkpoint verify <name>
/checkpoint list
/checkpoint clear
```

## Create

1. Run a quick verification to confirm the current state is clean
2. Commit or stash with the checkpoint name
3. Append to `.claude/checkpoints.log`:
   ```
   YYYY-MM-DD HH:MM | <name> | <git-sha>
   ```
4. Confirm the checkpoint was recorded

## Verify

Compare the current state against a named checkpoint:

- Files added or modified since the checkpoint
- Test results now vs then
- Coverage now vs then
- Build status

Report the delta clearly so it's obvious whether the work since the checkpoint is clean.

## List

Show all recorded checkpoints: name, timestamp, git SHA, and whether the current HEAD is at, ahead of, or behind each one.

## Clear

Remove old checkpoints, keeping the most recent five.
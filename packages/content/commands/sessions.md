# Sessions

Manage Claude Code session history — list, load, alias, and inspect sessions stored in `~/.claude/sessions/`.

## Usage

```
/sessions                              # list all sessions
/sessions list --limit <n>             # limit results
/sessions list --date <YYYY-MM-DD>     # filter by date
/sessions list --search <pattern>      # search by session ID
/sessions load <id|alias>              # display session content and stats
/sessions alias <id> <name>            # create an alias
/sessions alias --remove <name>        # remove an alias
/sessions unalias <name>               # same as --remove
/sessions aliases                      # list all aliases
/sessions info <id|alias>              # show detailed session info
```

## Implementation

All actions delegate to the session manager library:

```bash
node -e "require('$PLUGIN_ROOT/scripts/lib/session-manager').<method>(...)" "$ARGUMENTS"
```

Where `$PLUGIN_ROOT` resolves to `$CLAUDE_PLUGIN_ROOT` or `~/.claude`.

## Behavior

**list** — show session ID, date, time, size, line count, and alias (if any). Default limit: 50.

**load** — resolve the argument as an alias first, then as a session ID. Display metadata (title, started, last updated, stats) followed by content.

**alias / unalias** — aliases are stored in `~/.claude/session-aliases.json`. Creating an alias on an already-aliased session replaces the existing alias.

**info** — same as load but metadata only, no content.

**aliases** — list all aliases with their target session filename and title.
# secret-scan

Scan a diff or files for committed secrets, and walk through safe remediation — rotate first,
then remove from code and history. Findings are reported with the value **redacted**.

## What's in it

| Component | File | What it does |
|-----------|------|--------------|
| **Command** | [`commands/secret-scan.md`](commands/secret-scan.md) | `/secret-scan [path]` — scans the staged diff (or given paths) and reports redacted findings with remediation. |
| **Skill** | [`skills/secret-remediation/SKILL.md`](skills/secret-remediation/SKILL.md) | Detection patterns and the correct remediation order, pulled in whenever secrets come up. |
| **Manifest** | [`.claude-plugin/plugin.json`](.claude-plugin/plugin.json) | Name, version, author, license, keywords. |

No hooks or MCP servers — only the components that translate cleanly across every harness.
The command **reports and advises**; it never rewrites git history on its own.

## Try it (Claude Code)

```
/plugin marketplace add meaganewaller/rosetta
/plugin install secret-scan@rosetta
/secret-scan
```

## Category

`Security` — see the [taxonomy](../../docs/categories.md).

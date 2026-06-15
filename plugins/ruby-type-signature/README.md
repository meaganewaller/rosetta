# Ruby Type Signatures

Expert guidance for using a type system (RBS or Sorbet) with Ruby.

## Installation

```bash
/plugin install ruby-type-signature@rosetta
```

## Components

### Commands

(None yet)

### Skills

Adapted from [ruby-type-signature-skills](https://github.com/DmitryPogrebnoy/ruby-agent-skills/tree/main/plugins/ruby-type-signature-skills) (MIT).

| Skill | Focus |
| ----- | ----- |
| **generating-rbs** | `sig/**/*.rbs` signatures for Steep/RBS |
| **generating-rbs-inline** | `# @rbs` / rbs-inline comments in `.rb` files |
| **generating-sorbet** | `rbi/**/*.rbi` shim files without editing source |
| **generating-sorbet-inline** | `sig { }` blocks and `# typed:` sigils in source |

Each skill includes reference material for syntax and production examples. Pick **one** system per project (RBS vs Sorbet; inline vs separate files).

### Agents

(None yet)

### Hooks

(None yet)

### MCP Servers

(None yet)
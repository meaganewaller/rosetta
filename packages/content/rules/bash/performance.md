> This file extends [common/performance.md](../common/performance.md) with Bash-specific content.

## Avoid subshells in loops

Each command substitution `$()` forks a subshell. In tight loops this is expensive:

```bash
# Slow — forks a subshell per iteration
for file in *.log; do
  size=$(wc -l < "$file")
  echo "$file: $size lines"
done

# Faster — single external process for all files
wc -l *.log
```

## Use builtins over external commands

Bash builtins run in the current process; external commands fork. Prefer builtins for string manipulation:

```bash
# Slow — forks a subshell + sed process
name=$(echo "$full_name" | sed 's/ .*//')

# Fast — builtin parameter expansion
name="${full_name%% *}"
```

Common substitutions:
- `${var#prefix}`, `${var%suffix}` — strip prefix/suffix
- `${var/old/new}` — replace first occurrence
- `${var//old/new}` — replace all occurrences
- `${#var}` — string length

## Batch external commands

When you need to process many items, feed them to one invocation of an external tool rather than calling it once per item:

```bash
# Slow — one grep per file
for file in "${files[@]}"; do
  grep -l "pattern" "$file"
done

# Fast — one grep invocation
grep -rl "pattern" "${files[@]}"
```

## Read large files efficiently

Use `while IFS= read -r line` for line-by-line processing rather than loading the entire file:

```bash
while IFS= read -r line; do
  process "$line"
done < "$input_file"
```

Avoid `cat file | while read line` — it forks an extra process and the `cat` is unnecessary.

## Know when to use a different language

Bash is appropriate for glue scripts, process orchestration, and simple file operations. For anything involving:
- Complex data structures
- JSON/YAML parsing beyond simple `jq` calls
- Arithmetic beyond integer math
- Significant string processing

...reach for Python, Node, or Go instead. A slow Bash script is often a sign it has outgrown the language.
> This file extends [common/security.md](../common/security.md) with Bash-specific content.

## Command injection

Never interpolate untrusted input directly into commands. Use arrays for arguments instead of constructing command strings:

```bash
# Unsafe — spaces, semicolons, or subshells in $filename break this
rm $filename

# Safe — filename is passed as a single argument regardless of content
rm -- "$filename"

# Unsafe — user input injected into a command string
eval "process $user_input"

# Safe — pass as argument, never eval user input
process "$user_input"
```

Never use `eval` with external input. If you find yourself reaching for `eval`, the design needs rethinking.

## Path traversal

Validate that file paths stay within expected directories:

```bash
safe_path() {
  local base="$1"
  local target
  target="$(realpath "$2")"

  if [[ "$target" != "$base"* ]]; then
    die "Path '$target' is outside '$base'"
  fi

  echo "$target"
}

output_file=$(safe_path "/var/app/uploads" "$user_provided_path")
```

## Temporary file races

Always use `mktemp` — never construct temp file paths manually. Predictable temp paths like `/tmp/myapp.tmp` are vulnerable to symlink attacks:

```bash
# Unsafe
TMPFILE="/tmp/myapp-$$.tmp"

# Safe
TMPFILE="$(mktemp)"
trap 'rm -f "$TMPFILE"' EXIT
```

## Secret handling

Never pass secrets as command-line arguments — they appear in `ps` output. Use environment variables or files with restricted permissions:

```bash
# Unsafe — visible in ps aux
curl -H "Authorization: Bearer $TOKEN" "$url"
# ^ This is fine — env vars in arguments are not exposed

# Unsafe — visible in process list
my_tool --password="$PASSWORD"

# Safe — use stdin or a credentials file
echo "$PASSWORD" | my_tool --password-stdin
# or
chmod 600 "$CREDENTIALS_FILE"
my_tool --credentials="$CREDENTIALS_FILE"
```

## Sensitive environment variables

When logging or debugging, avoid dumping the full environment:

```bash
# Unsafe
env
set

# Safe — log only what's needed
log "Deploying to: $TARGET_ENV"
```

Add `set +x` before any line that would print a secret in trace mode (`set -x`):

```bash
set +x
curl -H "Authorization: Bearer $API_TOKEN" "$url"
set -x
```
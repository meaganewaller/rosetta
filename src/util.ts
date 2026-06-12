// Small shared helpers for adapters.

/** Render a string as a single-line YAML scalar, quoting when a plain scalar would be unsafe. */
export function yamlScalar(s: string): string {
  const oneLine = s.replace(/\s+/g, " ").trim();
  if (oneLine === "" || /[:#]/.test(oneLine) || /^\s|\s$/.test(oneLine)) return JSON.stringify(oneLine);
  return oneLine;
}

/** Emit a SKILL.md (name + description frontmatter + body) — the shared Claude Code / Codex /
 * OpenCode / Gemini skill format. */
export function skillMd(name: string, description: string, body: string): string {
  return (
    `---\nname: ${yamlScalar(name)}\ndescription: ${yamlScalar(description)}\n---\n\n` +
    body.replace(/\s*$/, "") +
    "\n"
  );
}

/** TOML basic (double-quoted) string. JSON escaping is a valid subset of TOML escaping. */
export function tomlString(s: string): string {
  return JSON.stringify(s);
}

/** TOML multiline literal string ('''…'''), which preserves content verbatim (no escapes). */
export function tomlMultiline(s: string): string {
  const body = s.replace(/\s*$/, "");
  if (!body.includes("'''")) return `'''\n${body}\n'''`;
  return tomlString(body.replace(/\r?\n/g, "\\n")); // fall back to a basic string
}

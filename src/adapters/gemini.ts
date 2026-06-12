// Gemini CLI adapter. Maps a canonical plugin to Gemini CLI's native project files.
//
// Verified against geminicli.com/docs (June 2026):
//   - Skills:    .gemini/skills/<name>/SKILL.md — same SKILL.md format.
//   - Commands:  .gemini/commands/<name>.toml — `description` + `prompt`; args via {{args}}
//                (Claude's $1/$ARGUMENTS are a different syntax).
//   - Agents:    .gemini/agents/<name>.md — YAML frontmatter `name` + `description` (+ tools,
//                model, …); the body is the system prompt.
//   - MCP:       .gemini/settings.json — `mcpServers` object.
//   - Hooks:     no Gemini equivalent → skipped.

import type { Adapter, AdapterResult, CanonicalPlugin, OutputFile, ReportEntry } from "../contract.ts";
import { skillMd, tomlString, tomlMultiline, yamlScalar } from "../util.ts";

export const geminiAdapter: Adapter = {
  harness: "gemini",
  adapt(plugin: CanonicalPlugin): AdapterResult {
    const files: OutputFile[] = [];
    const report: ReportEntry[] = [];

    // Skills → .gemini/skills/<name>/SKILL.md (same format).
    for (const s of plugin.skills) {
      const path = `.gemini/skills/${s.name}/SKILL.md`;
      files.push({ path, contents: skillMd(s.name, s.description, s.body) });
      report.push({ component: `skill:${s.name}`, kind: "skill", status: "NATIVE", target: path });
    }

    // Commands → .gemini/commands/<name>.toml. Gemini injects arguments via {{args}}.
    for (const c of plugin.commands) {
      const path = `.gemini/commands/${c.name}.toml`;
      // Safe rewrite: $ARGUMENTS maps exactly to {{args}}. Positional $1..$9 have no equivalent.
      const prompt = c.body.replace(/\$ARGUMENTS\b/g, "{{args}}");
      const lines: string[] = [];
      if (c.description) lines.push(`description = ${tomlString(c.description)}`);
      lines.push(`prompt = ${tomlMultiline(prompt)}`);
      files.push({ path, contents: lines.join("\n") + "\n" });
      const lost: string[] = [];
      if (/\$\d/.test(c.body)) lost.push("positional args ($1..$9) — Gemini injects all args via {{args}}");
      if (c.allowedTools) lost.push("allowed-tools has no Gemini command equivalent");
      report.push({
        component: `command:${c.name}`,
        kind: "command",
        status: lost.length ? "DEMOTED" : "NATIVE",
        target: path,
        note: lost.length ? lost.join("; ") : undefined,
      });
    }

    // Agents → .gemini/agents/<name>.md (Markdown + YAML frontmatter). Subagent concept preserved.
    for (const a of plugin.agents) {
      const path = `.gemini/agents/${a.name}.md`;
      const fmLines = ["---", `name: ${yamlScalar(a.name)}`];
      if (a.description) fmLines.push(`description: ${yamlScalar(a.description)}`);
      fmLines.push("---");
      files.push({ path, contents: fmLines.join("\n") + "\n\n" + a.body.replace(/\s*$/, "") + "\n" });
      const lost: string[] = [];
      if (a.model) lost.push(`model (${a.model}) dropped — Gemini uses its own model ids`);
      if (a.tools) lost.push("tool list dropped — Gemini uses its own tool names");
      report.push({
        component: `agent:${a.name}`,
        kind: "agent",
        status: lost.length ? "DEMOTED" : "NATIVE",
        target: path,
        note: lost.length ? lost.join("; ") : undefined,
      });
    }

    // MCP → .gemini/settings.json `mcpServers`.
    if (plugin.mcp) {
      const path = `.gemini/settings.json`;
      const servers = (plugin.mcp as { mcpServers?: unknown }).mcpServers ?? plugin.mcp;
      files.push({ path, contents: JSON.stringify({ mcpServers: servers }, null, 2) + "\n" });
      const usesPluginRoot = JSON.stringify(plugin.mcp).includes("CLAUDE_PLUGIN_ROOT");
      report.push({
        component: "mcp:.mcp.json",
        kind: "mcp",
        status: usesPluginRoot ? "DEMOTED" : "NATIVE",
        target: path,
        note: usesPluginRoot
          ? "${CLAUDE_PLUGIN_ROOT} does not resolve in Gemini CLI"
          : "merge `mcpServers` into an existing .gemini/settings.json if present",
      });
    }

    // Hooks → skipped.
    if (plugin.hooks) {
      report.push({
        component: "hook:hooks.json",
        kind: "hook",
        status: "SKIPPED",
        target: null,
        note: "Hooks are Claude Code–specific; no Gemini CLI equivalent",
      });
    }

    return { harness: "gemini", plugin: plugin.name, files, report };
  },
};

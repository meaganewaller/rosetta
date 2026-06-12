// OpenCode adapter. Maps a canonical plugin to OpenCode's native project files.
//
// Verified against opencode.ai/docs (June 2026). OpenCode is the closest model to Claude
// Code, so this is the highest-fidelity adapter — every component has a native home:
//   - Skills:   .opencode/skills/<name>/SKILL.md — same SKILL.md format.
//   - Commands: .opencode/commands/<name>.md — frontmatter `description`; body supports both
//               $ARGUMENTS and positional $1..$9, so arguments transfer (unlike Cursor/Codex).
//   - Agents:   .opencode/agents/<name>.md — frontmatter `description` + `mode: subagent`.
//   - MCP:      opencode.json `mcp` key — { type: "local", command: [...] } / remote.
//   - Hooks:    OpenCode uses a TypeScript plugin system, not declarative hooks → skipped.

import type { Adapter, AdapterResult, CanonicalPlugin, OutputFile, ReportEntry } from "../contract.ts";
import { skillMd, yamlScalar } from "../util.ts";

/** Convert a Claude Code .mcp.json into OpenCode's `mcp` config object. */
function mcpToOpencode(mcp: unknown): { config: unknown; usesPluginRoot: boolean } {
  const usesPluginRoot = JSON.stringify(mcp).includes("CLAUDE_PLUGIN_ROOT");
  const servers = ((mcp as { mcpServers?: Record<string, Record<string, unknown>> }).mcpServers) ?? {};
  const out: Record<string, unknown> = {};
  for (const [name, cfg] of Object.entries(servers)) {
    if (typeof cfg.url === "string") {
      out[name] = { type: "remote", url: cfg.url, enabled: true, ...(cfg.headers ? { headers: cfg.headers } : {}) };
    } else {
      const command = [cfg.command, ...(Array.isArray(cfg.args) ? (cfg.args as unknown[]) : [])].filter(
        (x) => typeof x === "string",
      );
      out[name] = {
        type: "local",
        command,
        enabled: true,
        ...(cfg.env ? { environment: cfg.env } : {}),
      };
    }
  }
  return { config: { mcp: out }, usesPluginRoot };
}

export const opencodeAdapter: Adapter = {
  harness: "opencode",
  adapt(plugin: CanonicalPlugin): AdapterResult {
    const files: OutputFile[] = [];
    const report: ReportEntry[] = [];

    // Skills → .opencode/skills/<name>/SKILL.md (same format).
    for (const s of plugin.skills) {
      const path = `.opencode/skills/${s.name}/SKILL.md`;
      files.push({ path, contents: skillMd(s.name, s.description, s.body) });
      report.push({ component: `skill:${s.name}`, kind: "skill", status: "NATIVE", target: path });
    }

    // Commands → .opencode/commands/<name>.md. $1/$ARGUMENTS both interpolate, so args survive.
    for (const c of plugin.commands) {
      const path = `.opencode/commands/${c.name}.md`;
      const fm = c.description ? `---\ndescription: ${yamlScalar(c.description)}\n---\n\n` : "";
      files.push({ path, contents: fm + c.body.replace(/\s*$/, "") + "\n" });
      // allowed-tools has no command-level field (tool access is set on the agent a command runs as).
      report.push({
        component: `command:${c.name}`,
        kind: "command",
        status: c.allowedTools ? "DEMOTED" : "NATIVE",
        target: path,
        note: c.allowedTools
          ? "allowed-tools has no command-level equivalent (set tool access on an agent)"
          : undefined,
      });
    }

    // Agents → .opencode/agents/<name>.md with mode: subagent. The subagent concept is preserved.
    for (const a of plugin.agents) {
      const path = `.opencode/agents/${a.name}.md`;
      const fmLines = ["---"];
      if (a.description) fmLines.push(`description: ${yamlScalar(a.description)}`);
      fmLines.push("mode: subagent", "---");
      files.push({ path, contents: fmLines.join("\n") + "\n\n" + a.body.replace(/\s*$/, "") + "\n" });
      const lost: string[] = [];
      if (a.model) lost.push(`model (${a.model}) dropped — OpenCode uses provider/model ids`);
      if (a.tools) lost.push("tool list dropped — OpenCode scopes via the agent `permission` object");
      report.push({
        component: `agent:${a.name}`,
        kind: "agent",
        status: lost.length ? "DEMOTED" : "NATIVE",
        target: path,
        note: lost.length ? lost.join("; ") : undefined,
      });
    }

    // MCP → opencode.json `mcp`.
    if (plugin.mcp) {
      const path = `opencode.json`;
      const { config, usesPluginRoot } = mcpToOpencode(plugin.mcp);
      files.push({ path, contents: JSON.stringify(config, null, 2) + "\n" });
      report.push({
        component: "mcp:.mcp.json",
        kind: "mcp",
        status: usesPluginRoot ? "DEMOTED" : "NATIVE",
        target: path,
        note: usesPluginRoot
          ? "${CLAUDE_PLUGIN_ROOT} does not resolve in OpenCode"
          : "merge the `mcp` key into an existing opencode.json if present",
      });
    }

    // Hooks → skipped.
    if (plugin.hooks) {
      report.push({
        component: "hook:hooks.json",
        kind: "hook",
        status: "SKIPPED",
        target: null,
        note: "Hooks are Claude Code–specific; OpenCode uses a TypeScript plugin system instead",
      });
    }

    return { harness: "opencode", plugin: plugin.name, files, report };
  },
};

// Google Antigravity adapter. Maps a canonical plugin to Antigravity's native project files.
//
// Verified against antigravity.google/docs (June 2026). Antigravity is Google's agentic IDE
// (and CLI), built on the `.agents/` Agent Skills standard:
//   - Skills:    .agents/skills/<name>/SKILL.md — same SKILL.md format (name + description).
//   - Commands:  .agents/workflows/<name>.md — "saved prompts" invoked as slash commands
//                (`/name`). The slash-command concept survives (unlike Codex/Zed, which demote
//                commands to skills).
//   - Agents:    no per-file named subagent primitive. Antigravity uses AGENTS.md personas +
//                `.agents/rules/`, so an agent is demoted to a model-applied rule.
//   - MCP:       ~/.gemini/antigravity/mcp_config.json (`mcpServers`) — a GLOBAL file, not
//                project-scoped; remote servers use `serverUrl` (not `url`).
//   - Hooks:     no Antigravity equivalent → skipped.

import type { Adapter, AdapterResult, CanonicalPlugin, OutputFile, ReportEntry } from "../contract.ts";
import { skillMd } from "../util.ts";

/** Convert a Claude Code .mcp.json into Antigravity's mcp_config.json shape (remote → serverUrl). */
function mcpToAntigravity(mcp: unknown): { config: unknown; usesPluginRoot: boolean } {
  const usesPluginRoot = JSON.stringify(mcp).includes("CLAUDE_PLUGIN_ROOT");
  const servers = ((mcp as { mcpServers?: Record<string, Record<string, unknown>> }).mcpServers) ?? {};
  const out: Record<string, unknown> = {};
  for (const [name, cfg] of Object.entries(servers)) {
    if (typeof cfg.url === "string") {
      // Antigravity uses `serverUrl` for HTTP-based MCP servers, not `url`.
      out[name] = { serverUrl: cfg.url, ...(cfg.headers ? { headers: cfg.headers } : {}) };
    } else {
      out[name] = {
        command: cfg.command,
        ...(Array.isArray(cfg.args) ? { args: cfg.args } : {}),
        ...(cfg.env ? { env: cfg.env } : {}),
      };
    }
  }
  return { config: { mcpServers: out }, usesPluginRoot };
}

export const antigravityAdapter: Adapter = {
  harness: "antigravity",
  adapt(plugin: CanonicalPlugin): AdapterResult {
    const files: OutputFile[] = [];
    const report: ReportEntry[] = [];

    // Skills → .agents/skills/<name>/SKILL.md (same Agent Skills format).
    for (const s of plugin.skills) {
      const path = `.agents/skills/${s.name}/SKILL.md`;
      files.push({ path, contents: skillMd(s.name, s.description, s.body) });
      report.push({ component: `skill:${s.name}`, kind: "skill", status: "NATIVE", target: path });
    }

    // Commands → .agents/workflows/<name>.md (slash-invoked saved prompts). The /name concept survives.
    for (const c of plugin.commands) {
      const path = `.agents/workflows/${c.name}.md`;
      const header = c.description ? `${c.description}\n\n` : "";
      files.push({ path, contents: `${header + c.body.replace(/\s*$/, "")}\n` });
      const lost: string[] = [];
      if (c.allowedTools) lost.push("allowed-tools has no workflow equivalent (workflows don't scope tools)");
      if (c.argumentHint || /\$\d|\$ARGUMENTS/.test(c.body))
        lost.push("argument placeholders ($1/$ARGUMENTS) are not interpolated in workflows");
      report.push({
        component: `command:${c.name}`,
        kind: "command",
        status: lost.length ? "DEMOTED" : "NATIVE",
        target: path,
        note: lost.length ? lost.join("; ") : undefined,
      });
    }

    // Agents → .agents/rules/agent-<name>.md. Antigravity has no per-file subagent, so the persona
    // is demoted to a model-applied rule (guidance), not a separate subagent.
    for (const a of plugin.agents) {
      const path = `.agents/rules/agent-${a.name}.md`;
      const desc = a.description ?? `Behavior of the ${a.name} agent.`;
      files.push({ path, contents: `${desc}\n\n${a.body.replace(/\s*$/, "")}\n` });
      const lost = ["runs as a model-applied rule, not a separate subagent"];
      if (a.model) lost.push(`model (${a.model}) dropped — Antigravity uses its own model ids`);
      if (a.tools) lost.push("tool list dropped — Antigravity uses its own tool names");
      report.push({
        component: `agent:${a.name}`,
        kind: "agent",
        status: "DEMOTED",
        target: path,
        note: lost.join("; "),
      });
    }

    // MCP → mcp_config.json. Antigravity's MCP config is GLOBAL (~/.gemini/antigravity/), never
    // project-scoped, so this can't ship inside the project — always demoted.
    if (plugin.mcp) {
      const path = `.gemini/antigravity/mcp_config.json`;
      const { config, usesPluginRoot } = mcpToAntigravity(plugin.mcp);
      files.push({ path, contents: `${JSON.stringify(config, null, 2)}\n` });
      const note = [
        "Antigravity MCP config is global — install at ~/.gemini/antigravity/mcp_config.json, not in the project",
      ];
      if (usesPluginRoot) note.push(`${process.env.CLAUDE_PLUGIN_ROOT} does not resolve in Antigravity`);
      report.push({
        component: "mcp:.mcp.json",
        kind: "mcp",
        status: "DEMOTED",
        target: path,
        note: note.join("; "),
      });
    }

    // Hooks → skipped.
    if (plugin.hooks) {
      report.push({
        component: "hook:hooks.json",
        kind: "hook",
        status: "SKIPPED",
        target: null,
        note: "Hooks are Claude Code–specific; no Antigravity equivalent",
      });
    }

    return { harness: "antigravity", plugin: plugin.name, files, report };
  },
};

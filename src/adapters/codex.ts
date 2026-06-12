// Codex CLI adapter. Maps a canonical plugin to Codex's native project files.
//
// Verified against developers.openai.com/codex (June 2026):
//   - Skills:    .agents/skills/<name>/SKILL.md — same SKILL.md format (name + description
//                frontmatter + body). Scanned from cwd up to the repo root.
//   - Subagents: .codex/agents/<name>.toml — fields name / description / developer_instructions
//                (+ optional model, sandbox_mode, mcp_servers).
//   - MCP:       .codex/config.toml — [mcp_servers.<name>] tables.
//   - Commands:  custom prompts (~/.codex/prompts) are global-only AND deprecated; there is no
//                project-scoped slash command, so commands are demoted to skills.
//   - Hooks:     no Codex equivalent → skipped.

import type { Adapter, AdapterResult, CanonicalPlugin, OutputFile, ReportEntry } from "../contract.ts";
import { skillMd, tomlString, tomlMultiline } from "../util.ts";

function mcpToToml(mcp: unknown): { toml: string; usesPluginRoot: boolean } {
  const usesPluginRoot = JSON.stringify(mcp).includes("CLAUDE_PLUGIN_ROOT");
  const servers = ((mcp as { mcpServers?: Record<string, Record<string, unknown>> }).mcpServers) ?? {};
  const out: string[] = [];
  for (const [name, cfg] of Object.entries(servers)) {
    out.push(`[mcp_servers.${name}]`);
    if (typeof cfg.command === "string") out.push(`command = ${tomlString(cfg.command)}`);
    if (Array.isArray(cfg.args))
      out.push(`args = [${(cfg.args as unknown[]).map((a) => tomlString(String(a))).join(", ")}]`);
    if (typeof cfg.url === "string") out.push(`url = ${tomlString(cfg.url)}`);
    const env = cfg.env;
    if (env && typeof env === "object") {
      out.push(`[mcp_servers.${name}.env]`);
      for (const [k, v] of Object.entries(env as Record<string, unknown>))
        out.push(`${k} = ${tomlString(String(v))}`);
    }
    out.push("");
  }
  return { toml: out.join("\n").replace(/\n+$/, "\n"), usesPluginRoot };
}

export const codexAdapter: Adapter = {
  harness: "codex",
  adapt(plugin: CanonicalPlugin): AdapterResult {
    const files: OutputFile[] = [];
    const report: ReportEntry[] = [];

    // Skills → .agents/skills/<name>/SKILL.md (same format).
    for (const s of plugin.skills) {
      const path = `.agents/skills/${s.name}/SKILL.md`;
      files.push({ path, contents: skillMd(s.name, s.description, s.body) });
      report.push({ component: `skill:${s.name}`, kind: "skill", status: "NATIVE", target: path });
    }

    // Commands → skills. Codex has no project-scoped slash command (prompts are global + deprecated).
    for (const c of plugin.commands) {
      const path = `.agents/skills/${c.name}/SKILL.md`;
      const desc = c.description ?? `Run the ${c.name} workflow.`;
      files.push({ path, contents: skillMd(c.name, desc, c.body) });
      const lost = ["user-invoked slash command → explicitly-invoked skill"];
      if (c.allowedTools) lost.push("allowed-tools dropped");
      if (c.argumentHint || /\$\d|\$ARGUMENTS/.test(c.body))
        lost.push("argument placeholders not represented in a skill");
      report.push({
        component: `command:${c.name}`,
        kind: "command",
        status: "DEMOTED",
        target: path,
        note: lost.join("; "),
      });
    }

    // Agents → Codex subagents (.codex/agents/<name>.toml). The subagent concept is preserved.
    for (const a of plugin.agents) {
      const path = `.codex/agents/${a.name}.toml`;
      const lines = [
        `name = ${tomlString(a.name)}`,
        `description = ${tomlString(a.description ?? `The ${a.name} agent.`)}`,
        `developer_instructions = ${tomlMultiline(a.body)}`,
      ];
      files.push({ path, contents: lines.join("\n") + "\n" });
      const lost: string[] = [];
      if (a.model) lost.push(`model (${a.model}) dropped — Codex model namespace differs`);
      if (a.tools) lost.push("tool list dropped — Codex scopes via sandbox_mode / mcp_servers");
      report.push({
        component: `agent:${a.name}`,
        kind: "agent",
        status: lost.length ? "DEMOTED" : "NATIVE",
        target: path,
        note: lost.length ? lost.join("; ") : undefined,
      });
    }

    // MCP → .codex/config.toml [mcp_servers.<name>].
    if (plugin.mcp) {
      const path = `.codex/config.toml`;
      const { toml, usesPluginRoot } = mcpToToml(plugin.mcp);
      files.push({ path, contents: toml });
      report.push({
        component: "mcp:.mcp.json",
        kind: "mcp",
        status: usesPluginRoot ? "DEMOTED" : "NATIVE",
        target: path,
        note: usesPluginRoot
          ? "${CLAUDE_PLUGIN_ROOT} does not resolve in Codex"
          : "merge into an existing .codex/config.toml if present",
      });
    }

    // Hooks → skipped.
    if (plugin.hooks) {
      report.push({
        component: "hook:hooks.json",
        kind: "hook",
        status: "SKIPPED",
        target: null,
        note: "Hooks are Claude Code–specific; no Codex equivalent",
      });
    }

    return { harness: "codex", plugin: plugin.name, files, report };
  },
};

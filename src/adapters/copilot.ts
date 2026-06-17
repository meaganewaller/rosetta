// GitHub Copilot adapter. Maps a canonical plugin to Copilot's VS Code customization files.
//
// Verified against code.visualstudio.com/docs + docs.github.com (June 2026):
//   - Skills:   .github/skills/<name>/SKILL.md — the Agent Skills open standard (same SKILL.md;
//               also reads .claude/skills/ and .agents/skills/).
//   - Commands: .github/prompts/<name>.prompt.md — invoked as slash commands; frontmatter
//               `description` + `mode`. Uses ${input:…} variables, not $1/$ARGUMENTS.
//   - Agents:   .github/agents/<name>.agent.md — custom agents (formerly chat modes); a persona
//               with its own instructions, tools, and model.
//   - MCP:      .vscode/mcp.json — root key is `servers` (not `mcpServers`).
//   - Hooks:    no Copilot equivalent → skipped.

import type { Adapter, AdapterResult, CanonicalPlugin, OutputFile, ReportEntry } from "../contract.ts";
import { skillMd, yamlScalar } from "../util.ts";

function mdDoc(fields: string[], body: string): string {
  const fm = fields.length ? `${["---", ...fields, "---"].join("\n")}\n\n` : "";
  return `${fm + body.replace(/\s*$/, "")}\n`;
}

function mcpToVscode(mcp: unknown): { config: unknown; usesPluginRoot: boolean } {
  const usesPluginRoot = JSON.stringify(mcp).includes("CLAUDE_PLUGIN_ROOT");
  const servers = ((mcp as { mcpServers?: Record<string, Record<string, unknown>> }).mcpServers) ?? {};
  const out: Record<string, unknown> = {};
  for (const [name, cfg] of Object.entries(servers)) {
    if (typeof cfg.url === "string") {
      out[name] = { type: "http", url: cfg.url, ...(cfg.headers ? { headers: cfg.headers } : {}) };
    } else {
      out[name] = {
        type: "stdio",
        command: cfg.command,
        ...(Array.isArray(cfg.args) ? { args: cfg.args } : {}),
        ...(cfg.env ? { env: cfg.env } : {}),
      };
    }
  }
  return { config: { servers: out }, usesPluginRoot };
}

export const copilotAdapter: Adapter = {
  harness: "copilot",
  adapt(plugin: CanonicalPlugin): AdapterResult {
    const files: OutputFile[] = [];
    const report: ReportEntry[] = [];

    // Skills → .github/skills/<name>/SKILL.md (Agent Skills open standard).
    for (const s of plugin.skills) {
      const path = `.github/skills/${s.name}/SKILL.md`;
      files.push({ path, contents: skillMd(s.name, s.description, s.body) });
      report.push({ component: `skill:${s.name}`, kind: "skill", status: "NATIVE", target: path });
    }

    // Commands → .github/prompts/<name>.prompt.md (slash-invoked prompt files).
    for (const c of plugin.commands) {
      const path = `.github/prompts/${c.name}.prompt.md`;
      const fields = ["mode: agent"];
      if (c.description) fields.unshift(`description: ${yamlScalar(c.description)}`);
      files.push({ path, contents: mdDoc(fields, c.body) });
      const lost: string[] = [];
      if (/\$\d|\$ARGUMENTS/.test(c.body))
        lost.push(`Copilot prompt files use \`${process.env.CLAUDE_PLUGIN_ROOT}/bin/x\` variables, not $1/$ARGUMENTS`);
      if (c.allowedTools) lost.push("allowed-tools not mapped — Copilot uses its own tool names");
      report.push({
        component: `command:${c.name}`,
        kind: "command",
        status: lost.length ? "DEMOTED" : "NATIVE",
        target: path,
        note: lost.length ? lost.join("; ") : undefined,
      });
    }

    // Agents → .github/agents/<name>.agent.md (custom agents / personas).
    for (const a of plugin.agents) {
      const path = `.github/agents/${a.name}.agent.md`;
      const fields: string[] = [];
      if (a.description) fields.push(`description: ${yamlScalar(a.description)}`);
      files.push({ path, contents: mdDoc(fields, a.body) });
      const lost: string[] = [];
      if (a.model) lost.push(`model (${a.model}) dropped — Copilot uses its own model ids`);
      if (a.tools) lost.push("tool list dropped — Copilot uses its own tool names");
      report.push({
        component: `agent:${a.name}`,
        kind: "agent",
        status: lost.length ? "DEMOTED" : "NATIVE",
        target: path,
        note: lost.length ? lost.join("; ") : undefined,
      });
    }

    // MCP → .vscode/mcp.json (root key `servers`).
    if (plugin.mcp) {
      const path = `.vscode/mcp.json`;
      const { config, usesPluginRoot } = mcpToVscode(plugin.mcp);
      files.push({ path, contents: `${JSON.stringify(config, null, 2)}\n` });
      report.push({
        component: "mcp:.mcp.json",
        kind: "mcp",
        status: usesPluginRoot ? "DEMOTED" : "NATIVE",
        target: path,
        note: usesPluginRoot
          ? `${process.env.CLAUDE_PLUGIN_ROOT} does not resolve in Copilot/VS Code`
          : "merge `servers` into an existing .vscode/mcp.json if present",
      });
    }

    // Hooks → skipped.
    if (plugin.hooks) {
      report.push({
        component: "hook:hooks.json",
        kind: "hook",
        status: "SKIPPED",
        target: null,
        note: "Hooks are Claude Code–specific; no Copilot equivalent",
      });
    }

    return { harness: "copilot", plugin: plugin.name, files, report };
  },
};

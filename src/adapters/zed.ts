// Zed adapter. Maps a canonical plugin to Zed's native project files.
//
// Verified against zed.dev/docs/ai (June 2026). Zed replaced its old "Rules" with Skills and
// moved always-on instructions to AGENTS.md, so its agent-customization surface is now:
//   - Skills:   .agents/skills/<name>/SKILL.md — the Agent Skills open standard (name +
//               description frontmatter, optional `disable-model-invocation`). Slash-invoked
//               (`/name`) or @-mentioned.
//   - Commands: Zed has no separate slash-command primitive — skills ARE the slash commands —
//               so a command becomes a skill with `disable-model-invocation: true` (kept
//               explicitly-invoked, not autonomous).
//   - Agents:   no file-based subagent with a system prompt (Agent Profiles are tool scopes;
//               External Agents are ACP binaries), so an agent's persona is demoted to a skill.
//   - MCP:      .zed/settings.json `context_servers` — local { command, args, env } / remote
//               { url, headers }.
//   - Hooks:    no Zed equivalent → skipped.

import type { Adapter, AdapterResult, CanonicalPlugin, OutputFile, ReportEntry } from "../contract.ts";
import { skillMd, yamlScalar } from "../util.ts";

/** A SKILL.md whose model-invocation is disabled — i.e. invoked only via /name or @name. */
function manualSkillMd(name: string, description: string, body: string): string {
  return (
    `---\nname: ${yamlScalar(name)}\ndescription: ${yamlScalar(description)}\n` +
    `disable-model-invocation: true\n---\n\n` +
    body.replace(/\s*$/, "") +
    "\n"
  );
}

/** Convert a Claude Code .mcp.json into Zed's `context_servers` object. */
function mcpToZed(mcp: unknown): { config: unknown; usesPluginRoot: boolean } {
  const usesPluginRoot = JSON.stringify(mcp).includes("CLAUDE_PLUGIN_ROOT");
  const servers = ((mcp as { mcpServers?: Record<string, Record<string, unknown>> }).mcpServers) ?? {};
  const out: Record<string, unknown> = {};
  for (const [name, cfg] of Object.entries(servers)) {
    if (typeof cfg.url === "string") {
      out[name] = { url: cfg.url, ...(cfg.headers ? { headers: cfg.headers } : {}) };
    } else {
      out[name] = {
        command: cfg.command,
        ...(Array.isArray(cfg.args) ? { args: cfg.args } : {}),
        ...(cfg.env ? { env: cfg.env } : {}),
      };
    }
  }
  return { config: { context_servers: out }, usesPluginRoot };
}

export const zedAdapter: Adapter = {
  harness: "zed",
  adapt(plugin: CanonicalPlugin): AdapterResult {
    const files: OutputFile[] = [];
    const report: ReportEntry[] = [];

    // Skills → .agents/skills/<name>/SKILL.md (same Agent Skills format).
    for (const s of plugin.skills) {
      const path = `.agents/skills/${s.name}/SKILL.md`;
      files.push({ path, contents: skillMd(s.name, s.description, s.body) });
      report.push({ component: `skill:${s.name}`, kind: "skill", status: "NATIVE", target: path });
    }

    // Commands → skills with model-invocation disabled. Zed has no command primitive, but skills
    // are slash-invoked (`/name`), so `disable-model-invocation: true` keeps the explicit-invoke feel.
    for (const c of plugin.commands) {
      const path = `.agents/skills/${c.name}/SKILL.md`;
      const desc = c.description ?? `Run the ${c.name} workflow.`;
      files.push({ path, contents: manualSkillMd(c.name, desc, c.body) });
      const lost = ["slash command → manually-invoked skill (disable-model-invocation)"];
      if (c.allowedTools) lost.push("allowed-tools dropped — Zed scopes tools via agent profiles");
      if (c.argumentHint || /\$\d|\$ARGUMENTS/.test(c.body))
        lost.push("argument placeholders ($1/$ARGUMENTS) are not interpolated in skills");
      report.push({
        component: `command:${c.name}`,
        kind: "command",
        status: "DEMOTED",
        target: path,
        note: lost.join("; "),
      });
    }

    // Agents → skills. Zed has no file-based subagent persona (profiles are tool scopes), so the
    // persona is demoted to a model-invoked skill.
    for (const a of plugin.agents) {
      const path = `.agents/skills/${a.name}/SKILL.md`;
      const desc = a.description ?? `Behavior of the ${a.name} agent.`;
      files.push({ path, contents: skillMd(a.name, desc, a.body) });
      const lost = ["no file-based subagent — runs as a model-invoked skill, not a separate subagent"];
      if (a.model) lost.push(`model (${a.model}) dropped — Zed uses provider/model ids`);
      if (a.tools) lost.push("tool list dropped — Zed scopes tools via agent profiles");
      report.push({
        component: `agent:${a.name}`,
        kind: "agent",
        status: "DEMOTED",
        target: path,
        note: lost.join("; "),
      });
    }

    // MCP → .zed/settings.json `context_servers`.
    if (plugin.mcp) {
      const path = `.zed/settings.json`;
      const { config, usesPluginRoot } = mcpToZed(plugin.mcp);
      files.push({ path, contents: JSON.stringify(config, null, 2) + "\n" });
      report.push({
        component: "mcp:.mcp.json",
        kind: "mcp",
        status: usesPluginRoot ? "DEMOTED" : "NATIVE",
        target: path,
        note: usesPluginRoot
          ? "${CLAUDE_PLUGIN_ROOT} does not resolve in Zed"
          : "merge `context_servers` into an existing .zed/settings.json if present",
      });
    }

    // Hooks → skipped.
    if (plugin.hooks) {
      report.push({
        component: "hook:hooks.json",
        kind: "hook",
        status: "SKIPPED",
        target: null,
        note: "Hooks are Claude Code–specific; no Zed equivalent",
      });
    }

    return { harness: "zed", plugin: plugin.name, files, report };
  },
};

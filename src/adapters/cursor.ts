// Cursor adapter. Maps a canonical plugin to Cursor's native files.
//
// Verified against cursor.com/docs (June 2026):
//   - Rules:    .cursor/rules/<name>.mdc — frontmatter description / globs / alwaysApply.
//               "Apply Intelligently" = description set + alwaysApply:false (model-invoked).
//   - Commands: .cursor/commands/<name>.md — NO frontmatter; file body is the prompt.
//   - MCP:      .cursor/mcp.json — same mcpServers schema as Claude Code.
//   - Hooks:    no Cursor equivalent → skipped.
//   - Agents:   no file-based subagent primitive → demoted to a rule.

import type {
  Adapter,
  AdapterResult,
  CanonicalPlugin,
  OutputFile,
  ReportEntry,
} from "../contract.ts";

/** Emit an "Apply Intelligently" rule: description-triggered, not always-on. */
function mdcRule(description: string, body: string): string {
  const fm = ["---", `description: ${yamlScalar(description)}`, "alwaysApply: false", "---", ""].join(
    "\n",
  );
  return fm + body.replace(/\s*$/, "") + "\n";
}

/** Render a string as a single-line YAML scalar, quoting when a plain scalar would be unsafe. */
function yamlScalar(s: string): string {
  const oneLine = s.replace(/\s+/g, " ").trim();
  if (oneLine === "" || /[:#]/.test(oneLine) || /^\s|\s$/.test(oneLine)) return JSON.stringify(oneLine);
  return oneLine;
}

export const cursorAdapter: Adapter = {
  harness: "cursor",
  adapt(plugin: CanonicalPlugin): AdapterResult {
    const files: OutputFile[] = [];
    const report: ReportEntry[] = [];
    const ruleDir = `.cursor/rules/${plugin.name}`; // namespace rules per plugin to avoid collisions

    // Skills → "Apply Intelligently" rules. Model-invoked knowledge maps cleanly.
    for (const s of plugin.skills) {
      const path = `${ruleDir}/${s.name}.mdc`;
      files.push({ path, contents: mdcRule(s.description, s.body) });
      report.push({ component: `skill:${s.name}`, kind: "skill", status: "NATIVE", target: path });
    }

    // Commands → .cursor/commands/<name>.md (body only; Cursor commands have no frontmatter).
    for (const c of plugin.commands) {
      const path = `.cursor/commands/${c.name}.md`;
      const header = c.description ? `${c.description}\n\n` : "";
      files.push({ path, contents: header + c.body.replace(/\s*$/, "") + "\n" });
      const lost: string[] = [];
      if (c.allowedTools) lost.push("allowed-tools has no Cursor equivalent");
      if (c.argumentHint || /\$\d|\$ARGUMENTS/.test(c.body))
        lost.push("argument placeholders ($1/$ARGUMENTS) may not interpolate");
      report.push({
        component: `command:${c.name}`,
        kind: "command",
        status: lost.length ? "DEMOTED" : "NATIVE",
        target: path,
        note: lost.length ? lost.join("; ") : undefined,
      });
    }

    // Agents → demoted to "Apply Intelligently" rules. Cursor has no file-based subagent.
    for (const a of plugin.agents) {
      const path = `${ruleDir}/agent-${a.name}.mdc`;
      const desc = a.description ?? `Behavior of the ${a.name} agent.`;
      files.push({ path, contents: mdcRule(desc, a.body) });
      const lost = ["runs inline as a rule, not as a separate subagent"];
      if (a.tools) lost.push("tool scoping dropped");
      if (a.model) lost.push(`model override (${a.model}) dropped`);
      report.push({
        component: `agent:${a.name}`,
        kind: "agent",
        status: "DEMOTED",
        target: path,
        note: lost.join("; "),
      });
    }

    // MCP → .cursor/mcp.json (same schema). ${CLAUDE_PLUGIN_ROOT} won't resolve in Cursor.
    if (plugin.mcp) {
      const path = `.cursor/mcp.json`;
      files.push({ path, contents: JSON.stringify(plugin.mcp, null, 2) + "\n" });
      const usesPluginRoot = JSON.stringify(plugin.mcp).includes("CLAUDE_PLUGIN_ROOT");
      report.push({
        component: "mcp:.mcp.json",
        kind: "mcp",
        status: usesPluginRoot ? "DEMOTED" : "NATIVE",
        target: path,
        note: usesPluginRoot
          ? "${CLAUDE_PLUGIN_ROOT} does not resolve in Cursor; use ${workspaceFolder}"
          : undefined,
      });
    }

    // Hooks → skipped. No Cursor plugin-hook equivalent.
    if (plugin.hooks) {
      report.push({
        component: "hook:hooks.json",
        kind: "hook",
        status: "SKIPPED",
        target: null,
        note: "Hooks are Claude Code–specific; no Cursor equivalent",
      });
    }

    return { harness: "cursor", plugin: plugin.name, files, report };
  },
};

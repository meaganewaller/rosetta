// Golden-file tests for the Antigravity adapter. Run from the repo root: `node --test`.
//
// Regenerate goldens after an intentional adapter change:
//   node src/cli.ts add changelog --harness antigravity --into tests/golden/antigravity/changelog

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { loadPlugin } from "../src/load.ts";
import { antigravityAdapter } from "../src/adapters/antigravity.ts";
import type { CanonicalPlugin } from "../src/contract.ts";

const GOLDEN_ROOT = "tests/golden/antigravity/changelog";

function emptyPlugin(over: Partial<CanonicalPlugin>): CanonicalPlugin {
  return {
    name: "demo",
    dir: ".",
    manifest: { name: "demo" },
    skills: [],
    commands: [],
    agents: [],
    mcp: null,
    hooks: null,
    ...over,
  };
}

test("antigravity adapter: changelog output matches goldens byte-for-byte", () => {
  const result = antigravityAdapter.adapt(loadPlugin("plugins/changelog"));
  assert.ok(result.files.length > 0, "adapter produced no files");
  for (const f of result.files) {
    const goldenPath = join(GOLDEN_ROOT, f.path);
    assert.ok(existsSync(goldenPath), `missing golden file: ${goldenPath}`);
    assert.equal(f.contents, readFileSync(goldenPath, "utf8"), `content mismatch: ${f.path}`);
  }
});

test("antigravity adapter: changelog report records the expected fidelity", () => {
  const { report } = antigravityAdapter.adapt(loadPlugin("plugins/changelog"));
  const status = Object.fromEntries(report.map((e) => [e.component, e.status]));
  assert.equal(status["skill:keep-a-changelog"], "NATIVE"); // same SKILL.md format
  assert.equal(status["command:changelog"], "DEMOTED"); // $1 + allowed-tools
  assert.equal(status["agent:release-notes-writer"], "DEMOTED"); // no per-file subagent → rule
});

test("antigravity adapter: a plain command maps NATIVE to a workflow", () => {
  const result = antigravityAdapter.adapt(
    emptyPlugin({ commands: [{ name: "echo", description: "Echo.", body: "Repeat it back." }] }),
  );
  const entry = result.report.find((e) => e.component === "command:echo");
  assert.equal(entry?.status, "NATIVE");
  assert.equal(entry?.target, ".agents/workflows/echo.md");
});

test("antigravity adapter: an agent is always DEMOTED to a rule (no subagent primitive)", () => {
  const result = antigravityAdapter.adapt(
    emptyPlugin({ agents: [{ name: "explorer", description: "Explore.", body: "Look around." }] }),
  );
  const entry = result.report.find((e) => e.component === "agent:explorer");
  assert.equal(entry?.status, "DEMOTED");
  assert.equal(entry?.target, ".agents/rules/agent-explorer.md");
  assert.match(entry?.note ?? "", /not a separate subagent/);
});

test("antigravity adapter: MCP → mcp_config.json, DEMOTED (global), remote uses serverUrl", () => {
  const remote = antigravityAdapter.adapt(
    emptyPlugin({ mcp: { mcpServers: { api: { url: "https://example.com/mcp" } } } }),
  );
  const entry = remote.report.find((e) => e.kind === "mcp");
  assert.equal(entry?.status, "DEMOTED"); // Antigravity MCP config is global, never project-scoped
  const cfg = remote.files.find((f) => f.path === ".gemini/antigravity/mcp_config.json");
  assert.ok(cfg, "expected mcp_config.json");
  const parsed = JSON.parse(cfg!.contents);
  assert.equal(parsed.mcpServers.api.serverUrl, "https://example.com/mcp"); // url → serverUrl
  assert.ok(!("url" in parsed.mcpServers.api), "remote `url` should become `serverUrl`");

  const rooted = antigravityAdapter.adapt(
    emptyPlugin({ mcp: { mcpServers: { x: { command: "${CLAUDE_PLUGIN_ROOT}/x" } } } }),
  );
  assert.match(rooted.report.find((e) => e.kind === "mcp")?.note ?? "", /CLAUDE_PLUGIN_ROOT/);
});

test("antigravity adapter: hooks are skipped with a reason", () => {
  const result = antigravityAdapter.adapt(emptyPlugin({ hooks: { hooks: { PreToolUse: [] } } }));
  const entry = result.report.find((e) => e.kind === "hook");
  assert.equal(entry?.status, "SKIPPED");
  assert.equal(entry?.target, null);
});

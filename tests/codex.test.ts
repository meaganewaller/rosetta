// Golden-file tests for the Codex adapter. Run from the repo root: `node --test`.
//
// Regenerate goldens after an intentional adapter change:
//   node src/cli.ts add changelog --harness codex --into tests/golden/codex/changelog

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { loadPlugin } from "../src/load.ts";
import { codexAdapter } from "../src/adapters/codex.ts";
import type { CanonicalPlugin } from "../src/contract.ts";

const GOLDEN_ROOT = "tests/golden/codex/changelog";

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

test("codex adapter: changelog output matches goldens byte-for-byte", () => {
  const result = codexAdapter.adapt(loadPlugin("plugins/changelog"));
  assert.ok(result.files.length > 0, "adapter produced no files");
  for (const f of result.files) {
    const goldenPath = join(GOLDEN_ROOT, f.path);
    assert.ok(existsSync(goldenPath), `missing golden file: ${goldenPath}`);
    assert.equal(f.contents, readFileSync(goldenPath, "utf8"), `content mismatch: ${f.path}`);
  }
});

test("codex adapter: changelog report records the expected fidelity", () => {
  const { report } = codexAdapter.adapt(loadPlugin("plugins/changelog"));
  const status = Object.fromEntries(report.map((e) => [e.component, e.status]));
  assert.equal(status["skill:keep-a-changelog"], "NATIVE"); // same SKILL.md format
  assert.equal(status["command:changelog"], "DEMOTED"); // no project slash command → skill
  assert.equal(status["agent:release-notes-writer"], "DEMOTED"); // subagent kept; model/tools dropped
});

test("codex adapter: an agent with no model/tools maps NATIVE to a subagent", () => {
  const result = codexAdapter.adapt(
    emptyPlugin({ agents: [{ name: "explorer", description: "Explore.", body: "Look around." }] }),
  );
  const entry = result.report.find((e) => e.component === "agent:explorer");
  assert.equal(entry?.status, "NATIVE");
  assert.equal(entry?.target, ".codex/agents/explorer.toml");
});

test("codex adapter: MCP → config.toml, DEMOTED when it uses CLAUDE_PLUGIN_ROOT", () => {
  const plain = codexAdapter.adapt(
    emptyPlugin({ mcp: { mcpServers: { db: { command: "psql", args: ["--db"] } } } }),
  );
  const plainEntry = plain.report.find((e) => e.kind === "mcp");
  assert.equal(plainEntry?.status, "NATIVE");
  assert.ok(plain.files.some((f) => f.path === ".codex/config.toml" && f.contents.includes("[mcp_servers.db]")));

  const command = `${process.env.CLAUDE_PLUGIN_ROOT}/bin/x`;

  const rooted = codexAdapter.adapt(
    emptyPlugin({ mcp: { mcpServers: { x: { command } } } }),
  );
  assert.equal(rooted.report.find((e) => e.kind === "mcp")?.status, "DEMOTED");
});

test("codex adapter: hooks are skipped with a reason", () => {
  const result = codexAdapter.adapt(emptyPlugin({ hooks: { hooks: { PreToolUse: [] } } }));
  const entry = result.report.find((e) => e.kind === "hook");
  assert.equal(entry?.status, "SKIPPED");
  assert.equal(entry?.target, null);
});

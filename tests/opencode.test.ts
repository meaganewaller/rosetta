// Golden-file tests for the OpenCode adapter. Run from the repo root: `node --test`.
//
// Regenerate goldens after an intentional adapter change:
//   node src/cli.ts add changelog --harness opencode --into tests/golden/opencode/changelog

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { loadPlugin } from "../src/load.ts";
import { opencodeAdapter } from "../src/adapters/opencode.ts";
import type { CanonicalPlugin } from "../src/contract.ts";

const GOLDEN_ROOT = "tests/golden/opencode/changelog";

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

test("opencode adapter: changelog output matches goldens byte-for-byte", () => {
  const result = opencodeAdapter.adapt(loadPlugin("plugins/changelog"));
  assert.ok(result.files.length > 0, "adapter produced no files");
  for (const f of result.files) {
    const goldenPath = join(GOLDEN_ROOT, f.path);
    assert.ok(existsSync(goldenPath), `missing golden file: ${goldenPath}`);
    assert.equal(f.contents, readFileSync(goldenPath, "utf8"), `content mismatch: ${f.path}`);
  }
});

test("opencode adapter: changelog report records the expected fidelity", () => {
  const { report } = opencodeAdapter.adapt(loadPlugin("plugins/changelog"));
  const status = Object.fromEntries(report.map((e) => [e.component, e.status]));
  assert.equal(status["skill:keep-a-changelog"], "NATIVE"); // same SKILL.md format
  assert.equal(status["command:changelog"], "DEMOTED"); // allowed-tools dropped ($1 survives)
  assert.equal(status["agent:release-notes-writer"], "DEMOTED"); // model + tools dropped
});

test("opencode adapter: a bare command (no allowed-tools) stays NATIVE and keeps $1", () => {
  const result = opencodeAdapter.adapt(
    emptyPlugin({
      commands: [{ name: "greet", description: "Greet.", body: "Say hello to $1." }],
    }),
  );
  const entry = result.report.find((e) => e.component === "command:greet");
  assert.equal(entry?.status, "NATIVE"); // OpenCode interpolates $1, so no demotion
  const file = result.files.find((f) => f.path === ".opencode/commands/greet.md");
  assert.ok(file?.contents.includes("$1"), "positional argument should be preserved");
});

test("opencode adapter: a bare agent (no model/tools) stays NATIVE as a subagent", () => {
  const result = opencodeAdapter.adapt(
    emptyPlugin({ agents: [{ name: "explorer", description: "Explore.", body: "Look around." }] }),
  );
  const entry = result.report.find((e) => e.component === "agent:explorer");
  assert.equal(entry?.status, "NATIVE");
  const file = result.files.find((f) => f.path === ".opencode/agents/explorer.md");
  assert.ok(file?.contents.includes("mode: subagent"));
});

test("opencode adapter: MCP → opencode.json, DEMOTED when it uses CLAUDE_PLUGIN_ROOT", () => {
  const plain = opencodeAdapter.adapt(
    emptyPlugin({ mcp: { mcpServers: { db: { command: "psql", args: ["--db"] } } } }),
  );
  assert.equal(plain.report.find((e) => e.kind === "mcp")?.status, "NATIVE");
  const cfg = plain.files.find((f) => f.path === "opencode.json");
  assert.ok(cfg && JSON.parse(cfg.contents).mcp.db.type === "local");

  const command = `${process.env.CLAUDE_PLUGIN_ROOT}/bin/x`;

  const rooted = opencodeAdapter.adapt(
    emptyPlugin({ mcp: { mcpServers: { x: { command } } } }),
  );
  assert.equal(rooted.report.find((e) => e.kind === "mcp")?.status, "DEMOTED");
});

test("opencode adapter: hooks are skipped with a reason", () => {
  const result = opencodeAdapter.adapt(emptyPlugin({ hooks: { hooks: { PreToolUse: [] } } }));
  const entry = result.report.find((e) => e.kind === "hook");
  assert.equal(entry?.status, "SKIPPED");
  assert.equal(entry?.target, null);
});

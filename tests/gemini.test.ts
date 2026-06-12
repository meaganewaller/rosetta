// Golden-file tests for the Gemini CLI adapter. Run from the repo root: `node --test`.
//
// Regenerate goldens after an intentional adapter change:
//   node src/cli.ts add changelog --harness gemini --into tests/golden/gemini/changelog

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { loadPlugin } from "../src/load.ts";
import { geminiAdapter } from "../src/adapters/gemini.ts";
import type { CanonicalPlugin } from "../src/contract.ts";

const GOLDEN_ROOT = "tests/golden/gemini/changelog";

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

test("gemini adapter: changelog output matches goldens byte-for-byte", () => {
  const result = geminiAdapter.adapt(loadPlugin("plugins/changelog"));
  assert.ok(result.files.length > 0, "adapter produced no files");
  for (const f of result.files) {
    const goldenPath = join(GOLDEN_ROOT, f.path);
    assert.ok(existsSync(goldenPath), `missing golden file: ${goldenPath}`);
    assert.equal(f.contents, readFileSync(goldenPath, "utf8"), `content mismatch: ${f.path}`);
  }
});

test("gemini adapter: changelog report records the expected fidelity", () => {
  const { report } = geminiAdapter.adapt(loadPlugin("plugins/changelog"));
  const status = Object.fromEntries(report.map((e) => [e.component, e.status]));
  assert.equal(status["skill:keep-a-changelog"], "NATIVE");
  assert.equal(status["command:changelog"], "DEMOTED"); // $1 + allowed-tools
  assert.equal(status["agent:release-notes-writer"], "DEMOTED"); // model + tools dropped
});

test("gemini adapter: $ARGUMENTS is rewritten to {{args}}", () => {
  const result = geminiAdapter.adapt(
    emptyPlugin({
      commands: [{ name: "echo", description: "Echo.", body: "Repeat $ARGUMENTS back." }],
    }),
  );
  const file = result.files.find((f) => f.path === ".gemini/commands/echo.toml");
  assert.ok(file?.contents.includes("{{args}}"), "$ARGUMENTS should become {{args}}");
  assert.ok(!file?.contents.includes("$ARGUMENTS"), "no $ARGUMENTS should remain");
  // No positional args and no allowed-tools → NATIVE.
  assert.equal(result.report.find((e) => e.component === "command:echo")?.status, "NATIVE");
});

test("gemini adapter: an agent with no model/tools maps NATIVE to a subagent", () => {
  const result = geminiAdapter.adapt(
    emptyPlugin({ agents: [{ name: "explorer", description: "Explore.", body: "Look around." }] }),
  );
  assert.equal(result.report.find((e) => e.component === "agent:explorer")?.status, "NATIVE");
  const file = result.files.find((f) => f.path === ".gemini/agents/explorer.md");
  assert.ok(file?.contents.includes("name: explorer"));
});

test("gemini adapter: MCP → settings.json, DEMOTED when it uses CLAUDE_PLUGIN_ROOT", () => {
  const plain = geminiAdapter.adapt(
    emptyPlugin({ mcp: { mcpServers: { db: { command: "psql" } } } }),
  );
  assert.equal(plain.report.find((e) => e.kind === "mcp")?.status, "NATIVE");
  const cfg = plain.files.find((f) => f.path === ".gemini/settings.json");
  assert.ok(cfg && JSON.parse(cfg.contents).mcpServers.db.command === "psql");

  const rooted = geminiAdapter.adapt(
    emptyPlugin({ mcp: { mcpServers: { x: { command: "${CLAUDE_PLUGIN_ROOT}/x" } } } }),
  );
  assert.equal(rooted.report.find((e) => e.kind === "mcp")?.status, "DEMOTED");
});

test("gemini adapter: hooks are skipped with a reason", () => {
  const result = geminiAdapter.adapt(emptyPlugin({ hooks: { hooks: { PreToolUse: [] } } }));
  const entry = result.report.find((e) => e.kind === "hook");
  assert.equal(entry?.status, "SKIPPED");
  assert.equal(entry?.target, null);
});

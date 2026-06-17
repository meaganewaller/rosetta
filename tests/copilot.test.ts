// Golden-file tests for the GitHub Copilot adapter. Run from the repo root: `node --test`.
//
// Regenerate goldens after an intentional adapter change:
//   node src/cli.ts add changelog --harness copilot --into tests/golden/copilot/changelog

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { loadPlugin } from "../src/load.ts";
import { copilotAdapter } from "../src/adapters/copilot.ts";
import type { CanonicalPlugin } from "../src/contract.ts";

const GOLDEN_ROOT = "tests/golden/copilot/changelog";

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

test("copilot adapter: changelog output matches goldens byte-for-byte", () => {
  const result = copilotAdapter.adapt(loadPlugin("plugins/changelog"));
  assert.ok(result.files.length > 0, "adapter produced no files");
  for (const f of result.files) {
    const goldenPath = join(GOLDEN_ROOT, f.path);
    assert.ok(existsSync(goldenPath), `missing golden file: ${goldenPath}`);
    assert.equal(f.contents, readFileSync(goldenPath, "utf8"), `content mismatch: ${f.path}`);
  }
});

test("copilot adapter: changelog report records the expected fidelity", () => {
  const { report } = copilotAdapter.adapt(loadPlugin("plugins/changelog"));
  const status = Object.fromEntries(report.map((e) => [e.component, e.status]));
  assert.equal(status["skill:keep-a-changelog"], "NATIVE"); // Agent Skills open standard
  assert.equal(status["command:changelog"], "DEMOTED"); // $1 + allowed-tools
  assert.equal(status["agent:release-notes-writer"], "DEMOTED"); // model + tools dropped
});

test("copilot adapter: a bare command/agent maps NATIVE", () => {
  const result = copilotAdapter.adapt(
    emptyPlugin({
      commands: [{ name: "hi", description: "Say hi.", body: "Greet the user warmly." }],
      agents: [{ name: "explorer", description: "Explore.", body: "Look around." }],
    }),
  );
  assert.equal(result.report.find((e) => e.component === "command:hi")?.status, "NATIVE");
  assert.equal(result.report.find((e) => e.component === "agent:explorer")?.status, "NATIVE");
});

test("copilot adapter: MCP → .vscode/mcp.json with `servers` key (not mcpServers)", () => {
  const plain = copilotAdapter.adapt(
    emptyPlugin({ mcp: { mcpServers: { db: { command: "psql", args: ["--db"] } } } }),
  );
  assert.equal(plain.report.find((e) => e.kind === "mcp")?.status, "NATIVE");
  const cfg = plain.files.find((f) => f.path === ".vscode/mcp.json");
  const parsed = cfg && JSON.parse(cfg.contents);
  assert.ok(parsed.servers && !parsed.mcpServers, "root key must be `servers`");
  assert.equal(parsed.servers.db.type, "stdio");

  const command = `${process.env.CLAUDE_PLUGIN_ROOT}/bin/x`;

  const rooted = copilotAdapter.adapt(
    emptyPlugin({ mcp: { mcpServers: { x: { command } } } }),
  );
  assert.equal(rooted.report.find((e) => e.kind === "mcp")?.status, "DEMOTED");
});

test("copilot adapter: hooks are skipped with a reason", () => {
  const result = copilotAdapter.adapt(emptyPlugin({ hooks: { hooks: { PreToolUse: [] } } }));
  const entry = result.report.find((e) => e.kind === "hook");
  assert.equal(entry?.status, "SKIPPED");
  assert.equal(entry?.target, null);
});

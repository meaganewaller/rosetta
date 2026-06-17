// Golden-file tests for the Zed adapter. Run from the repo root: `node --test`.
//
// Regenerate goldens after an intentional adapter change:
//   node src/cli.ts add changelog --harness zed --into tests/golden/zed/changelog

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { loadPlugin } from "../src/load.ts";
import { zedAdapter } from "../src/adapters/zed.ts";
import type { CanonicalPlugin } from "../src/contract.ts";

const GOLDEN_ROOT = "tests/golden/zed/changelog";

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

test("zed adapter: changelog output matches goldens byte-for-byte", () => {
  const result = zedAdapter.adapt(loadPlugin("plugins/changelog"));
  assert.ok(result.files.length > 0, "adapter produced no files");
  for (const f of result.files) {
    const goldenPath = join(GOLDEN_ROOT, f.path);
    assert.ok(existsSync(goldenPath), `missing golden file: ${goldenPath}`);
    assert.equal(f.contents, readFileSync(goldenPath, "utf8"), `content mismatch: ${f.path}`);
  }
});

test("zed adapter: changelog report records the expected fidelity", () => {
  const { report } = zedAdapter.adapt(loadPlugin("plugins/changelog"));
  const status = Object.fromEntries(report.map((e) => [e.component, e.status]));
  assert.equal(status["skill:keep-a-changelog"], "NATIVE"); // same SKILL.md format
  assert.equal(status["command:changelog"], "DEMOTED"); // command → skill
  assert.equal(status["agent:release-notes-writer"], "DEMOTED"); // no subagent → skill
});

test("zed adapter: a skill is model-invocable (no disable-model-invocation)", () => {
  const result = zedAdapter.adapt(
    emptyPlugin({ skills: [{ name: "lint", description: "Lint.", body: "Lint the code." }] }),
  );
  const file = result.files.find((f) => f.path === ".agents/skills/lint/SKILL.md");
  assert.ok(file, "expected a SKILL.md");
  assert.ok(!file?.contents.includes("disable-model-invocation"), "skills stay model-invocable");
  assert.equal(result.report.find((e) => e.component === "skill:lint")?.status, "NATIVE");
});

test("zed adapter: a command becomes a skill with model-invocation disabled", () => {
  const result = zedAdapter.adapt(
    emptyPlugin({ commands: [{ name: "echo", description: "Echo.", body: "Repeat it back." }] }),
  );
  const file = result.files.find((f) => f.path === ".agents/skills/echo/SKILL.md");
  assert.ok(file?.contents.includes("disable-model-invocation: true"), "command skill is manual-only");
  assert.equal(result.report.find((e) => e.component === "command:echo")?.status, "DEMOTED");
});

test("zed adapter: an agent is DEMOTED to a skill (no file-based subagent)", () => {
  const result = zedAdapter.adapt(
    emptyPlugin({ agents: [{ name: "explorer", description: "Explore.", body: "Look around." }] }),
  );
  const entry = result.report.find((e) => e.component === "agent:explorer");
  assert.equal(entry?.status, "DEMOTED");
  assert.equal(entry?.target, ".agents/skills/explorer/SKILL.md");
  assert.match(entry?.note ?? "", /not a separate subagent/);
});

test("zed adapter: MCP → context_servers, DEMOTED when it uses CLAUDE_PLUGIN_ROOT", () => {
  const plain = zedAdapter.adapt(
    emptyPlugin({ mcp: { mcpServers: { db: { command: "psql", args: ["--db"] } } } }),
  );
  assert.equal(plain.report.find((e) => e.kind === "mcp")?.status, "NATIVE");
  const cfg = plain.files.find((f) => f.path === ".zed/settings.json");
  assert.ok(cfg && JSON.parse(cfg.contents).context_servers.db.command === "psql");

  const command = `${process.env.CLAUDE_PLUGIN_ROOT}/bin/x`;

  const rooted = zedAdapter.adapt(
    emptyPlugin({ mcp: { mcpServers: { x: { command } } } }),
  );
  assert.equal(rooted.report.find((e) => e.kind === "mcp")?.status, "DEMOTED");
});

test("zed adapter: hooks are skipped with a reason", () => {
  const result = zedAdapter.adapt(emptyPlugin({ hooks: { hooks: { PreToolUse: [] } } }));
  const entry = result.report.find((e) => e.kind === "hook");
  assert.equal(entry?.status, "SKIPPED");
  assert.equal(entry?.target, null);
});

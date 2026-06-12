// Golden-file tests for the Cursor adapter. Run from the repo root: `node --test`.
//
// To regenerate the goldens after an intentional adapter change:
//   node src/cli.ts add changelog --harness cursor --into tests/golden/cursor/changelog

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { loadPlugin } from "../src/load.ts";
import { cursorAdapter } from "../src/adapters/cursor.ts";

const GOLDEN_ROOT = "tests/golden/cursor/changelog";

test("cursor adapter: changelog output matches goldens byte-for-byte", () => {
  const result = cursorAdapter.adapt(loadPlugin("plugins/changelog"));
  assert.ok(result.files.length > 0, "adapter produced no files");
  for (const f of result.files) {
    const goldenPath = join(GOLDEN_ROOT, f.path);
    assert.ok(existsSync(goldenPath), `missing golden file: ${goldenPath}`);
    assert.equal(f.contents, readFileSync(goldenPath, "utf8"), `content mismatch: ${f.path}`);
  }
});

test("cursor adapter: changelog report records the expected fidelity", () => {
  const { report } = cursorAdapter.adapt(loadPlugin("plugins/changelog"));
  const status = Object.fromEntries(report.map((e) => [e.component, e.status]));
  assert.equal(status["skill:keep-a-changelog"], "NATIVE");
  assert.equal(status["command:changelog"], "DEMOTED"); // allowed-tools + $1 dropped
  assert.equal(status["agent:release-notes-writer"], "DEMOTED"); // subagent → inline rule
});

test("cursor adapter: a bare command (no allowed-tools, no args) stays NATIVE", () => {
  const result = cursorAdapter.adapt({
    name: "demo",
    dir: ".",
    manifest: { name: "demo" },
    skills: [],
    commands: [{ name: "hello", description: "Say hi.", body: "Say hello to the user." }],
    agents: [],
    mcp: null,
    hooks: null,
  });
  const entry = result.report.find((e) => e.component === "command:hello");
  assert.equal(entry?.status, "NATIVE");
});

test("cursor adapter: hooks are skipped with a reason", () => {
  const result = cursorAdapter.adapt({
    name: "demo",
    dir: ".",
    manifest: { name: "demo" },
    skills: [],
    commands: [],
    agents: [],
    mcp: null,
    hooks: { hooks: { PreToolUse: [] } },
  });
  const entry = result.report.find((e) => e.kind === "hook");
  assert.equal(entry?.status, "SKIPPED");
  assert.equal(entry?.target, null);
  assert.ok(entry?.note && entry.note.length > 0);
});

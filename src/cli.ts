#!/usr/bin/env node
// rosetta CLI — translate a canonical plugin into a target harness's native files.
//
//   node src/cli.ts inspect <plugin> [--harness cursor]            # dry run: print the report
//   node src/cli.ts add     <plugin> [--harness cursor] [--into D]  # write files + print report
//
// <plugin> is a registered name in .claude-plugin/marketplace.json, or a path to a plugin dir.

import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import process from "node:process";
import { loadPlugin } from "./load.ts";
import { cursorAdapter } from "./adapters/cursor.ts";
import { codexAdapter } from "./adapters/codex.ts";
import { opencodeAdapter } from "./adapters/opencode.ts";
import { geminiAdapter } from "./adapters/gemini.ts";
import { copilotAdapter } from "./adapters/copilot.ts";
import type { Adapter, AdapterResult } from "./contract.ts";

const ADAPTERS: Record<string, Adapter> = {
  cursor: cursorAdapter,
  codex: codexAdapter,
  opencode: opencodeAdapter,
  gemini: geminiAdapter,
  copilot: copilotAdapter,
};
const ROOT = process.cwd();

function resolvePluginDir(nameOrPath: string): string {
  if (existsSync(join(ROOT, nameOrPath, ".claude-plugin/plugin.json"))) return join(ROOT, nameOrPath);
  if (existsSync(join(nameOrPath, ".claude-plugin/plugin.json"))) return nameOrPath;
  const mkt = join(ROOT, ".claude-plugin/marketplace.json");
  if (existsSync(mkt)) {
    const data = JSON.parse(readFileSync(mkt, "utf8")) as {
      plugins?: { name?: string; source?: string }[];
    };
    const entry = (data.plugins ?? []).find((p) => p.name === nameOrPath);
    if (entry?.source) return join(ROOT, entry.source);
  }
  throw new Error(`cannot resolve plugin '${nameOrPath}' (not a path, not in marketplace.json)`);
}

function detectHarness(into: string): string | null {
  if (existsSync(join(into, ".opencode")) || existsSync(join(into, "opencode.json"))) return "opencode";
  if (existsSync(join(into, ".codex"))) return "codex";
  if (existsSync(join(into, ".cursor"))) return "cursor";
  if (existsSync(join(into, ".gemini"))) return "gemini";
  if (existsSync(join(into, ".github/copilot-instructions.md"))) return "copilot";
  return null;
}

function parseArgs(argv: string[]): { positional: string[]; flags: Record<string, string> } {
  const positional: string[] = [];
  const flags: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      flags[a.slice(2)] = argv[i + 1] ?? "";
      i++;
    } else {
      positional.push(a);
    }
  }
  return { positional, flags };
}

function printReport(result: AdapterResult, dryRun: boolean): void {
  const symbol: Record<string, string> = { NATIVE: "✓", DEMOTED: "~", INLINED: "≈", SKIPPED: "✗" };
  console.log(`\n${result.plugin} → ${result.harness}\n`);
  for (const e of result.report) {
    const tgt = e.target ? ` → ${e.target}` : "";
    console.log(`  ${symbol[e.status] ?? "?"} ${e.status.padEnd(7)} ${e.component}${tgt}`);
    if (e.note) console.log(`            ↳ ${e.note}`);
  }
  const counts: Record<string, number> = {};
  for (const e of result.report) counts[e.status] = (counts[e.status] ?? 0) + 1;
  const summary = ["NATIVE", "DEMOTED", "INLINED", "SKIPPED"]
    .filter((k) => counts[k])
    .map((k) => `${counts[k]} ${k.toLowerCase()}`)
    .join(", ");
  console.log(`\n  ${result.files.length} file(s); ${summary || "no components"}`);
  if (dryRun) console.log("  (dry run — no files written; use `add` to apply)");
}

function main(): void {
  const { positional, flags } = parseArgs(process.argv.slice(2));
  const [cmd, pluginArg] = positional;
  if (!cmd || !pluginArg || (cmd !== "inspect" && cmd !== "add")) {
    console.error("usage: rosetta <inspect|add> <plugin> [--harness cursor] [--into <dir>]");
    process.exitCode = 1;
    return;
  }

  const into = flags.into ? join(ROOT, flags.into) : ROOT;
  const harness = flags.harness || detectHarness(into);
  if (!harness) {
    console.error(
      `cannot determine target harness — pass --harness <${Object.keys(ADAPTERS).join("|")}>`,
    );
    process.exitCode = 1;
    return;
  }
  const adapter = ADAPTERS[harness];
  if (!adapter) {
    console.error(`no adapter for harness '${harness}' (have: ${Object.keys(ADAPTERS).join(", ")})`);
    process.exitCode = 1;
    return;
  }

  const result = adapter.adapt(loadPlugin(resolvePluginDir(pluginArg)));

  if (cmd === "add") {
    for (const f of result.files) {
      const dest = join(into, f.path);
      mkdirSync(dirname(dest), { recursive: true });
      writeFileSync(dest, f.contents);
    }
  }
  printReport(result, cmd === "inspect");
}

main();

#!/usr/bin/env node
// Catalog validator for the rosetta marketplace.
//
// Encodes the rules in docs/plugin-spec.md as an executable, CI-runnable gate. Runs as
// native TypeScript on Node >= 22.18 (type stripping) — no build step, no dependencies.
//
//   node scripts/validate.ts            # validate the whole catalog
//
// Exits non-zero if any error-level issue is found. Warnings never fail the build.

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, relative, basename } from "node:path";
import process from "node:process";

type Level = "error" | "warn";
type Issue = { level: Level; where: string; msg: string };

const ROOT = process.cwd();
const issues: Issue[] = [];
const err = (where: string, msg: string) => issues.push({ level: "error", where, msg });
const warn = (where: string, msg: string) => issues.push({ level: "warn", where, msg });

const SEMVER = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ABS_PATH = /(\/Users\/|\/home\/|\/root\/|\b[A-Za-z]:\\)/;
const TEXT_EXT = /\.(md|json|mcp\.json)$/i;

function readJson(path: string, where: string): unknown | null {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    err(where, `cannot parse JSON ${rel(path)}: ${(e as Error).message}`);
    return null;
  }
}

function rel(path: string): string {
  return relative(ROOT, path) || ".";
}

function isDir(path: string): boolean {
  return existsSync(path) && statSync(path).isDirectory();
}

function listSubdirs(dir: string): string[] {
  if (!isDir(dir)) return [];
  return readdirSync(dir).filter((n) => isDir(join(dir, n)));
}

function listFiles(dir: string, ext: RegExp): string[] {
  if (!isDir(dir)) return [];
  return readdirSync(dir)
    .filter((n) => ext.test(n) && statSync(join(dir, n)).isFile())
    .map((n) => join(dir, n));
}

function walkFiles(dir: string): string[] {
  const out: string[] = [];
  if (!isDir(dir)) return out;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (isDir(p)) out.push(...walkFiles(p));
    else out.push(p);
  }
  return out;
}

// Minimal frontmatter reader: returns a map of top-level key -> hasNonEmptyValue.
// Sufficient for presence/empty checks; not a full YAML parser.
function frontmatter(content: string): Map<string, boolean> | null {
  const lines = content.split(/\r?\n/);
  if (lines[0]?.trim() !== "---") return null;
  let end = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") {
      end = i;
      break;
    }
  }
  if (end === -1) return null;
  const block = lines.slice(1, end);
  const keys = new Map<string, boolean>();
  for (let i = 0; i < block.length; i++) {
    const m = /^([A-Za-z0-9_-]+):(.*)$/.exec(block[i]); // top-level keys only (no indent)
    if (!m) continue;
    const inline = m[2].trim();
    let hasValue = inline.length > 0; // includes block-scalar indicators like ">-" or "|"
    if (!hasValue) {
      const next = block[i + 1];
      if (next && /^\s+\S/.test(next)) hasValue = true; // indented continuation
    }
    if (!keys.has(m[1])) keys.set(m[1], hasValue);
  }
  return keys;
}

function checkFrontmatter(file: string, where: string, required: string[]): void {
  const fm = frontmatter(readFileSync(file, "utf8"));
  if (!fm) {
    err(where, `${rel(file)}: missing YAML frontmatter (--- block)`);
    return;
  }
  for (const key of required) {
    if (!fm.has(key)) err(where, `${rel(file)}: frontmatter missing required \`${key}\``);
    else if (!fm.get(key)) err(where, `${rel(file)}: frontmatter \`${key}\` is empty`);
  }
}

function scanAbsolutePaths(dir: string, where: string): void {
  for (const file of walkFiles(dir)) {
    if (!TEXT_EXT.test(file)) continue;
    const lines = readFileSync(file, "utf8").split(/\r?\n/);
    lines.forEach((line, i) => {
      if (ABS_PATH.test(line)) {
        err(
          where,
          `${rel(file)}:${i + 1}: hard-coded absolute path — use \${CLAUDE_PLUGIN_ROOT} instead`,
        );
      }
    });
  }
}

function loadCategories(): Set<string> {
  const path = join(ROOT, "catalog/categories.json");
  if (!existsSync(path)) {
    err("catalog", "catalog/categories.json not found");
    return new Set();
  }
  const data = readJson(path, "catalog") as { categories?: { name?: string }[] } | null;
  const names = new Set<string>();
  for (const c of data?.categories ?? []) if (c.name) names.add(c.name);
  if (names.size === 0) err("catalog", "catalog/categories.json has no categories");
  return names;
}

type PluginEntry = {
  name?: string;
  source?: string;
  description?: string;
  category?: string;
  version?: string;
};

type Manifest = {
  name?: string;
  description?: string;
  version?: string;
  author?: { name?: string };
  license?: string;
  keywords?: string[];
  category?: string;
};

function validatePlugin(entry: PluginEntry, categories: Set<string>): void {
  const where = entry.name ?? entry.source ?? "<unnamed plugin>";

  if (!entry.name || !KEBAB.test(entry.name))
    err(where, `marketplace entry \`name\` must be kebab-case (got ${JSON.stringify(entry.name)})`);
  if (!entry.description) err(where, "marketplace entry missing `description`");
  if (!entry.version || !SEMVER.test(entry.version))
    err(where, `marketplace entry \`version\` must be SemVer (got ${JSON.stringify(entry.version)})`);

  if (!entry.category) err(where, "marketplace entry missing `category`");
  else if (!categories.has(entry.category))
    err(where, `category ${JSON.stringify(entry.category)} is not in catalog/categories.json`);

  if (!entry.source) {
    err(where, "marketplace entry missing `source`");
    return;
  }
  const src = join(ROOT, entry.source);
  if (!isDir(src)) {
    err(where, `source path ${entry.source} does not exist`);
    return;
  }

  // Manifest
  const manifestPath = join(src, ".claude-plugin/plugin.json");
  if (!existsSync(manifestPath)) {
    err(where, `missing ${rel(manifestPath)}`);
    return;
  }
  const m = readJson(manifestPath, where) as Manifest | null;
  if (m) {
    if (!m.name || !KEBAB.test(m.name)) err(where, "plugin.json `name` must be kebab-case");
    if (m.name && entry.name && m.name !== entry.name)
      err(where, `plugin.json name (${m.name}) != marketplace entry name (${entry.name})`);
    if (!m.description) err(where, "plugin.json missing `description`");
    if (!m.version || !SEMVER.test(m.version)) err(where, "plugin.json `version` must be SemVer");
    if (m.version && entry.version && m.version !== entry.version)
      err(where, `plugin.json version (${m.version}) != marketplace entry version (${entry.version})`);
    if (!m.author?.name) err(where, "plugin.json missing `author.name`");
    if (!m.license) err(where, "plugin.json missing `license` (SPDX identifier)");
    if (!m.keywords || m.keywords.length === 0)
      warn(where, "plugin.json has no `keywords` (recommended — drives search)");
    if (m.category)
      warn(where, "plugin.json has a `category` field — category is catalog-side (marketplace.json); this is ignored");
  }

  // README
  if (!existsSync(join(src, "README.md"))) err(where, "missing README.md");

  // Skills
  for (const skillDir of listSubdirs(join(src, "skills"))) {
    const skillFile = join(src, "skills", skillDir, "SKILL.md");
    if (!existsSync(skillFile)) err(where, `skills/${skillDir}/ has no SKILL.md`);
    else checkFrontmatter(skillFile, where, ["name", "description"]);
  }

  // Commands
  for (const cmd of listFiles(join(src, "commands"), /\.md$/)) {
    checkFrontmatter(cmd, where, ["description"]);
    const fm = frontmatter(readFileSync(cmd, "utf8"));
    if (fm && !fm.has("allowed-tools"))
      warn(where, `${rel(cmd)}: no \`allowed-tools\` — declare least-privilege tool access`);
  }

  // Agents
  for (const agent of listFiles(join(src, "agents"), /\.md$/)) {
    checkFrontmatter(agent, where, ["name", "description"]);
  }

  // Hard-coded absolute paths anywhere in the plugin
  scanAbsolutePaths(src, where);
}

function main(): void {
  const categories = loadCategories();

  const marketplacePath = join(ROOT, ".claude-plugin/marketplace.json");
  if (!existsSync(marketplacePath)) {
    err("marketplace", ".claude-plugin/marketplace.json not found");
    report([]);
    return;
  }
  const mkt = readJson(marketplacePath, "marketplace") as
    | { name?: string; owner?: { name?: string }; plugins?: PluginEntry[] }
    | null;
  if (!mkt) {
    report([]);
    return;
  }

  if (!mkt.name || !KEBAB.test(mkt.name))
    err("marketplace", "marketplace `name` must be kebab-case");
  if (!mkt.owner?.name) err("marketplace", "marketplace missing `owner.name`");
  const plugins = mkt.plugins ?? [];
  if (plugins.length === 0) err("marketplace", "marketplace has no plugins");

  // Duplicate names
  const seen = new Map<string, number>();
  for (const p of plugins) if (p.name) seen.set(p.name, (seen.get(p.name) ?? 0) + 1);
  for (const [name, count] of seen) if (count > 1) err("marketplace", `duplicate plugin name: ${name}`);

  for (const p of plugins) validatePlugin(p, categories);

  // Plugin directories present on disk but not registered
  const registered = new Set(plugins.map((p) => p.source && basename(p.source)).filter(Boolean));
  for (const dir of listSubdirs(join(ROOT, "plugins"))) {
    if (!registered.has(dir))
      warn("marketplace", `plugins/${dir}/ exists but is not registered in marketplace.json`);
  }

  report(plugins);
}

function report(plugins: PluginEntry[]): void {
  console.log("rosetta catalog validation\n");
  for (const p of plugins) {
    const name = p.name ?? p.source ?? "<unnamed>";
    const own = issues.filter((i) => i.where === name);
    const hasErr = own.some((i) => i.level === "error");
    const mark = hasErr ? "✗" : "✓";
    const cat = p.category ? ` (${p.category})` : "";
    console.log(`  ${mark} ${name}${cat}`);
  }

  const errors = issues.filter((i) => i.level === "error");
  const warns = issues.filter((i) => i.level === "warn");

  if (issues.length > 0) console.log("");
  for (const i of issues) {
    const tag = i.level === "error" ? "ERROR" : "warn ";
    console.log(`  ${tag}  [${i.where}] ${i.msg}`);
  }

  console.log(
    `\n${plugins.length} plugin(s), ${errors.length} error(s), ${warns.length} warning(s)`,
  );
  if (errors.length > 0) process.exitCode = 1;
}

main();

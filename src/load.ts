// Parse a canonical (Claude Code format) plugin from disk into the CanonicalPlugin model.

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import type { Agent, CanonicalPlugin, Command, Manifest, Skill } from "./contract.ts";

interface Frontmatter {
  data: Record<string, unknown>;
  body: string;
}

/** Split a Markdown file into its YAML frontmatter and body. */
export function splitFrontmatter(content: string): Frontmatter {
  const lines = content.split(/\r?\n/);
  if (lines[0]?.trim() !== "---") return { data: {}, body: content };
  let end = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") {
      end = i;
      break;
    }
  }
  if (end === -1) return { data: {}, body: content };
  const yamlText = lines.slice(1, end).join("\n");
  const body = lines
    .slice(end + 1)
    .join("\n")
    .replace(/^\n+/, "");
  const data = (parseYaml(yamlText) ?? {}) as Record<string, unknown>;
  return { data, body };
}

function str(v: unknown): string | undefined {
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

function isDir(p: string): boolean {
  return existsSync(p) && statSync(p).isDirectory();
}

function subdirs(p: string): string[] {
  return isDir(p) ? readdirSync(p).filter((n) => isDir(join(p, n))) : [];
}

function mdFiles(p: string): string[] {
  return isDir(p) ? readdirSync(p).filter((n) => n.endsWith(".md")) : [];
}

function readJsonMaybe(p: string): unknown | null {
  return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null;
}

export function loadPlugin(dir: string): CanonicalPlugin {
  const manifest = JSON.parse(
    readFileSync(join(dir, ".claude-plugin/plugin.json"), "utf8"),
  ) as Manifest;

  const skills: Skill[] = [];
  for (const name of subdirs(join(dir, "skills"))) {
    const file = join(dir, "skills", name, "SKILL.md");
    if (!existsSync(file)) continue;
    const { data, body } = splitFrontmatter(readFileSync(file, "utf8"));
    skills.push({ name: str(data.name) ?? name, description: str(data.description) ?? "", body });
  }

  const commands: Command[] = [];
  for (const f of mdFiles(join(dir, "commands"))) {
    const { data, body } = splitFrontmatter(readFileSync(join(dir, "commands", f), "utf8"));
    commands.push({
      name: f.replace(/\.md$/, ""),
      description: str(data.description),
      argumentHint: str(data["argument-hint"]),
      allowedTools: str(data["allowed-tools"]),
      body,
    });
  }

  const agents: Agent[] = [];
  for (const f of mdFiles(join(dir, "agents"))) {
    const { data, body } = splitFrontmatter(readFileSync(join(dir, "agents", f), "utf8"));
    agents.push({
      name: str(data.name) ?? f.replace(/\.md$/, ""),
      description: str(data.description),
      tools: str(data.tools),
      model: str(data.model),
      body,
    });
  }

  return {
    name: manifest.name,
    dir,
    manifest,
    skills,
    commands,
    agents,
    mcp: readJsonMaybe(join(dir, ".mcp.json")),
    hooks: readJsonMaybe(join(dir, "hooks/hooks.json")),
  };
}

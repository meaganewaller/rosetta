// The canonical plugin model and the adapter contract.
//
// An adapter takes a CanonicalPlugin (parsed from the Claude Code source) and returns the
// files to write for a target harness plus a translation report describing the fidelity of
// each component. This is the executable form of docs/architecture.md.

export type Fidelity = "NATIVE" | "DEMOTED" | "INLINED" | "SKIPPED";
export type ComponentKind = "skill" | "command" | "agent" | "hook" | "mcp";

export interface Manifest {
  name: string;
  description?: string;
  version?: string;
  author?: { name?: string };
  license?: string;
  keywords?: string[];
}

export interface Skill {
  name: string;
  description: string;
  body: string;
}

export interface Command {
  name: string;
  description?: string;
  argumentHint?: string;
  allowedTools?: string;
  body: string;
}

export interface Agent {
  name: string;
  description?: string;
  tools?: string;
  model?: string;
  body: string;
}

export interface CanonicalPlugin {
  name: string;
  dir: string;
  manifest: Manifest;
  skills: Skill[];
  commands: Command[];
  agents: Agent[];
  mcp: unknown | null; // parsed .mcp.json, or null
  hooks: unknown | null; // parsed hooks/hooks.json, or null
}

export interface OutputFile {
  path: string; // relative to the target project root, e.g. ".cursor/commands/changelog.md"
  contents: string;
}

export interface ReportEntry {
  component: string; // "skill:keep-a-changelog"
  kind: ComponentKind;
  status: Fidelity;
  target: string | null; // output path, or null when skipped
  note?: string; // what was lost / why demoted / why skipped
}

export interface AdapterResult {
  harness: string;
  plugin: string;
  files: OutputFile[];
  report: ReportEntry[];
}

export interface Adapter {
  harness: string;
  adapt(plugin: CanonicalPlugin): AdapterResult;
}

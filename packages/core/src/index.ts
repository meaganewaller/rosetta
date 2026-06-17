// ---------------------------------------------------------------------------
// Harness
// ---------------------------------------------------------------------------

/** Every agentic coding harness Rosetta can target. */
export type Harness =
  | 'claude-code'
  | 'cursor'
  | 'codex'
  | 'opencode'
  | 'gemini'
  | 'copilot'
  | 'antigravity'
  | 'zed';

export const SUPPORTED_HARNESSES: readonly Harness[] = [
  'claude-code',
  'cursor',
  'codex',
  'opencode',
  'gemini',
  'copilot',
  'antigravity',
  'zed',
];

// ---------------------------------------------------------------------------
// Plugin — canonical source format
// ---------------------------------------------------------------------------

/** A single file to be written by an adapter. */
export interface OutputFile {
  /** Destination path, relative to the harness install root. */
  path: string;
  content: string;
}

/**
 * A component that an adapter could not fully represent in the target harness.
 * Adapters must never silently drop capabilities — every loss is recorded here.
 */
export interface DegradedCapability {
  /** The source component that couldn't be represented. */
  component: PluginComponentType;
  /** Name or identifier of the specific component (e.g. "observe.sh", "reviewer"). */
  name: string;
  /** What was lost and why. */
  reason: string;
  /**
   * How the capability was handled:
   * - 'omitted'   — not included in output at all
   * - 'partial'   — included but with reduced functionality
   * - 'commented' — included as a comment/note in the output file
   */
  disposition: 'omitted' | 'partial' | 'commented';
}

export type PluginComponentType =
  | 'skill'
  | 'agent'
  | 'command'
  | 'hook'
  | 'mcp'
  | 'rule';

/** A parsed plugin component. */
export interface PluginComponent {
  type: PluginComponentType;
  /** Relative path within @rosetta/content, e.g. "skills/tdd-workflow/SKILL.md" */
  sourcePath: string;
  /** Parsed frontmatter */
  frontmatter: Record<string, unknown>;
  /** File body (everything after the frontmatter block) */
  body: string;
  /** Additional files in the same directory (e.g. hooks, scripts) */
  assets: Array<{ path: string; content: string }>;
}

/** A fully parsed plugin ready for adaptation. */
export interface Plugin {
  /** Plugin identifier, e.g. "tdd-workflow" */
  id: string;
  version: string;
  description: string;
  components: PluginComponent[];
}

// ---------------------------------------------------------------------------
// Adapter
// ---------------------------------------------------------------------------

export interface AdapterContext {
  /** Absolute path to the harness install directory (e.g. ~/.claude or .cursor) */
  installRoot: string;
  /** Scope: install for this user globally, or for this project only */
  scope: InstallScope;
  /** Parsed lockfile for this harness+scope, if present */
  lockfile: RosettaLockfile | null;
}

export interface AdapterResult {
  harness: Harness;
  /** Files to write to the install root */
  files: OutputFile[];
  /** Capabilities that could not be fully represented */
  degraded: DegradedCapability[];
}

export interface Adapter {
  harness: Harness;
  /**
   * Human-readable name for CLI output.
   * e.g. "Claude Code", "Cursor", "Codex CLI"
   */
  displayName: string;
  /**
   * Default install root paths by scope.
   * Used when the user hasn't specified --root.
   */
  defaultRoots: Record<InstallScope, string>;
  /** Transpile a parsed plugin into this harness's native format. */
  adapt(plugin: Plugin, ctx: AdapterContext): Promise<AdapterResult>;
}

// ---------------------------------------------------------------------------
// Install target
// ---------------------------------------------------------------------------

export type InstallScope = 'user' | 'project';

export interface InstallTarget {
  harness: Harness;
  scope: InstallScope;
  /** Absolute path to the harness install directory */
  root: string;
}

// ---------------------------------------------------------------------------
// Scanner
// ---------------------------------------------------------------------------

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface Finding {
  severity: Severity;
  /** Relative path from the scanned root */
  file: string;
  line?: number;
  rule: string;
  message: string;
  suggestion?: string;
  fix?: Fix;
}

export interface Fix {
  description: string;
  apply(contents: string): string;
}

export interface AnalyzerContext {
  /** Absolute path to the install root being scanned */
  root: string;
  harness: Harness;
  /** Absolute path to @rosetta/content, for drift checks */
  contentRoot: string;
  lockfile: RosettaLockfile | null;
}

export interface Analyzer {
  name: string;
  /** Which harnesses this analyzer applies to. Omit to run on all. */
  harnesses?: Harness[];
  analyze(ctx: AnalyzerContext): Promise<Finding[]>;
}

// ---------------------------------------------------------------------------
// Content manifest
// ---------------------------------------------------------------------------

export interface ContentItem {
  /** Relative path within @rosetta/content, e.g. "rules/common/coding-style.md" */
  path: string;
  frontmatter: Record<string, unknown>;
}

export interface ContentManifest {
  version: string;
  items: ContentItem[];
}

// ---------------------------------------------------------------------------
// Lockfile
// ---------------------------------------------------------------------------

export interface LockfileEntry {
  contentVersion: string;
  /** SHA-256 of the canonical source file at install time */
  sourceHash: string;
  harness: Harness;
  installedAt: string;
}

export interface RosettaLockfile {
  harness: Harness;
  contentVersion: string;
  createdAt: string;
  updatedAt: string;
  /** Keys are relative paths within the harness install root */
  files: Record<string, LockfileEntry>;
  /** Degradation log from the last install */
  degraded: DegradedCapability[];
}

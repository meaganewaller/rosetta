import os from 'os';
import path from 'path';
import type {
  Adapter,
  AdapterContext,
  AdapterResult,
  DegradedCapability,
  OutputFile,
  Plugin,
  PluginComponent,
} from '@rosetta/core';

// ---------------------------------------------------------------------------
// Component mapping
// ---------------------------------------------------------------------------

function adaptComponent(
  component: PluginComponent,
  files: OutputFile[],
  degraded: DegradedCapability[],
): void {
  const { type, sourcePath, frontmatter, body } = component;
  const name = path.basename(sourcePath, '.md');

  switch (type) {
    case 'rule':
    case 'skill': {
      // Cursor: rules are .mdc files in .cursor/rules/
      // Skills collapse into rules — Cursor has no skill concept.
      const title = String(frontmatter.name ?? name);
      const description = String(frontmatter.description ?? '');
      const globs = frontmatter.globs ? `globs: ${frontmatter.globs}\n` : '';
      const alwaysApply = type === 'rule' ? 'alwaysApply: false\n' : 'alwaysApply: false\n';
      files.push({
        path: `rules/${name}.mdc`,
        content: `---\ndescription: ${description}\n${globs}${alwaysApply}---\n\n# ${title}\n\n${body}`,
      });
      if (type === 'skill') {
        degraded.push({
          component: 'skill',
          name,
          reason: 'Cursor has no skill concept. Collapsed into a rule file.',
          disposition: 'partial',
        });
      }
      break;
    }

    case 'agent': {
      // Cursor has no agent concept — include as a rule with a note.
      const description = String(frontmatter.description ?? '');
      files.push({
        path: `rules/${name}-agent.mdc`,
        content: `---\ndescription: ${description}\nalwaysApply: false\n---\n\n<!-- Rosetta: adapted from agent definition. Cursor has no agent concept; this is a best-effort rule. -->\n\n${body}`,
      });
      degraded.push({
        component: 'agent',
        name,
        reason: 'Cursor has no agent concept. Adapted as a rule; model selection and tool restrictions are not enforced.',
        disposition: 'partial',
      });
      break;
    }

    case 'command': {
      // Cursor has no slash command system.
      degraded.push({
        component: 'command',
        name,
        reason: 'Cursor has no slash command system.',
        disposition: 'omitted',
      });
      break;
    }

    case 'hook': {
      degraded.push({
        component: 'hook',
        name,
        reason: 'Cursor has no hook system equivalent to Claude Code PreToolUse/PostToolUse.',
        disposition: 'omitted',
      });
      break;
    }

    case 'mcp': {
      // MCP servers can be configured in Cursor — write a note to mcp.json
      files.push({
        path: 'mcp.json',
        content: JSON.stringify(
          { _rosettaNote: 'Configure MCP servers here. See https://cursor.sh/docs/mcp', mcpServers: {} },
          null, 2,
        ),
      });
      degraded.push({
        component: 'mcp',
        name,
        reason: 'MCP config requires manual setup in Cursor. A stub mcp.json has been written.',
        disposition: 'partial',
      });
      break;
    }
  }
}

// ---------------------------------------------------------------------------
// Adapter
// ---------------------------------------------------------------------------

export const cursorAdapter: Adapter = {
  harness: 'cursor',
  displayName: 'Cursor',
  defaultRoots: {
    user:    path.join(os.homedir(), '.cursor'),
    project: '.cursor',
  },

  async adapt(plugin: Plugin, _ctx: AdapterContext): Promise<AdapterResult> {
    const files: OutputFile[] = [];
    const degraded: DegradedCapability[] = [];

    for (const component of plugin.components) {
      adaptComponent(component, files, degraded);
    }

    return { harness: 'cursor', files, degraded };
  },
};

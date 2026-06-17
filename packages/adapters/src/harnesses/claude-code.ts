import os from 'os';
import path from 'path';
import type {
  Adapter,
  AdapterContext,
  AdapterResult,
  OutputFile,
  Plugin,
  PluginComponent,
} from '@rosetta/core';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function frontmatterBlock(fields: Record<string, unknown>): string {
  const lines = Object.entries(fields)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? JSON.stringify(v) : String(v)}`);
  return lines.length ? `---\n${lines.join('\n')}\n---\n\n` : '';
}

function componentToFile(component: PluginComponent): OutputFile[] {
  const files: OutputFile[] = [];
  const { type, sourcePath, frontmatter, body, assets } = component;

  switch (type) {
    case 'skill': {
      // skills/<name>/SKILL.md  +  any asset files
      const dir = path.dirname(sourcePath).replace(/^skills\//, '');
      files.push({
        path: `skills/${dir}/SKILL.md`,
        content: frontmatterBlock(frontmatter) + body,
      });
      for (const asset of assets) {
        files.push({
          path: `skills/${dir}/${asset.path}`,
          content: asset.content,
        });
      }
      break;
    }

    case 'agent': {
      const name = path.basename(sourcePath, '.md');
      files.push({
        path: `agents/${name}.md`,
        content: frontmatterBlock(frontmatter) + body,
      });
      break;
    }

    case 'command': {
      const name = path.basename(sourcePath, '.md');
      files.push({
        path: `commands/${name}.md`,
        content: frontmatterBlock(frontmatter) + body,
      });
      break;
    }

    case 'rule': {
      // Preserve subdirectory structure: rules/common/coding-style.md
      const rel = sourcePath.replace(/^rules\//, '');
      files.push({
        path: `rules/${rel}`,
        content: body,
      });
      break;
    }

    case 'hook': {
      const name = path.basename(sourcePath);
      files.push({
        path: `hooks/${name}`,
        content: body,
      });
      break;
    }

    case 'mcp':
      // MCP config is merged into settings.json — handled separately
      break;
  }

  return files;
}

// ---------------------------------------------------------------------------
// Adapter
// ---------------------------------------------------------------------------

export const claudeCodeAdapter: Adapter = {
  harness: 'claude-code',
  displayName: 'Claude Code',
  defaultRoots: {
    user:    path.join(os.homedir(), '.claude'),
    project: '.claude',
  },

  async adapt(plugin: Plugin, _ctx: AdapterContext): Promise<AdapterResult> {
    const files: OutputFile[] = [];

    for (const component of plugin.components) {
      files.push(...componentToFile(component));
    }

    // Claude Code is the canonical format — no degradation expected.
    return {
      harness: 'claude-code',
      files,
      degraded: [],
    };
  },
};

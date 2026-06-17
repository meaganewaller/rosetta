import os from 'os';
import path from 'path';
import type {
  Adapter,
  AdapterContext,
  AdapterResult,
  DegradedCapability,
  Plugin,
  PluginComponent,
} from '@rosetta/core';

// ---------------------------------------------------------------------------
// Gemini CLI
// Canonical output: GEMINI.md (all content) + .gemini/settings.toml (commands)
// Hooks, MCP: omitted
// ---------------------------------------------------------------------------

export const geminiAdapter: Adapter = {
  harness: 'gemini',
  displayName: 'Gemini CLI',
  defaultRoots: {
    user:    os.homedir(),
    project: '.',
  },

  async adapt(plugin: Plugin, _ctx: AdapterContext): Promise<AdapterResult> {
    const degraded: DegradedCapability[] = [];
    const sections: string[] = [
      `# ${plugin.id}\n\n${plugin.description}\n\n`,
    ];

    for (const component of plugin.components) {
      const name = path.basename(component.sourcePath, '.md');
      switch (component.type) {
        case 'rule':
        case 'skill':
        case 'agent':
          sections.push(`## ${name}\n\n${component.body}\n\n`);
          break;
        case 'command':
          // TODO: emit .gemini/settings.toml [commands] entries
          sections.push(`## ${name}\n\n${component.body}\n\n`);
          degraded.push({
            component: 'command',
            name,
            reason: 'Gemini command TOML generation not yet implemented. Included as prose in GEMINI.md.',
            disposition: 'partial',
          });
          break;
        case 'hook':
          degraded.push({ component: 'hook', name, reason: 'Gemini CLI has no hook system.', disposition: 'omitted' });
          break;
        case 'mcp':
          degraded.push({ component: 'mcp', name, reason: 'Gemini CLI MCP config not yet implemented.', disposition: 'omitted' });
          break;
      }
    }

    return {
      harness: 'gemini',
      files: [{ path: 'GEMINI.md', content: sections.join('') }],
      degraded,
    };
  },
};

// ---------------------------------------------------------------------------
// Antigravity
// Canonical output: .agents/skills/, .agents/workflows/, mcp_config.json
// Hooks: omitted (no equivalent)
// ---------------------------------------------------------------------------

export const antigravityAdapter: Adapter = {
  harness: 'antigravity',
  displayName: 'Google Antigravity',
  defaultRoots: {
    user:    path.join(os.homedir(), '.agents'),
    project: '.agents',
  },

  async adapt(plugin: Plugin, _ctx: AdapterContext): Promise<AdapterResult> {
    const degraded: DegradedCapability[] = [];
    const files: AdapterResult['files'] = [];

    for (const component of plugin.components) {
      const name = path.basename(component.sourcePath, '.md');
      switch (component.type) {
        case 'skill':
          files.push({ path: `skills/${name}.md`, content: component.body });
          break;
        case 'agent':
        case 'command':
          files.push({ path: `workflows/${name}.md`, content: component.body });
          if (component.type === 'agent') {
            degraded.push({ component: 'agent', name, reason: 'Agent model/tool config not representable in Antigravity workflow format.', disposition: 'partial' });
          }
          break;
        case 'rule':
          // Rules collapse into skills
          files.push({ path: `skills/${name}.md`, content: component.body });
          degraded.push({ component: 'rule', name, reason: 'Rules mapped to skills; no direct rule concept in Antigravity.', disposition: 'partial' });
          break;
        case 'hook':
          degraded.push({ component: 'hook', name, reason: 'Antigravity has no hook system.', disposition: 'omitted' });
          break;
        case 'mcp':
          // TODO: emit mcp_config.json entries
          degraded.push({ component: 'mcp', name, reason: 'Antigravity MCP config generation not yet implemented.', disposition: 'omitted' });
          break;
      }
    }

    return { harness: 'antigravity', files, degraded };
  },
};

// ---------------------------------------------------------------------------
// Zed
// Canonical output: .zed/settings.json (context_servers) + AGENTS.md
// Hooks: omitted
// ---------------------------------------------------------------------------

export const zedAdapter: Adapter = {
  harness: 'zed',
  displayName: 'Zed',
  defaultRoots: {
    user:    path.join(os.homedir(), '.config', 'zed'),
    project: '.zed',
  },

  async adapt(plugin: Plugin, _ctx: AdapterContext): Promise<AdapterResult> {
    const degraded: DegradedCapability[] = [];
    const sections: string[] = [`# ${plugin.id}\n\n${plugin.description}\n\n`];

    for (const component of plugin.components) {
      const name = path.basename(component.sourcePath, '.md');
      switch (component.type) {
        case 'rule':
        case 'skill':
        case 'agent':
        case 'command':
          sections.push(`## ${name}\n\n${component.body}\n\n`);
          if (component.type !== 'rule' && component.type !== 'skill') {
            degraded.push({
              component: component.type,
              name,
              reason: `Zed has no ${component.type} concept. Included as a section in AGENTS.md.`,
              disposition: 'partial',
            });
          }
          break;
        case 'hook':
          degraded.push({ component: 'hook', name, reason: 'Zed has no hook system.', disposition: 'omitted' });
          break;
        case 'mcp':
          // TODO: emit .zed/settings.json context_servers block
          degraded.push({ component: 'mcp', name, reason: 'Zed MCP config (context_servers) generation not yet implemented.', disposition: 'omitted' });
          break;
      }
    }

    return {
      harness: 'zed',
      files: [{ path: 'AGENTS.md', content: sections.join('') }],
      degraded,
    };
  },
};

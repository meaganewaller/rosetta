import fs from 'fs';
import path from 'path';
import type { Analyzer, AnalyzerContext, Finding } from '@rosetta/core';

export const mcpAnalyzer: Analyzer = {
  name: 'mcp',

  async analyze(ctx: AnalyzerContext): Promise<Finding[]> {
    const findings: Finding[] = [];
    const mcpPath = path.join(ctx.root, 'mcp.json');
    if (!fs.existsSync(mcpPath)) return findings;

    let mcp: Record<string, unknown>;
    try {
      mcp = JSON.parse(fs.readFileSync(mcpPath, 'utf8'));
    } catch {
      findings.push({
        severity: 'medium',
        file: 'mcp.json',
        rule: 'mcp/invalid-json',
        message: 'mcp.json is not valid JSON.',
        suggestion: 'Fix the JSON syntax error.',
      });
      return findings;
    }

    const servers = (mcp.mcpServers ?? mcp.servers ?? {}) as Record<string, unknown>;

    for (const [name, server] of Object.entries(servers)) {
      const s = server as Record<string, unknown>;
      const command = String(s.command ?? '');
      const args = Array.isArray(s.args) ? (s.args as string[]) : [];
      const env = (s.env ?? {}) as Record<string, string>;

      // npx with -y auto-installs without lockfile — supply chain risk
      if (command === 'npx' && args.includes('-y')) {
        findings.push({
          severity: 'medium',
          file: 'mcp.json',
          rule: 'mcp/npx-auto-install',
          message: `MCP server "${name}" uses npx -y, which auto-installs packages without version pinning.`,
          suggestion: 'Pin the package version explicitly or install it as a devDependency.',
        });
      }

      // Shell-running servers
      if (['sh', 'bash', 'zsh', 'cmd', 'powershell'].includes(command)) {
        findings.push({
          severity: 'high',
          file: 'mcp.json',
          rule: 'mcp/shell-server',
          message: `MCP server "${name}" runs a shell directly.`,
          suggestion: 'Prefer a specific executable over a shell interpreter.',
        });
      }

      // Hardcoded secrets in env block
      for (const [key, value] of Object.entries(env)) {
        if (!value.startsWith('$') && !value.startsWith('${') && value.length > 8) {
          findings.push({
            severity: 'critical',
            file: 'mcp.json',
            rule: 'mcp/hardcoded-env-secret',
            message: `MCP server "${name}" has a hardcoded value for env.${key}.`,
            suggestion: `Use an environment variable reference: "\${${key}}" or "$${key}".`,
          });
        }
      }

      // Missing description
      if (!s.description) {
        findings.push({
          severity: 'info',
          file: 'mcp.json',
          rule: 'mcp/missing-description',
          message: `MCP server "${name}" has no description.`,
          suggestion: 'Add a description field so reviewers understand what this server does.',
        });
      }
    }

    return findings;
  },
};

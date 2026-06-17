import fs from 'fs';
import path from 'path';
import type { Analyzer, AnalyzerContext, Finding } from '@rosetta/core';

export const settingsAnalyzer: Analyzer = {
  name: 'settings',

  async analyze(ctx: AnalyzerContext): Promise<Finding[]> {
    const findings: Finding[] = [];
    const settingsPath = path.join(ctx.root, 'settings.json');
    if (!fs.existsSync(settingsPath)) return findings;

    let settings: Record<string, unknown>;
    try {
      settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    } catch {
      findings.push({
        severity: 'medium',
        file: 'settings.json',
        rule: 'settings/invalid-json',
        message: 'settings.json is not valid JSON.',
        suggestion: 'Fix the JSON syntax error.',
      });
      return findings;
    }

    const relPath = 'settings.json';

    // Wildcard tool permissions
    const allowed = (settings.allowedTools ?? settings.allow) as unknown[];
    if (Array.isArray(allowed)) {
      for (const tool of allowed) {
        if (tool === 'Bash' || tool === 'Bash(*)') {
          findings.push({
            severity: 'critical',
            file: relPath,
            rule: 'settings/unrestricted-bash',
            message: `"${tool}" grants unrestricted shell access.`,
            suggestion: 'Scope Bash permissions, e.g. Bash(git *) or Bash(npm run *).',
          });
        }
        if (tool === '*') {
          findings.push({
            severity: 'critical',
            file: relPath,
            rule: 'settings/wildcard-allow',
            message: 'Wildcard "*" in allowedTools permits every tool without restriction.',
            suggestion: 'List only the tools your workflow actually needs.',
          });
        }
      }
    }

    // Missing deny list
    const denied = (settings.deniedTools ?? settings.deny) as unknown[] | undefined;
    if (!denied || (Array.isArray(denied) && denied.length === 0)) {
      findings.push({
        severity: 'low',
        file: relPath,
        rule: 'settings/missing-deny-list',
        message: 'No deniedTools list configured.',
        suggestion: 'Add a deniedTools list to explicitly block tools that should never run.',
      });
    }

    // dangerously-skip-permissions
    if (settings.dangerouslySkipPermissions === true) {
      findings.push({
        severity: 'critical',
        file: relPath,
        rule: 'settings/dangerous-flag',
        message: 'dangerouslySkipPermissions: true bypasses all permission checks.',
        suggestion: 'Remove this flag.',
      });
    }

    return findings;
  },
};

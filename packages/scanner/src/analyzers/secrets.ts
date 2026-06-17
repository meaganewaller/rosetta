import fs from 'fs';
import path from 'path';
import type { Analyzer, AnalyzerContext, Finding } from '@rosetta/core';

// Patterns that indicate a hardcoded secret rather than a reference or placeholder.
// Each entry: [rule suffix, pattern, description]
const SECRET_PATTERNS: Array<[string, RegExp, string]> = [
  ['api-key',     /\b(sk-[A-Za-z0-9]{20,})\b/, 'Possible OpenAI/Anthropic API key'],
  ['github-token', /\bghp_[A-Za-z0-9]{36}\b/, 'Possible GitHub personal access token'],
  ['aws-key',     /\bAKIA[0-9A-Z]{16}\b/, 'Possible AWS access key'],
  ['generic-secret', /(?:password|secret|token|api_key)\s*[:=]\s*["'][^${\s"']{8,}["']/, 'Possible hardcoded secret'],
];

// Files to scan within the .claude/ directory
const TARGET_GLOBS = [
  'CLAUDE.md',
  'settings.json',
  'mcp.json',
  'agents/*.md',
  'commands/*.md',
  'hooks/*.sh',
  'rules/*.md',
  'skills/**/*.md',
];

function resolveTargets(root: string): string[] {
  const targets: string[] = [];

  function walk(dir: string, pattern: string): void {
    const parts = pattern.split('/');
    const head = parts[0];
    if (!head) return;
    const rest = parts.slice(1).join('/');

    if (!fs.existsSync(dir)) return;

    if (head === '**') {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full, pattern);
        else if (entry.isFile()) targets.push(full);
      }
      return;
    }

    if (head.includes('*')) {
      const re = new RegExp('^' + head.replace('*', '.*') + '$');
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (!re.test(entry.name)) continue;
        const full = path.join(dir, entry.name);
        if (rest && entry.isDirectory()) walk(full, rest);
        else if (!rest && entry.isFile()) targets.push(full);
      }
      return;
    }

    const full = path.join(dir, head);
    if (rest) { if (fs.existsSync(full)) walk(full, rest); }
    else if (fs.existsSync(full) && fs.statSync(full).isFile()) targets.push(full);
  }

  for (const glob of TARGET_GLOBS) {
    walk(root, glob);
  }

  return [...new Set(targets)];
}

export const secretsAnalyzer: Analyzer = {
  name: 'secrets',

  async analyze(ctx: AnalyzerContext): Promise<Finding[]> {
    const findings: Finding[] = [];

    for (const filePath of resolveTargets(ctx.root)) {
      let content: string;
      try {
        content = fs.readFileSync(filePath, 'utf8');
      } catch {
        continue;
      }

      const lines = content.split('\n');
      const relPath = path.relative(ctx.root, filePath);

      for (const [ruleSuffix, pattern, description] of SECRET_PATTERNS) {
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (line === undefined) continue;
          // Skip lines that look like env var references or comments
          if (/\$\{|\$[A-Z_]|process\.env|os\.getenv/.test(line)) continue;
          if (line.trimStart().startsWith('#') || line.trimStart().startsWith('//')) continue;

          if (pattern.test(line)) {
            findings.push({
              severity: 'critical',
              file: relPath,
              line: i + 1,
              rule: `secrets/${ruleSuffix}`,
              message: `${description} found in config file.`,
              suggestion: 'Move to an environment variable. Never commit credentials to the repository.',
            });
          }
        }
      }
    }

    return findings;
  },
};

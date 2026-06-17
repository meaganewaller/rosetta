import fs from 'fs';
import path from 'path';
import type { Analyzer, AnalyzerContext, Finding } from '@rosetta/core';

export const hooksAnalyzer: Analyzer = {
  name: 'hooks',

  async analyze(ctx: AnalyzerContext): Promise<Finding[]> {
    const findings: Finding[] = [];
    const hooksDir = path.join(ctx.root, 'hooks');
    if (!fs.existsSync(hooksDir)) return findings;

    for (const entry of fs.readdirSync(hooksDir, { withFileTypes: true })) {
      if (!entry.isFile()) continue;
      const filePath = path.join(hooksDir, entry.name);
      const relPath = path.relative(ctx.root, filePath);
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line === undefined) continue;
        const loc = { file: relPath, line: i + 1 };

        // Command injection via unquoted variable interpolation
        if (/\$\{file\}|\$file\b/.test(line) && !/"\$\{file\}"/.test(line)) {
          findings.push({
            severity: 'critical',
            ...loc,
            rule: 'hooks/unquoted-interpolation',
            message: 'Unquoted variable interpolation in shell command — command injection risk.',
            suggestion: 'Quote the variable: "${file}" instead of $file or ${file}.',
          });
        }

        // Silent error suppression hides failures
        if (/2>\/dev\/null/.test(line) && /&&|\|\|/.test(line)) {
          findings.push({
            severity: 'medium',
            ...loc,
            rule: 'hooks/silent-error-suppression',
            message: 'Errors silenced with 2>/dev/null on a command whose exit code matters.',
            suggestion: 'Remove 2>/dev/null or redirect to a log file instead.',
          });
        }

        // Data exfiltration — sending output to external URLs
        if (/curl|wget/.test(line) && /\$\{?[A-Z_]*SESSION|TOOL|INPUT|OUTPUT/.test(line)) {
          findings.push({
            severity: 'critical',
            ...loc,
            rule: 'hooks/data-exfiltration',
            message: 'Hook may be sending session or tool data to an external endpoint.',
            suggestion: 'Review this hook carefully. Observation data should stay local.',
          });
        }

        // dangerously-skip-permissions
        if (/--dangerously-skip-permissions/.test(line)) {
          findings.push({
            severity: 'critical',
            ...loc,
            rule: 'hooks/dangerous-flag',
            message: '--dangerously-skip-permissions bypasses all permission checks.',
            suggestion: 'Remove this flag. Configure allowedTools in settings.json instead.',
          });
        }
      }
    }

    return findings;
  },
};

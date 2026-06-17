import fs from 'fs';
import path from 'path';
import type { Analyzer, AnalyzerContext, Finding } from '@rosetta/core';

function parseFrontmatter(content: string): Record<string, string> {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match?.[1]) return {};
  const result: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    result[line.slice(0, colon).trim()] = line.slice(colon + 1).trim().replace(/^["']|["']$/g, '');
  }
  return result;
}

export const agentsAnalyzer: Analyzer = {
  name: 'agents',

  async analyze(ctx: AnalyzerContext): Promise<Finding[]> {
    const findings: Finding[] = [];
    const agentsDir = path.join(ctx.root, 'agents');
    if (!fs.existsSync(agentsDir)) return findings;

    for (const entry of fs.readdirSync(agentsDir, { withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith('.md')) continue;

      const filePath = path.join(agentsDir, entry.name);
      const relPath = path.relative(ctx.root, filePath);
      const content = fs.readFileSync(filePath, 'utf8');
      const fm = parseFrontmatter(content);

      // Missing model spec
      if (!fm['model']) {
        findings.push({
          severity: 'low',
          file: relPath,
          rule: 'agents/missing-model',
          message: 'Agent has no model specified in frontmatter.',
          suggestion: 'Add a model field to ensure consistent behavior and cost control.',
        });
      }

      // Overly broad tool access
      const tools = fm['tools'] ?? fm['allowed_tools'] ?? '';
      if (/\*/.test(tools) || tools.toLowerCase().includes('bash')) {
        findings.push({
          severity: 'high',
          file: relPath,
          rule: 'agents/broad-tool-access',
          message: 'Agent has broad or unrestricted tool access.',
          suggestion: 'List only the tools this agent needs. Avoid Bash unless required.',
        });
      }

      // Prompt injection surface — instructions to bypass or ignore rules
      const body = content.replace(/^---[\s\S]*?---/, '');
      if (/ignore (previous|all|your) (instructions?|rules?|constraints?)/i.test(body)) {
        findings.push({
          severity: 'critical',
          file: relPath,
          rule: 'agents/prompt-injection',
          message: 'Agent definition contains text patterns associated with prompt injection.',
          suggestion: 'Review this file carefully. Remove any instructions to bypass safety rules.',
        });
      }
    }

    return findings;
  },
};

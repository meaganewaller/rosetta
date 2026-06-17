import fs from 'fs';
import path from 'path';
import type { Analyzer, AnalyzerContext, Finding } from '@rosetta/core';
import { buildManifest, getContentRoot } from '@rosetta/content';

// ---------------------------------------------------------------------------
// Frontmatter extraction
// ---------------------------------------------------------------------------

function extractFrontmatter(content: string): Record<string, unknown> {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match?.[1]) return {};

  const result: Record<string, unknown> = {};
  for (const line of match[1].split('\n')) {
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    const value = line.slice(colon + 1).trim().replace(/^["']|["']$/g, '');
    result[key] = value;
  }
  return result;
}

function frontmatterEqual(a: Record<string, unknown>, b: Record<string, unknown>): boolean {
  // Only compare keys present in the canonical version — installed files may
  // have extra local keys, which is fine.
  for (const [key, value] of Object.entries(a)) {
    if (String(b[key] ?? '') !== String(value)) return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Analyzer
// ---------------------------------------------------------------------------

export const driftAnalyzer: Analyzer = {
  name: 'drift',

  async analyze(ctx: AnalyzerContext): Promise<Finding[]> {
    const manifest = buildManifest();
    const contentRoot = ctx.contentRoot ?? getContentRoot();
    const findings: Finding[] = [];

    for (const item of manifest.items) {
      const installedPath = path.join(ctx.root, item.path);

      if (!fs.existsSync(installedPath)) {
        // Only flag missing files that were recorded in the lockfile —
        // not everything in the manifest needs to be installed.
        const lockEntry = ctx.lockfile?.files[item.path];
        if (lockEntry) {
          findings.push({
            severity: 'high',
            file: item.path,
            rule: 'drift/missing-file',
            message: `File was installed but is now missing.`,
            suggestion: `Re-run \`rosetta install\` to restore it, or remove it from the lockfile if intentionally deleted.`,
          });
        }
        continue;
      }

      const canonicalPath = path.join(contentRoot, item.path);
      if (!fs.existsSync(canonicalPath)) continue;

      const installed = extractFrontmatter(fs.readFileSync(installedPath, 'utf8'));
      const canonical = extractFrontmatter(fs.readFileSync(canonicalPath, 'utf8'));

      if (!frontmatterEqual(canonical, installed)) {
        findings.push({
          severity: 'medium',
          file: item.path,
          rule: 'drift/frontmatter-mismatch',
          message: `Frontmatter differs from canonical @rosetta/content@${manifest.version}.`,
          suggestion: `Run \`rosetta install --force\` to reset this file, or review the diff and update manually.`,
        });
      }
    }

    return findings;
  },
};

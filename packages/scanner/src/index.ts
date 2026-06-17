import type { Analyzer, AnalyzerContext, Finding, Harness } from '@rosetta/core';

export type { Analyzer, AnalyzerContext, Finding };

// ---------------------------------------------------------------------------
// Pipeline
// ---------------------------------------------------------------------------

export interface ScanOptions {
  root: string;
  harness: Harness;
  contentRoot: string;
  analyzers?: Analyzer[];
  minSeverity?: Finding['severity'];
}

export interface ScanResult {
  findings: Finding[];
  analyzersRun: string[];
  scannedRoot: string;
}

const SEVERITY_ORDER: Finding['severity'][] = ['critical', 'high', 'medium', 'low', 'info'];

function meetsSeverity(finding: Finding, min: Finding['severity']): boolean {
  return SEVERITY_ORDER.indexOf(finding.severity) <= SEVERITY_ORDER.indexOf(min);
}

export async function scan(options: ScanOptions): Promise<ScanResult> {
  const { root, harness, contentRoot, minSeverity = 'info' } = options;

  const { loadLockfile } = await import('./lockfile.js');
  const lockfile = loadLockfile(root);

  const ctx: AnalyzerContext = { root, harness, contentRoot, lockfile };

  const allAnalyzers = options.analyzers ?? (await import('./analyzers/index.js')).defaultAnalyzers;
  const analyzers = allAnalyzers.filter(
    (a) => !a.harnesses || a.harnesses.includes(harness),
  );

  const allFindings: Finding[] = [];
  for (const analyzer of analyzers) {
    const findings = await analyzer.analyze(ctx);
    allFindings.push(...findings.filter((f) => meetsSeverity(f, minSeverity)));
  }

  allFindings.sort((a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity));

  return {
    findings: allFindings,
    analyzersRun: analyzers.map((a) => a.name),
    scannedRoot: root,
  };
}

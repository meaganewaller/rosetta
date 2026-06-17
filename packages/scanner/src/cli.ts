#!/usr/bin/env node
import path from 'path';
import os from 'os';
import { scan } from './index.js';
import { getContentRoot } from '@rosetta/content';
import type { Finding } from '@rosetta/core';

// ---------------------------------------------------------------------------
// Args
// ---------------------------------------------------------------------------

interface CliArgs {
  root: string;
  minSeverity: Finding['severity'];
  format: 'terminal' | 'json';
  failOn: Finding['severity'] | null;
}

function parseArgs(argv: string[]): CliArgs {
  const args = argv.slice(2);
  const result: CliArgs = {
    root: path.join(os.homedir(), '.claude'),
    minSeverity: 'info',
    format: 'terminal',
    failOn: 'critical',
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--root':        result.root = path.resolve(args[++i] ?? ''); break;
      case '--min-severity': result.minSeverity = args[++i] as Finding['severity']; break;
      case '--format':      result.format = args[++i] as CliArgs['format']; break;
      case '--fail-on':     result.failOn = args[++i] as Finding['severity'] | null; break;
      case '--no-fail':     result.failOn = null; break;
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Terminal output
// ---------------------------------------------------------------------------

const SEVERITY_COLORS: Record<Finding['severity'], string> = {
  critical: '\x1b[31m', // red
  high:     '\x1b[33m', // yellow
  medium:   '\x1b[36m', // cyan
  low:      '\x1b[34m', // blue
  info:     '\x1b[90m', // gray
};
const RESET = '\x1b[0m';

function printTerminal(findings: Finding[], scannedRoot: string): void {
  console.log(`\nRosetta scan — ${scannedRoot}\n`);

  if (findings.length === 0) {
    console.log('  No findings.\n');
    return;
  }

  for (const f of findings) {
    const color = SEVERITY_COLORS[f.severity];
    const loc = f.line ? `${f.file}:${f.line}` : f.file;
    console.log(`${color}[${f.severity.toUpperCase()}]${RESET} ${f.rule}`);
    console.log(`  ${loc}`);
    console.log(`  ${f.message}`);
    if (f.suggestion) console.log(`  → ${f.suggestion}`);
    console.log();
  }

  const counts = findings.reduce<Record<string, number>>((acc, f) => {
    acc[f.severity] = (acc[f.severity] ?? 0) + 1;
    return acc;
  }, {});

  const summary = (['critical', 'high', 'medium', 'low', 'info'] as const)
    .filter((s) => counts[s])
    .map((s) => `${counts[s]} ${s}`)
    .join(', ');

  console.log(`${findings.length} finding(s): ${summary}\n`);
}

// ---------------------------------------------------------------------------
// Entry
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const args = parseArgs(process.argv);

  const result = await scan({
    root: args.root,
    harness: 'claude-code',
    contentRoot: getContentRoot(),
    minSeverity: args.minSeverity,
  });

  if (args.format === 'json') {
    console.log(JSON.stringify(result, null, 2));
  } else {
    printTerminal(result.findings, result.scannedRoot);
  }

  if (args.failOn) {
    const severityOrder: Finding['severity'][] = ['critical', 'high', 'medium', 'low', 'info'];
    const threshold = severityOrder.indexOf(args.failOn);
    const shouldFail = result.findings.some(
      (f) => severityOrder.indexOf(f.severity) <= threshold,
    );
    if (shouldFail) process.exit(1);
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});

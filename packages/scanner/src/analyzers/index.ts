import type { Analyzer } from '@rosetta/core';
import { hooksAnalyzer } from './hooks.js';
import { settingsAnalyzer } from './settings.js';
import { agentsAnalyzer } from './agents.js';
import { mcpAnalyzer } from './mcp.js';
import { driftAnalyzer } from './drift.js';
import { secretsAnalyzer } from './secrets.js';

export const defaultAnalyzers: Analyzer[] = [
  secretsAnalyzer,   // always first — blocks on hardcoded creds
  settingsAnalyzer,
  hooksAnalyzer,
  mcpAnalyzer,
  agentsAnalyzer,
  driftAnalyzer,     // last — needs lockfile + content package
];

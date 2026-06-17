import type { Adapter, Harness } from '@rosetta/core';
import { claudeCodeAdapter } from './harnesses/claude-code.js';
import { cursorAdapter } from './harnesses/cursor.js';
import { codexAdapter } from './harnesses/codex.js';
import { geminiAdapter } from './harnesses/gemini.js';
import { antigravityAdapter } from './harnesses/antigravity.js';
import { zedAdapter } from './harnesses/zed.js';

export { claudeCodeAdapter } from './harnesses/claude-code.js';
export { cursorAdapter } from './harnesses/cursor.js';
export { codexAdapter } from './harnesses/codex.js';
export { geminiAdapter } from './harnesses/gemini.js';
export { antigravityAdapter } from './harnesses/antigravity.js';
export { zedAdapter } from './harnesses/zed.js';

const registry = new Map<Harness, Adapter>([
  ['claude-code', claudeCodeAdapter],
  ['cursor',      cursorAdapter],
  ['codex',       codexAdapter],
  ['gemini',      geminiAdapter],
  ['antigravity', antigravityAdapter],
  ['zed',         zedAdapter],
]);

export function getAdapter(harness: Harness): Adapter {
  const adapter = registry.get(harness);
  if (!adapter) throw new Error(`No adapter registered for harness: ${harness}`);
  return adapter;
}

export function listAdapters(): Adapter[] {
  return [...registry.values()];
}

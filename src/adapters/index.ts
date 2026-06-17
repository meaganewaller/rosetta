// The adapter registry — the single source of truth for which harnesses are supported.
// Both the CLI and the coverage report import this.

import type { Adapter } from "../contract.ts";
import { cursorAdapter } from "./cursor.ts";
import { codexAdapter } from "./codex.ts";
import { opencodeAdapter } from "./opencode.ts";
import { geminiAdapter } from "./gemini.ts";
import { copilotAdapter } from "./copilot.ts";
import { antigravityAdapter } from "./antigravity.ts";
import { zedAdapter } from "./zed.ts";

export const adapters: Record<string, Adapter> = {
  cursor: cursorAdapter,
  codex: codexAdapter,
  opencode: opencodeAdapter,
  gemini: geminiAdapter,
  copilot: copilotAdapter,
  antigravity: antigravityAdapter,
  zed: zedAdapter,
};

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { ContentManifest, ContentItem } from '@rosetta/core';

const PACKAGE_ROOT = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIRS = ['rules', 'skills', 'agents', 'commands', 'hooks'] as const;

// ---------------------------------------------------------------------------
// Frontmatter parsing
// ---------------------------------------------------------------------------

function parseFrontmatter(content: string): Record<string, unknown> {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};

  const body = match[1];
  if (body === undefined) return {};

  const result: Record<string, unknown> = {};
  for (const line of body.split('\n')) {
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    const value = line.slice(colon + 1).trim().replace(/^["']|["']$/g, '');
    result[key] = value;
  }
  return result;
}

// ---------------------------------------------------------------------------
// Manifest builder
// ---------------------------------------------------------------------------

function collectItems(dir: string, base: string): ContentItem[] {
  if (!fs.existsSync(dir)) return [];

  const items: ContentItem[] = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const abs = path.join(dir, entry.name);
    const rel = path.join(base, entry.name);

    if (entry.isDirectory()) {
      items.push(...collectItems(abs, rel));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const content = fs.readFileSync(abs, 'utf8');
      items.push({
        path: rel.replace(/\\/g, '/'),
        frontmatter: parseFrontmatter(content),
      });
    }
  }

  return items;
}

export function buildManifest(): ContentManifest {
  const pkg = JSON.parse(
    fs.readFileSync(path.join(PACKAGE_ROOT, '..', 'package.json'), 'utf8'),
  ) as { version: string };

  const items: ContentItem[] = [];
  for (const dir of CONTENT_DIRS) {
    items.push(...collectItems(path.join(PACKAGE_ROOT, '..', dir), dir));
  }

  return { version: pkg.version, items };
}

export function getContentRoot(): string {
  return path.join(PACKAGE_ROOT, '..');
}

export { type ContentManifest, type ContentItem };

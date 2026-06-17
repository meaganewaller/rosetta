import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type { Harness, RosettaLockfile, LockfileEntry } from '@rosetta/core';

const LOCKFILE_NAME = '.rosetta-lock.json';

export function lockfilePath(root: string): string {
  return path.join(root, LOCKFILE_NAME);
}

export function loadLockfile(root: string): RosettaLockfile | null {
  const p = lockfilePath(root);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8')) as RosettaLockfile;
  } catch {
    return null;
  }
}

export function writeLockfile(root: string, lockfile: RosettaLockfile): void {
  fs.writeFileSync(lockfilePath(root), JSON.stringify(lockfile, null, 2) + '\n', 'utf8');
}

export function hashFile(filePath: string): string {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

export function buildLockfileEntry(
  filePath: string,
  contentVersion: string,
  harness: Harness,
): LockfileEntry {
  return {
    contentVersion,
    sourceHash: hashFile(filePath),
    harness,
    installedAt: new Date().toISOString(),
  };
}

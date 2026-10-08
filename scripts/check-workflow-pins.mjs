import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = '.github/workflows';
const sha = /^[0-9a-f]{40}$/;
const violations = [];

for (const name of readdirSync(dir)) {
  if (!name.endsWith('.yml') && !name.endsWith('.yaml')) continue;
  const path = join(dir, name);
  const content = readFileSync(path, 'utf8');

  for (const match of content.matchAll(/uses:\s*([^\s#]+)/g)) {
    const action = match[1] ?? '';
    const at = action.lastIndexOf('@');
    const ref = at >= 0 ? action.slice(at + 1) : '';
    if (!sha.test(ref)) violations.push(`${path}: ${action}`);
  }
}

if (violations.length > 0) {
  process.stderr.write(
    `Unpinned GitHub Actions detected:\n${violations.join('\n')}\n`,
  );
  process.exit(1);
}

process.stdout.write('GitHub Actions are pinned to immutable commit SHAs.\n');

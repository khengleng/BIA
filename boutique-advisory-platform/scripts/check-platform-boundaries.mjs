#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const checks = [
  {
    scope: 'core-frontend/src',
    forbidden: [/from\s+['"][^'"]*trade-frontend[^'"]*['"]/g, /require\(\s*['"][^'"]*trade-frontend[^'"]*['"]\s*\)/g],
    message: 'Core frontend must not import from trade-frontend source (enforce micro-frontend boundary).',
  },
  {
    scope: 'trade-frontend/src',
    forbidden: [/from\s+['"][^'"]*core-frontend[^'"]*['"]/g, /require\(\s*['"][^'"]*core-frontend[^'"]*['"]\s*\)/g],
    message: 'Trade frontend must not import from core-frontend source (enforce micro-frontend boundary).',
  },
  {
    scope: 'backend/src',
    forbidden: [
      /from\s+['"][^'"]*(core-frontend|trade-frontend)[^'"]*['"]/g,
      /require\(\s*['"][^'"]*(core-frontend|trade-frontend)[^'"]*['"]\s*\)/g,
    ],
    message: 'Backend must not import web frontend source (enforce service boundary).',
  },
];

const sourceExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);

function walkFiles(dir) {
  const out = [];
  const stack = [dir];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || !fs.existsSync(current)) continue;
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === '.test-dist') continue;
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
      } else if (sourceExtensions.has(path.extname(entry.name))) {
        out.push(full);
      }
    }
  }
  return out;
}

const violations = [];

for (const check of checks) {
  const absScope = path.join(repoRoot, check.scope);
  for (const file of walkFiles(absScope)) {
    const content = fs.readFileSync(file, 'utf8');
    for (const regex of check.forbidden) {
      regex.lastIndex = 0;
      if (regex.test(content)) {
        violations.push({
          file: path.relative(repoRoot, file),
          scope: check.scope,
          message: check.message,
          pattern: regex.toString(),
        });
      }
    }
  }
}

if (violations.length > 0) {
  console.error('❌ Platform boundary violations found:');
  for (const violation of violations) {
    console.error(`- ${violation.file}`);
    console.error(`  scope: ${violation.scope}`);
    console.error(`  rule: ${violation.message}`);
    console.error(`  pattern: ${violation.pattern}`);
  }
  process.exit(1);
}

console.log('✅ Platform boundary checks passed (no cross-platform source imports found).');

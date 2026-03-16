#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const defaultRepoRoot = path.resolve(scriptDir, '..');
const inputRoot = process.argv[2] ? path.resolve(process.argv[2]) : defaultRepoRoot;
const repoRoot = inputRoot;

const checks = [
  {
    scope: 'core-frontend/src',
    message: 'Core frontend must not import or reference trade-frontend source.',
    forbidden: [
      /(?:from|import\s*\()\s*['"][^'"]*trade-frontend[^'"]*['"]/g,
      /require\(\s*['"][^'"]*trade-frontend[^'"]*['"]\s*\)/g,
      /['"][^'"]*\.\.\/[^'"]*trade-frontend\/src[^'"]*['"]/g,
      /['"]@trade-frontend\//g,
    ],
  },
  {
    scope: 'trade-frontend/src',
    message: 'Trade frontend must not import or reference core-frontend source.',
    forbidden: [
      /(?:from|import\s*\()\s*['"][^'"]*core-frontend[^'"]*['"]/g,
      /require\(\s*['"][^'"]*core-frontend[^'"]*['"]\s*\)/g,
      /['"][^'"]*\.\.\/[^'"]*core-frontend\/src[^'"]*['"]/g,
      /['"]@core-frontend\//g,
    ],
  },
  {
    scope: 'backend/src',
    message: 'Backend service must not import or reference web frontend source trees.',
    forbidden: [
      /(?:from|import\s*\()\s*['"][^'"]*(core-frontend|trade-frontend)[^'"]*['"]/g,
      /require\(\s*['"][^'"]*(core-frontend|trade-frontend)[^'"]*['"]\s*\)/g,
      /['"][^'"]*\.\.\/[^'"]*(core-frontend|trade-frontend)\/src[^'"]*['"]/g,
      /['"]@(core|trade)-frontend\//g,
    ],
  },
];

const sourceExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);
const ignoreDirs = new Set(['node_modules', '.next', '.test-dist', 'dist', 'build', '.git']);

function walkFiles(dir) {
  const out = [];
  const stack = [dir];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || !fs.existsSync(current)) continue;

    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (ignoreDirs.has(entry.name)) continue;
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
      } else if (sourceExtensions.has(path.extname(entry.name))) {
        out.push(fullPath);
      }
    }
  }

  return out;
}

function findLineNumber(content, index) {
  return content.slice(0, index).split('\n').length;
}

if (!fs.existsSync(repoRoot)) {
  console.error(`❌ Repository root does not exist: ${repoRoot}`);
  process.exit(2);
}

const missingScopes = checks
  .map((check) => check.scope)
  .filter((scope) => !fs.existsSync(path.join(repoRoot, scope)));

if (missingScopes.length > 0) {
  console.error('❌ Boundary check misconfigured or run from wrong root. Missing scope directories:');
  for (const scope of missingScopes) {
    console.error(`- ${scope}`);
  }
  console.error(`Resolved repository root: ${repoRoot}`);
  process.exit(2);
}

const violations = [];

for (const check of checks) {
  const absScope = path.join(repoRoot, check.scope);
  for (const file of walkFiles(absScope)) {
    const content = fs.readFileSync(file, 'utf8');

    for (const regex of check.forbidden) {
      regex.lastIndex = 0;
      let match;
      while ((match = regex.exec(content)) !== null) {
        const line = findLineNumber(content, match.index);
        violations.push({
          file: path.relative(repoRoot, file),
          scope: check.scope,
          message: check.message,
          pattern: regex.toString(),
          line,
          excerpt: (match[0] || '').slice(0, 140),
        });
      }
    }
  }
}

if (violations.length > 0) {
  console.error('❌ Platform boundary violations found:');
  for (const violation of violations) {
    console.error(`- ${violation.file}:${violation.line}`);
    console.error(`  scope: ${violation.scope}`);
    console.error(`  rule: ${violation.message}`);
    console.error(`  pattern: ${violation.pattern}`);
    console.error(`  excerpt: ${violation.excerpt}`);
  }
  process.exit(1);
}

console.log(`✅ Platform boundary checks passed (no cross-platform source coupling found). Root: ${repoRoot}`);

#!/usr/bin/env node
// noah-core — codebase map: the top-level functions, classes and exports per folder, inside a
// character budget, so "reuse before writing" costs no search. No model, no dependencies.
//
// shortcut: regex, not a parser; misses nested or dynamic definitions. Upgrade path: the
// Graphify adapter (tree-sitter graph) for large repos.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const SRC = /\.(py|js|jsx|mjs|cjs|ts|tsx|go|rs|rb|java|kt|php|swift|cs)$/;
const SKIP_DIR = /(^|\/)(node_modules|\.git|dist|build|out|vendor|venv|\.venv|__pycache__|coverage|\.next|target|migrations|fixtures|tests?|__tests__|spec|graphify-out)(\/|$)/;
const SKIP_FILE = /(^|\/)(test_[^/]*|[^/]*(_test|\.test|\.spec|\.min|\.d)\.[a-z]+)$/;
const SHARED = /(util|helper|lib|common|shared|service|component|hook|core|model|schema|api)/i;
const MAX_FILES = 3000;
const MAX_BYTES = 200 * 1024;

const PATTERNS = {
  py: [/^(?:async\s+)?def\s+([A-Za-z]\w*)/gm, /^class\s+([A-Za-z]\w*)/gm],
  js: [/^export\s+(?:default\s+)?(?:async\s+)?(?:function\*?|class|const|let|var|interface|type|enum)\s+([A-Za-z_$][\w$]*)/gm,
       /^(?:async\s+)?(?:function\*?|class)\s+([A-Za-z_$][\w$]*)/gm],
  go: [/^func\s+(?:\([^)]*\)\s*)?([A-Z]\w*)/gm, /^type\s+([A-Z]\w*)/gm],
  rs: [/^pub\s+(?:async\s+)?(?:fn|struct|enum|trait|type)\s+(\w+)/gm],
  rb: [/^\s*(?:def|class|module)\s+([A-Za-z][\w.]*)/gm],
  jvm: [/^\s*(?:public\s+)?(?:abstract\s+)?(?:final\s+)?(?:class|interface|enum|record|struct)\s+(\w+)/gm],
};
const LANG = { py: 'py', js: 'js', jsx: 'js', mjs: 'js', cjs: 'js', ts: 'js', tsx: 'js', go: 'go', rs: 'rs',
  rb: 'rb', java: 'jvm', kt: 'jvm', swift: 'jvm', cs: 'jvm', php: 'jvm' };

function listFiles(root) {
  try {
    const tracked = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'],
      { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 3000 }).split('\n').filter(Boolean);
    if (tracked.length) return tracked;
  } catch (e) { /* not a git repo: walk below */ }
  const out = [];
  const walk = (dir) => {
    for (const ent of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
      const rel = dir ? `${dir}/${ent.name}` : ent.name;
      if (ent.isDirectory()) { if (!SKIP_DIR.test(rel) && out.length < MAX_FILES * 3) walk(rel); }
      else out.push(rel);
    }
  };
  try { walk(''); } catch (e) { /* unreadable dir: map what we have */ }
  return out;
}

function names(file, text) {
  const pats = PATTERNS[LANG[path.extname(file).slice(1)]] || [];
  const found = [];
  for (const re of pats) for (const m of text.matchAll(re)) if (!m[1].startsWith('_')) found.push(m[1]);
  return [...new Set(found)];
}

function buildMap(root, budget = 2000) {
  const files = listFiles(root).filter((f) => SRC.test(f) && !SKIP_DIR.test(f) && !SKIP_FILE.test(f)).slice(0, MAX_FILES);
  const byDir = new Map();
  for (const f of files) {
    let text;
    try {
      const full = path.join(root, f);
      if (fs.statSync(full).size > MAX_BYTES) continue;
      text = fs.readFileSync(full, 'utf8');
    } catch (e) { continue; }
    const n = names(f, text);
    if (!n.length) continue;
    const dir = path.dirname(f);
    if (!byDir.has(dir)) byDir.set(dir, []);
    byDir.get(dir).push(...n);
  }
  if (!byDir.size) return '';
  // Shared code first when the budget is tight: it is what "reuse" is about.
  const dirs = [...byDir.keys()].sort((a, b) => (SHARED.test(b) - SHARED.test(a)) || a.localeCompare(b));
  const header = 'Codebase map (top-level definitions per folder; reuse before writing new code):';
  const lines = [];
  let used = header.length;
  for (const d of dirs) {
    const line = `${d}: ${[...new Set(byDir.get(d))].join(', ')}`;
    const clipped = line.length > 300 ? line.slice(0, 297) + '...' : line;
    if (used + clipped.length + 1 > budget) { lines.push(`(+${dirs.length - lines.length} more folders; grep for the rest)`); break; }
    lines.push(clipped);
    used += clipped.length + 1;
  }
  return [header, ...lines].join('\n');
}

module.exports = { buildMap };

if (require.main === module) {
  process.stdout.write(buildMap(process.argv[2] || process.cwd(), Number(process.env.NOAH_MAP_CHARS || 2000)) + '\n');
}

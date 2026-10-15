const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const HOOKS = path.join(__dirname, '..', 'hooks');
const { buildMap } = require('../hooks/noah-map');
const { graphStatus } = require('../hooks/noah-graph');

function tmpRepo(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'noah-'));
  for (const [f, body] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true });
    fs.writeFileSync(path.join(dir, f), body);
  }
  return dir;
}

function runHook(script, env = {}, cwd = os.tmpdir()) {
  const out = execFileSync('node', [path.join(HOOKS, script)], {
    cwd, encoding: 'utf8', env: { ...process.env, CLAUDE_PROJECT_DIR: cwd, ...env },
  });
  return out ? JSON.parse(out).hookSpecificOutput : null;
}

test('session hook emits valid SessionStart context with the active level', () => {
  const out = runHook('noah-session.js');
  assert.strictEqual(out.hookEventName, 'SessionStart');
  assert.match(out.additionalContext, /# Noah Core/);
  assert.match(out.additionalContext, /Active level: full\./);
});

test('lite keeps only sections 1, 2, 5 and 6', () => {
  const ctx = runHook('noah-session.js', { NOAH_LEVEL: 'lite', NOAH_MAP: '0' }).additionalContext;
  const heads = ctx.match(/^## .*/gm);
  assert.deepStrictEqual(heads.map((h) => h.slice(3, 5)), ['1.', '2.', '5.', '6.']);
});

test('off emits nothing', () => {
  assert.strictEqual(runHook('noah-session.js', { NOAH_LEVEL: 'off' }), null);
  assert.strictEqual(runHook('noah-subagent.js', { NOAH_LEVEL: 'off' }), null);
});

test('subagent hook injects only the context and output rules', () => {
  const ctx = runHook('noah-subagent.js').additionalContext;
  assert.match(ctx, /Context is the budget/);
  assert.match(ctx, /Summary first/);
  assert.doesNotMatch(ctx, /Reply short/);
});

test('map lists definitions, skips tests and respects the budget', () => {
  const dir = tmpRepo({
    'src/utils/money.py': 'def to_cents(x):\n    pass\nclass Wallet:\n    pass\ndef _private():\n    pass\n',
    'src/app.ts': 'export function startApp() {}\nexport const PORT = 1\n',
    'tests/test_money.py': 'def test_it():\n    pass\n',
  });
  const map = buildMap(dir, 2000);
  assert.match(map, /src\/utils: to_cents, Wallet/);
  assert.match(map, /src: startApp, PORT/);
  assert.doesNotMatch(map, /test_it|_private/);
  assert.ok(buildMap(dir, 120).length <= 200);
});

test('graph adapter is silent without a graph or without the CLI', () => {
  const dir = tmpRepo({ 'a.py': 'x = 1\n' });
  assert.strictEqual(graphStatus(dir, true).status, 'none');
  fs.mkdirSync(path.join(dir, 'graphify-out'));
  fs.writeFileSync(path.join(dir, 'graphify-out', 'graph.json'), '{}');
  assert.strictEqual(graphStatus(dir, false).status, 'none');
  assert.strictEqual(graphStatus(dir, true).status, 'fresh');
});

test('graph adapter flags a graph older than the last commit', () => {
  const dir = tmpRepo({ 'graphify-out/graph.json': '{}', 'a.py': 'x = 1\n' });
  const old = new Date(Date.now() - 3600 * 1000);
  fs.utimesSync(path.join(dir, 'graphify-out', 'graph.json'), old, old);
  const git = (...a) => execFileSync('git', a, { cwd: dir, stdio: 'ignore' });
  git('init', '-q');
  git('-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '-q', '--allow-empty', '-m', 'x');
  assert.strictEqual(graphStatus(dir, true).status, 'stale');
});

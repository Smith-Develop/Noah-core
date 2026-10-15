// noah-core — Graphify adapter. Zero cost when Graphify is not in use: it reports a graph only
// when graphify-out/graph.json exists AND the graphify CLI is on PATH. Otherwise it says nothing.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

function onPath(cmd) {
  const dirs = String(process.env.PATH || '').split(path.delimiter);
  const exts = process.platform === 'win32' ? ['.exe', '.cmd', '.bat', ''] : [''];
  return dirs.some((d) => exts.some((e) => { try { return fs.statSync(path.join(d, cmd + e)).isFile(); } catch (x) { return false; } }));
}

function lastCommitTime(root) {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%ct'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 2000 });
    return Number(out.trim()) * 1000 || 0;
  } catch (e) { return 0; }
}

// Returns { status: 'none' | 'fresh' | 'stale', note }.
function graphStatus(root, hasCli = onPath('graphify')) {
  const graph = path.join(root, 'graphify-out', 'graph.json');
  let mtime;
  try { mtime = fs.statSync(graph).mtimeMs; } catch (e) { return { status: 'none', note: '' }; }
  if (!hasCli) return { status: 'none', note: '' };
  if (lastCommitTime(root) > mtime) {
    return { status: 'stale', note: 'Graphify graph found but older than the last commit: prefer grep, or suggest `graphify update .`.' };
  }
  return { status: 'fresh', note: 'Graphify graph available (graphify-out/graph.json): use `graphify query "<question>"` for architecture and relationship questions before grepping.' };
}

module.exports = { graphStatus };

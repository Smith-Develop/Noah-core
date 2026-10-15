#!/usr/bin/env node
// noah-core — SessionStart hook: injects the ruleset, the codebase map and the Graphify note.
// Env: NOAH_LEVEL=lite|full|ultra|off (default full), NOAH_MAP=0 to skip the map,
// NOAH_MAP_CHARS=<n> map budget (default 2000).

const { level, rules, emit } = require('./noah-lib');
const { buildMap } = require('./noah-map');
const { graphStatus } = require('./noah-graph');

const lvl = level();
if (lvl === 'off') process.exit(0);

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const parts = [rules(lvl)];

// Fail open everywhere: a missing map or graph must never block the session.
let graph = { status: 'none', note: '' };
try { graph = graphStatus(root); } catch (e) { /* no graph */ }
if (graph.note) parts.push(graph.note);

// A fresh graph replaces the regex map; never pay for both.
if (process.env.NOAH_MAP !== '0' && graph.status !== 'fresh') {
  try {
    const map = buildMap(root, Number(process.env.NOAH_MAP_CHARS || 2000));
    if (map) parts.push(map);
  } catch (e) { /* no map */ }
}

emit('SessionStart', parts.join('\n\n'));

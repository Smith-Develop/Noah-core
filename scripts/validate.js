#!/usr/bin/env node
// Structural checks: every skill has valid frontmatter, and the always-on core stays inside its
// token budget (the whole point of Noah is that the core is cheap).

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CORE_MAX_CHARS = 6500; // ~1.6k tokens
const SKILL_MAX_CHARS = 4000;
let failed = false;
const fail = (msg) => { console.error('FAIL', msg); failed = true; };

for (const name of fs.readdirSync(path.join(ROOT, 'skills'))) {
  const file = path.join(ROOT, 'skills', name, 'SKILL.md');
  if (!fs.existsSync(file)) { fail(`${name}: missing SKILL.md`); continue; }
  const text = fs.readFileSync(file, 'utf8');
  const fm = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!fm) { fail(`${name}: no frontmatter`); continue; }
  if (!new RegExp(`^name: ${name}$`, 'm').test(fm[1])) fail(`${name}: frontmatter name must equal folder name`);
  if (!/^description:/m.test(fm[1])) fail(`${name}: missing description`);
  const max = name === 'noah-core' ? CORE_MAX_CHARS : SKILL_MAX_CHARS;
  if (text.length > max) fail(`${name}: ${text.length} chars > budget ${max}`);
  console.log(`ok   ${name.padEnd(14)} ${text.length} chars (~${Math.round(text.length / 4)} tokens)`);
}

for (const f of ['.claude-plugin/plugin.json', '.claude-plugin/marketplace.json', 'hooks/hooks.json']) {
  try { JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')); } catch (e) { fail(`${f}: ${e.message}`); }
}

process.exit(failed ? 1 : 0);

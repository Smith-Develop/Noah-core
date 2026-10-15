// noah-core — shared helpers for the hooks. The ruleset lives only in skills/noah-core/SKILL.md;
// the hooks read it from there so the skill and the injected context never drift apart.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SKILL = path.join(ROOT, 'skills', 'noah-core', 'SKILL.md');
const LEVELS = ['lite', 'full', 'ultra', 'off'];
const LITE_SECTIONS = /^## (1|2|5|6)\. /;

function level() {
  const l = String(process.env.NOAH_LEVEL || 'full').toLowerCase();
  return LEVELS.includes(l) ? l : 'full';
}

function skillBody() {
  const raw = fs.readFileSync(SKILL, 'utf8');
  return raw.replace(/^---\n[\s\S]*?\n---\n/, '').trim();
}

// Split the body on "## " headings; the text before the first one is the intro.
function sections(body) {
  const parts = body.split(/\n(?=## )/);
  return { intro: parts[0], rest: parts.slice(1) };
}

function rules(lvl = level()) {
  const body = skillBody().replace(/<!-- subagent:(start|end) -->\n?/g, '');
  if (lvl !== 'lite') return `${body}\n\nActive level: ${lvl}.`;
  const { intro, rest } = sections(body);
  const kept = rest.filter((s) => LITE_SECTIONS.test(s));
  return [intro, ...kept].join('\n').trim() + '\n\nActive level: lite.';
}

// Only the context and output rules: what a subagent needs, nothing about replies to the user.
function subagentRules() {
  const m = skillBody().match(/<!-- subagent:start -->\n([\s\S]*?)<!-- subagent:end -->/);
  return m ? `Noah Core (subagent rules):\n${m[1].trim()}` : '';
}

function emit(event, context) {
  if (!context) return;
  try {
    process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: event, additionalContext: context } }));
  } catch (e) { /* a closed stdout must never surface as a hook failure */ }
}

module.exports = { level, rules, subagentRules, emit, skillBody };

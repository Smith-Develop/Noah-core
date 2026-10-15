#!/usr/bin/env node
// noah-core — SubagentStart hook. SessionStart context never reaches subagents, so each one
// gets the context and output rules (not the full ruleset: subagents do not talk to the user).
// NOAH_SUBAGENTS=0 disables it.

const { level, subagentRules, emit } = require('./noah-lib');

if (level() === 'off' || process.env.NOAH_SUBAGENTS === '0') process.exit(0);
emit('SubagentStart', subagentRules());

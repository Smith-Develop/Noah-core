# Evals

Noah only claims what it measures. These evals run the same tasks on your own repo with and without the plugin.

## Run an A/B

```bash
# 1. Edit cases.json: your prompts, and a "check" shell command that exits 0 when the task is done.
# 2. Run (each case × 2 arms × N runs; costs real tokens):
evals/run-ab.sh /path/to/your/repo evals/cases.json 3
```

Each run uses a fresh `git worktree` of `HEAD`, so runs do not affect each other or your working copy. Results go to `evals/results/<timestamp>.csv` with input, output and cache-read tokens, cost in USD, turns and the check result, followed by per-arm medians.

## Reading the results

- Compare **medians**, not single runs: agent runs vary a lot.
- A lower cost with more `fail` checks is a regression, not a saving.
- `cases.json` ships with placeholders (`npm test`, `bin/cli.js`): adapt them to your project.

## Structural checks (free)

```bash
npm run validate   # frontmatter, plugin manifests, token budget of every skill
npm test           # hooks: levels, off switch, subagent rules, map budget, Graphify adapter
```

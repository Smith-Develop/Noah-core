#!/usr/bin/env bash
# A/B: run the same tasks with and without Noah Core on a copy of your repo, and record
# tokens, cost, turns and whether the task's check passed.
#
# Usage: evals/run-ab.sh <repo-path> [cases.json] [runs-per-arm]
# Optional: EVAL_MODEL=<model> to pin the model for both arms.
# Needs: claude (logged in), jq, git. Output: evals/results/<timestamp>.csv
set -euo pipefail

REPO=$(cd "${1:?usage: run-ab.sh <repo-path> [cases.json] [runs]}" && pwd)
HERE=$(cd "$(dirname "$0")" && pwd)
PLUGIN=$(dirname "$HERE")
CASES=${2:-$HERE/cases.json}
RUNS=${3:-3}
OUT="$HERE/results/$(date +%Y%m%d-%H%M%S).csv"
mkdir -p "$HERE/results"
echo "case,arm,run,input_tokens,output_tokens,cache_read_tokens,cost_usd,turns,check" > "$OUT"

for i in $(seq 0 $(($(jq length "$CASES") - 1))); do
  id=$(jq -r ".[$i].id" "$CASES")
  prompt=$(jq -r ".[$i].prompt" "$CASES")
  check=$(jq -r ".[$i].check // empty" "$CASES")
  for arm in base noah; do
    for run in $(seq 1 "$RUNS"); do
      work=$(mktemp -d)
      git -C "$REPO" worktree add -q --detach "$work" HEAD
      flags=(${EVAL_MODEL:+--model "$EVAL_MODEL"})
      [ "$arm" = noah ] && flags+=(--plugin-dir "$PLUGIN")
      json=$(cd "$work" && echo "$prompt" | claude -p "${flags[@]}" --output-format json \
        --permission-mode acceptEdits --allowedTools "Bash,Read,Edit,Write,Glob,Grep" 2>/dev/null || echo '{}')
      result=skip
      if [ -n "$check" ]; then (cd "$work" && bash -c "$check" >/dev/null 2>&1) && result=pass || result=fail; fi
      echo "$json" | jq -r --arg c "$id" --arg a "$arm" --arg r "$run" --arg k "$result" \
        '[$c,$a,$r,(.usage.input_tokens//0),(.usage.output_tokens//0),(.usage.cache_read_input_tokens//0),(.total_cost_usd//0),(.num_turns//0),$k]|@csv' >> "$OUT"
      git -C "$REPO" worktree remove --force "$work"
      echo "done: $id $arm #$run"
    done
  done
done

echo; echo "Results: $OUT"
# Per-arm medians of cost and output tokens.
for arm in base noah; do
  for col in 5 7; do
    med=$(awk -F, -v a="\"$arm\"" -v c=$col '$2==a{gsub(/"/,"",$c); print $c}' "$OUT" | sort -g | awk '{v[NR]=$1} END{if(NR) print (NR%2?v[(NR+1)/2]:(v[NR/2]+v[NR/2+1])/2)}')
    [ $col = 5 ] && echo -n "$arm  median output tokens: $med" || echo "   median cost: \$$med"
  done
done

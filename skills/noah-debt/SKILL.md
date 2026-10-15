---
name: noah-debt
description: >
  List every `shortcut:` comment in the repo as a debt ledger, so deliberate
  shortcuts never become permanent by accident. Read-only report. Use for
  "noah debt", "list the shortcuts", "what did we defer", /noah-debt.
argument-hint: "[marker]"
---

# Noah Debt

Read-only: change nothing.

## Scan

```bash
git grep -nE '(#|//|/\*|--) ?shortcut:' -- . ':!*.min.*'
```

Not a git repo: use `grep -rnE` with the same pattern, excluding dependency and build folders. If the user names another marker (`/noah-debt TODO`), search for that word instead.

## Report

One table, most urgent first:

| Where | Limit | Upgrade when |
|---|---|---|
| `file:line` | the stated limit | the stated trigger |

Flag entries whose trigger already looks met (for example "upgrade when >1 user" in a multi-user service). End with the total count. No entries: say so in one line.

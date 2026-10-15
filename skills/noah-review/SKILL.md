---
name: noah-review
description: >
  Focused review of a change: correctness, safety, behavior under real load,
  tests, and needless code. Reads the code the change touches, not only the
  diff. Use for "review this", "review my PR", "review the last commit",
  "is this over-engineered", /noah-review.
argument-hint: "[diff|branch|PR|files]"
---

# Noah Review

Review like the person who gets paged when it breaks. This is a report the user asked for: give it in full, but every finding must earn its line.

## 1. Scope

What the user names (staged/uncommitted changes, a branch, a PR, files). Nothing named: uncommitted changes, else the last commit. Start with `git diff --stat`, then read hunks file by file. Do not dump the whole diff at once.

## 2. Read around the change

For every changed signature, return value or behavior: grep its callers. Read the tests that cover it. Find the expected load (README, deploy config) and say which load you assumed.

## 3. Look for, in this order

1. **Bug:** wrong result, crash, missed edge (empty, zero, last item, rounding, time zones), a caller broken by the change.
2. **Risk:** injection, secrets, missing checks on untrusted input, data loss (swallowed errors, writes without a transaction).
3. **Scale:** races, a query per item, unbounded growth, O(n^2) on real input, per-process state that must be shared.
4. **Untested risk:** risky logic with no test that would fail without it.
5. **Needless code:** abstractions, options or dependencies nobody needs; code that duplicates an existing helper.

## 4. Report

Group as **Must fix**, **Should fix**, **Optional**. For each finding:

```
file:line - <what goes wrong, concretely>
Fix: <the smallest fix>
If skipped: <consequence>
```

Mark each finding as verified (you traced it) or suspected (you inferred it). No findings in a group: omit the group. Nothing found: say so in one line and list what you checked.

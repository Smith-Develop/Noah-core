---
name: noah-context
description: >
  Session hygiene for long Claude Code work: when to /clear or /compact, and a
  compact handoff file so a fresh session resumes without re-exploring. Use for
  "handoff", "save progress", "context is full", "start fresh", "resume",
  /noah-context.
argument-hint: "[save|resume]"
---

# Noah Context

A fresh session is cheap; re-exploring the repo is not. Persist only what a new session cannot recover quickly.

## save (default)

Write `.noah/handoff.md` (create the folder; suggest adding `.noah/` to `.gitignore`), at most ~40 lines:

```
# Handoff - <date>
Goal: <one line>
Done: <bullets, with file paths>
Next: <the very next step, then the rest>
Decisions: <choice - why, one line each>
Gotchas: <traps found, commands that work, flaky tests>
Verify with: <exact commands>
```

No code dumps, no logs, no repetition of what `git log` and `git diff` already show. Then tell the user: "Saved. Run /clear, then `/noah-context resume`."

## resume

Read `.noah/handoff.md` and `git status --short` / `git log --oneline -5`. Confirm the next step in one line and continue. Do not re-read files the handoff does not point to.

## When to suggest what

| Situation | Suggest |
|---|---|
| New task unrelated to the current one | `/clear` |
| Long session, task finished, more related work ahead | `/compact` with a focus hint, or save + `/clear` |
| Work will continue tomorrow or in another session | save |
| In the middle of a task | nothing: finish the step first |

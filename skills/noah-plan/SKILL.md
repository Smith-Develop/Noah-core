---
name: noah-plan
description: >
  Plan and build multi-step or multi-file work with minimal tokens: questions
  first, smallest overview, slices with a check each. Use for features, epics,
  migrations, "plan this", "how should we build", /noah-plan, or any task that
  spans several files or subsystems. Not for one-file fixes.
argument-hint: "[task] [auto]"
---

# Noah Plan

A plan exists to avoid rework, not to produce a document. Keep it short enough to read in one glance.

## 1. Questions, not prose

Turn the request into a checklist of open questions and the evidence each one needs. Resolve each from the code, config and conversation first. Ask the user only about what is left and changes the design, all in one message.

## 2. Smallest useful overview

Start from the codebase map (or `graphify query` if a graph exists), then read only the entry points the questions point to. Expand only where a concrete question is still unanswered. Broad sweeps go to an Explore subagent.

## 3. The plan

```
Goal: <one line, the observable result>
Out of scope: <what we will not do>
1. <slice> -> verify: <command or check>
2. <slice> -> verify: <command or check>
Risks: <only real ones>
```

- Each slice leaves the code working and is verifiable on its own. 3-7 slices; more means the task should be split.
- Order by dependency, riskiest unknown first.
- Reuse existing code; note which helper or pattern each slice uses.

## 4. Build

Without `auto`: show the plan and wait for approval. With `auto`, or once approved: implement slice by slice, run each slice's check, and do not re-plan unless a check fails for a reason the plan did not expect. Report at the end, not after every slice.

## 5. Handoff

If the work will continue in another session, finish with `noah-context` to persist the state.

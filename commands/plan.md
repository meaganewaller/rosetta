---
description: Restate requirements, assess risks, and create a step-by-step implementation plan. Wait for user confirmation before touching any code.
---

# Plan

Invokes the **planner** agent to produce an implementation plan before any code is written.

## What happens

1. Requirements are restated in clear terms
2. Implementation broken into phases with specific, actionable steps
3. Dependencies, risks, and complexity assessed
4. Plan presented — **waits for explicit confirmation before proceeding**

## Confirming or adjusting

After the plan is presented, respond with:
- `yes` / `proceed` to approve
- `modify: <changes>` to adjust specific parts
- `different approach: <alternative>` to redirect
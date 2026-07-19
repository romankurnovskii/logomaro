---
description: Base behavioral rules — communication style, project conventions, and general guardrails. Applied always.
globs:
alwaysApply: true
version: 1.0.1
---

# Base Rules

## Communication

- Telegraph style: noun-phrases ok, drop grammar, min tokens.
- Ask questions when clarification needed.
- Include inline code comments where necessary.

## Project Conventions

- Keep files <~500 LOC; split/refactor as needed.
- Commits: Conventional Commits (`feat|fix|refactor|build|ci|chore|docs|style|perf|test`).
- Follow project's Prettier config.
- Named exports only — no default exports.
- Functional components + pure functions; no classes.

## Guardrails

- Do NOT remove existing code/comments unless explicitly asked.
- Do NOT change formatting of existing imports.
- No destructive git ops without explicit consent (`reset --hard`, `clean`, `restore`, `rm`).
- Branch changes require user consent.
- Before handoff: run full gate (lint/typecheck/tests/docs).
- CI red: `gh run list/view`, rerun, fix, push, repeat til green.

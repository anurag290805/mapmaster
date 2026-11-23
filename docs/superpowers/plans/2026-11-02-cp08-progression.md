# CP08 Player Progression & Achievements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add provenance-independent, local-first player progression from valid CP04 terminal results.

**Architecture:** A TypeScript pure progression core owns validation, awards, migration and records. A legacy adapter owns browser storage and dashboard rendering; CP04 emits immutable results once after terminal transition.

**Tech Stack:** Vanilla JavaScript, TypeScript, Vitest, Node test runner, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-02-cp08-progression-design.md`

## Global Constraints

- No accounts, backend, services, dependencies, commits, deployment, CP05 activation or public-beta-gate changes.
- Do not alter CP04 score/timer/life behavior or CP06 Sprint rules.

## Review Focus

- Duplicate/stale result IDs must not change XP, records or unlocks.
- Corrupt, unavailable and future-version storage must fail closed to an empty in-memory state.
- Review/restart/abandon results must not award XP.
- Record comparison must stay within compatible settings.
- Dashboard content must remain keyboard-readable and fit a narrow viewport.

### Task 1: Pure progression core

**Files:** `src/shared/progression.ts`, `tests/unit/progression.test.ts`

- [ ] Write failing tests for deterministic XP, levels, validation/idempotency, achievements, compatible records, migration, reset and bounded state.
- [ ] Implement the stateless progression core.
- [ ] Run `npm run test:unit`.

### Task 2: CP04 bridge and local persistence

**Files:** `src/ui/progression-bridge.ts`, `js/progress.js`, `js/game.js`, `js/state.js`, `index.html`, `tests/cp04-lifecycle.test.cjs`

- [ ] Write failing tests for one terminal payload per valid session and no abandoned/review award.
- [ ] Add storage-safe adapter and immutable CP04 terminal-result handoff.
- [ ] Run focused lifecycle tests.

### Task 3: Accessible Progress dashboard

**Files:** `index.html`, `css/screens.css`, `js/progress.js`, `tests/e2e/cp08-progression.spec.ts`

- [ ] Write failing browser tests for persisted dashboard, reset, keyboard access and mobile layout.
- [ ] Render local progression through existing design tokens and safe DOM APIs.
- [ ] Run the focused browser test.

### Task 4: Acceptance

- [ ] Run `npm run check`, the serial Brave E2E suite and `git diff --check`; do not commit.

# CP10 Daily Challenges Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver deterministic, offline daily capital challenges with local history, replay-safe CP08 XP, calendar, results, sharing, and accessibility.

**Architecture:** A pure daily domain module produces versioned challenge identities and migrated bounded state. A UI bridge persists state and composes it with the existing CP04/CP06 runtime; the legacy game only accepts an ordered daily queue and emits terminal events.

**Tech Stack:** TypeScript, Vitest, classic browser JavaScript, Playwright, Vite.

**Spec:** `docs/engineering/CP10_DAILY_CHALLENGES.md`

## Global Constraints

- Preserve CP04 lifecycle/scoring, CP05 isolation/gates, CP06 modes, CP07 review, CP08 idempotency, CP09 visual/audio behavior.
- No account, backend, paid API, service worker, deployment, or git history mutation.
- Daily content is approved existing capital content only; daily uses local-device calendar policy.
- `build:public-beta` remains fail-closed.

## Review Focus

- Corrupt or unavailable storage must leave a playable, non-crashing in-memory experience.
- A daily loss cannot consume the first-completion XP claim.
- Replays and duplicate terminal callbacks cannot mint more XP.
- Backwards local-day jumps suppress claims; future days are locked.
- Runtime queue must not alter normal CP06 random sprint behavior.

### Task 1: Daily domain rules

**Files:** Create `src/shared/daily.ts`; modify `tests/unit/daily.test.ts`.

- [ ] Write failing deterministic, calendar, streak, difficulty, migration, and claim tests.
- [ ] Implement versioned seed generation, validated queue generation, bounded migration, calendar classification, and terminal claim rules.
- [ ] Run `npm run test:unit -- tests/unit/daily.test.ts`.

### Task 2: Runtime integration

**Files:** Modify `js/state.js`, `js/game.js`, `js/modes.js`, `js/ui.js`; modify `tests/cp10-runtime.test.cjs`.

- [ ] Write failing queue/terminal guard tests.
- [ ] Implement CP04 lifecycle-compatible daily queue, summary hook, and CP08-only first-win progression route.
- [ ] Run the focused legacy tests.

### Task 3: UI, accessibility, and offline adapter

**Files:** Modify `index.html`, `css/cp10.css`, `src/ui/daily-bridge.ts`, `vite.config.mts`; modify unit/E2E tests.

- [ ] Write failing UI/share/storage/keyboard tests.
- [ ] Implement the daily hub, keyboard calendar, result summary, Web Share/clipboard fallback, safe storage, and runtime entry.
- [ ] Run focused unit and Playwright tests.

### Task 4: Regression verification

**Files:** Modify documentation only as needed.

- [ ] Run typecheck, static checks, legacy/unit suites, relevant lifecycle E2E, Brave-available Playwright suite, normal and blocked public-beta builds.
- [ ] Record exact outcomes and unresolved environment-specific skips.

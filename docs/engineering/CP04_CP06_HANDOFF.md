# CP04–CP06 engineering handoff

**Recorded:** 2026-11-02  
**Scope:** Preserve CP01–CP07 work. This is a handoff, not approval to activate CP05 geography or begin CP07–CP09 work.

## Checkpoint verdicts

| Checkpoint | Engineering verdict | Acceptance gate still open |
| --- | --- | --- |
| CP04 | **ENGINEERING ACCEPTED** — one `gameState` session owner; deterministic scoring, timers, lives, streaks, restart, results, review and stale-callback guards. | Physical-device and comprehensive screen-reader verification. |
| CP05 | **ENGINEERING GUARDS COMPLETE — ORIGINAL SCOPE NOT ACCEPTED — PUBLIC RELEASE BLOCKED.** Existing maps remain live; candidate/pilot stay development-only. | Geographic, policy, rights and manual accessibility/performance gates below. |
| CP06 | **ENGINEERING ACCEPTED** — Capital Sprint and Flag Sprint reuse CP04 lifecycle with four distinct choices, practice/challenge, empty-pool rejection, keyboard focus, feedback, restart and results. | Physical-device and screen-reader verification; Flag Sprint's Unicode country-code clue is a nonvisual route, not a full assistive-technology study. |

## Architecture and functionality

- CP04 owns mutable session state in `js/state.js`; `src/shared/gameplay.ts` supplies stateless rules. CP06 choice modes are in `js/modes.js`; they do not introduce a second engine.
- CP05's inactive `js/world-map-adapter.mjs` validates manifest/DOM/session identity and routes accepted selections to CP04 only. Candidate integration is localhost-development-only; it is not imported into live classic scripts.
- Live map replacement ownership uses generation-bound `<object>` documents. A failed SVG leaves `svgLoaded` false and gives a retry instruction; stale loads, retired documents, terminal/review input and obsolete listeners are rejected.
- `vite.config.mts` keeps `candidate/`, `pilot/` and their modules out of normal build output. `npm run build:public-beta` fails closed while the ten inherited blocked SVGs remain unresolved.

## Evidence

- Latest engineering check: `npm run check` passed **61 legacy + 5 unit** tests, typecheck, lint, format and production build.
- CP05 focused evidence: **24** Node lifecycle/release-gate tests, **3** development candidate lifecycle/control E2E tests, **2** production-isolation E2E tests and **1** live map-load fallback E2E test passed.
- Latest recorded full serial Brave regression: **166 passed, 32 skipped**. Do not infer physical-device or screen-reader verification from browser emulation.
- `git diff --check` passed.

## CP05 release restrictions

- Geographic readiness remains **0 VERIFIED, 165 AUTOMATED_ONLY, 7 AMBIGUOUS, 22 POLICY_DEPENDENT, 0 BLOCKED**. These categories do not authorize live use.
- Retain all six founder decisions: India ADM1 authority/effective date; Jammu & Kashmir/Ladakh presentation; CC BY 2.5 India attribution/redistribution; 28-state locate/8-UT typing scope; Natural Earth policy for 22 sensitive/disputed targets; Egypt repair approval.
- Public distribution remains blocked by the ten inherited SVG rights (`australia`, `brazil`, `canada`, `china`, `germany`, `japan`, `spain`, `uae`, `usa`, `world`) and unproven `js/data.js` geography provenance, as well as the founder/geographic gates above.

## Repository state and next conversation

- Branch: `anurag/mapmaster-cp05-world-map`; worktree intentionally dirty with CP04–CP07 tracked edits and CP05 candidate/audit/test/tool artifacts. No commit, push, merge, reset or deployment has occurred.
- A CP07–CP09 conversation must preserve the public-beta gate and disabled candidate. It must not call CP05 original scope accepted until external approvals and manual QA evidence are independently completed.

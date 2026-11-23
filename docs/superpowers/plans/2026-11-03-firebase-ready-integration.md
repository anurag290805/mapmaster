# MapMaster Firebase-ready Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the existing MapMaster PWA optional Firebase-authenticated, safely synchronized player saves while preserving guest/offline gameplay.

**Architecture:** The game remains local-first. Shared TypeScript functions validate and merge bounded progress/daily snapshots; browser adapters expose existing CP08/CP10 state to a Firebase Auth/Firestore synchronizer. Firebase is optional at build time through Vite environment values and all private data is isolated at `players/{uid}`.

**Tech Stack:** Vite 8, TypeScript, vanilla browser modules, Firebase Web SDK, Firebase Local Emulator Suite, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-03-firebase-ready-design.md`

## Global Constraints

- Firebase Spark-compatible services only; no billing, deployment, Cloud Functions, Storage, or hidden backend.
- Do not embed live Firebase credentials or service-account credentials.
- Do not alter CP05 public-release safeguards or introduce restricted-map caching.
- CP08 terminal processing remains the only XP award authority; restore/merge must not award XP.
- CP10 daily identities remain idempotent across devices.
- No commits, pushes, merges, rebases, or destructive Git actions.

## Review Focus

- A malformed or oversized cloud payload is rejected/sanitized rather than replacing healthy local progress (Task 1 test).
- A duplicate terminal or daily identity cannot increase XP/rewards after sync (Task 1 test).
- Switching users stops the old listener before importing the new account snapshot (Task 3 test).
- Offline writes only claim cloud success after Firestore acknowledgement (Task 3 browser state test).
- Rules reject a valid-looking write under another UID and a shape with unknown fields (Task 4 emulator test).

---

### Task 1: Versioned cloud save domain

**Files:**
- Create: `src/shared/cloud-save.ts`
- Test: `tests/unit/cloud-save.test.ts`

**Interfaces:**
- Produces `CloudSaveV1`, `createCloudSave`, `sanitizeCloudSave`, and `mergeCloudSaves(local, cloud)`.
- Consumes CP08 `ProgressState` and CP10 `DailyState` migration helpers.

- [ ] **Step 1: Write failing tests** for achievement union, best-record selection, duplicate daily identity, no XP summing, and corrupt payload fallback.
- [ ] **Step 2: Run `npm run test:unit -- tests/unit/cloud-save.test.ts`** and verify missing-module failure.
- [ ] **Step 3: Implement bounded schema creation, sanitation, and deterministic merge in `src/shared/cloud-save.ts`.** Preserve the greater valid XP; union IDs; merge personal-best fields independently; re-derive daily state with CP10 helper.
- [ ] **Step 4: Re-run `npm run test:unit -- tests/unit/cloud-save.test.ts`** and verify pass.

### Task 2: Local adapter hooks and account UI shell

**Files:**
- Modify: `js/progress.js`
- Modify: `src/ui/daily-bridge.ts`
- Modify: `index.html`
- Modify: `css/cp11.css`
- Test: `tests/e2e/account-shell.spec.ts`

**Interfaces:**
- Produces `window.MapMasterProgression.replaceState`, `window.MapMasterDaily.replaceState`, and `mapmaster:local-save-changed` events.
- Consumes `CloudSaveV1` fields without invoking CP08/CP10 terminal processors.

- [ ] **Step 1: Write failing browser tests** that the account control opens an accessible dialog and local state adapter can notify a save without awarding a result.
- [ ] **Step 2: Run the targeted test** and verify it fails because the UI/hooks are absent.
- [ ] **Step 3: Add replace/export hooks and a compact account dialog/status control.** Re-render existing dashboards after import and emit a change event only after genuine local mutations/imports.
- [ ] **Step 4: Re-run target browser test** and verify pass.

### Task 3: Firebase browser adapter and synchronization

**Files:**
- Create: `src/ui/firebase-client.ts`
- Create: `src/ui/cloud-sync-bridge.ts`
- Modify: `index.html`
- Modify: `src/ui/offline-registration.ts`
- Test: `tests/unit/cloud-sync.test.ts`
- Test: `tests/e2e/cloud-sync.spec.ts`

**Interfaces:**
- Consumes `CloudSaveV1` domain functions and local adapter hooks.
- Produces `window.MapMasterAccount` actions and user-visible `local-only`, `syncing`, `saved`, `offline`, and `error` state.

- [ ] **Step 1: Write failing tests** for env-disabled local-only operation, request coalescing, acknowledgement-only saved status, and account switch isolation.
- [ ] **Step 2: Run the focused unit tests** and verify missing client/bridge failures.
- [ ] **Step 3: Implement an optional Firebase initializer, Auth flows, redirect fallback, account deletion confirmation, Firestore listener/transaction sync, and debounced offline retry.** Initialize emulators when `VITE_USE_FIREBASE_EMULATORS=true`; never write cloud state while signed out.
- [ ] **Step 4: Re-run focused tests** and verify pass.

### Task 4: Emulator policy and setup documentation

**Files:**
- Create: `firestore.rules`
- Create: `firebase.json`
- Create: `.firebaserc.example`
- Create: `.env.example`
- Create: `tests/emulator/firestore.rules.test.mjs`
- Create: `docs/engineering/FIREBASE_SETUP.md`
- Modify: `package.json`

**Interfaces:**
- Rules accept only a valid own-UID `players/{uid}` CloudSaveV1 document with bounded known fields.
- `npm run test:emulator` starts against configured Auth/Firestore emulators without live credentials.

- [ ] **Step 1: Write the rule integration test** for own-user allow, cross-user deny, unauthenticated deny, and invalid shape deny.
- [ ] **Step 2: Run it against emulators or verify the expected tooling-unavailable skip.**
- [ ] **Step 3: Add Firebase emulator config, strict Rules, example environment values, and exact Console/manual device instructions.**
- [ ] **Step 4: Run the test again** and record a pass or explicit environment skip.

### Task 5: Integrated regression verification

**Files:**
- Modify: `docs/engineering/FIREBASE_SETUP.md`
- Test: existing unit/legacy/e2e suites plus new tests

- [ ] **Step 1: Add only missing focused regression coverage** for the CP10 normal-session reset and CP05 public beta block if affected.
- [ ] **Step 2: Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm run build`, and targeted browser tests.** Record exact output and distinguish unavailable emulator/browser prerequisites from failures.
- [ ] **Step 3: Audit changed files against the spec and record any manual/live verification remaining.**

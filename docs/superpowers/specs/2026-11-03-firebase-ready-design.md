# MapMaster Firebase-ready Design

## Intent

Add optional account identity and private cloud persistence to the existing MapMaster browser game without changing its CP04 gameplay lifecycle, CP08 reward authority, CP10 daily identity rules, or CP05 publication gate. A player can always remain a local guest; signing in makes a single, explicit merge of the guest save with that account and subsequently synchronizes it across devices.

## Goals

- Firebase Auth email/password, verification, reset, Google redirect/popup fallback, sign-out, guest state and account deletion UI.
- A Spark-compatible Firestore document per authenticated UID with a bounded, versioned game save.
- Local-first reads, debounced writes, offline indication, conservative retries, and safe conflict merging.
- Firestore Rules plus emulator-oriented unit coverage and documented Console setup.

## Non-goals

- A score leaderboard, Cloud Functions, Storage, paid Firebase products, deployment, App Store publication, or tamper-proof client score claims.
- Replacing the existing game engine, service worker, CP08 progression computation, or CP10 daily generator.

## Constraints

- Firebase configuration is sourced only from `VITE_FIREBASE_*` values; no project IDs, secrets, service accounts, or private keys are committed.
- Private saves live at `players/{uid}` and Rules only permit that UID to access its document.
- CP08 terminal results remain the only way local XP is awarded; loading, merging, or restoring never calls an award method.
- CP10 completion identities remain the de-duplication key for daily rewards.
- CP05 asset restrictions and the public-beta build failure must stay unchanged.

## Approaches considered

1. Rewrite the application in a framework with server APIs: rejected because it would replace accepted gameplay and add services outside the ₹0 requirement.
2. Firebase-only mutable gameplay state: rejected because it would break offline guest play and turn network restoration into reward processing.
3. **Chosen: local-first domain state with a Firebase adapter.** Existing CP08/CP10 adapters remain authoritative local services. A small shared module sanitizes and merges save snapshots; a browser adapter handles Firebase Auth and Firestore transactions, then imports an already-merged state into the existing services.

## Data and conflict policy

`CloudSaveV1` contains a schema version, an `updatedAt` client timestamp, CP08 `ProgressState`, CP10 `DailyState`, and documented settings. The serialized document is size-bounded and scrubbed of unknown/malformed values before use.

- Achievements are a set union.
- Processed terminal-result IDs and daily completion identities are deduplicated and bounded. Daily completion with the same identity retains the valid completion with the stronger score/accuracy/time ordering.
- Personal records retain high score, high accuracy, and fastest valid win independently.
- Streaks are re-derived from merged daily completion history; XP is never summed and is instead the maximum valid total represented by either save, so restoring cannot mint new rewards.
- Settings are last-write-wins by snapshot timestamp; a fresh account migration defaults to preserving the local settings.

## Browser integration

The account dialog exposes guest status, email registration/login, password recovery, Google sign-in, sign-out, profile name, sync status, deletion, export, and reset actions. The Google flow tries a popup and falls back to redirect when a browser blocks a popup; interrupted redirects are displayed as non-destructive errors. A signed-out shared device retains only local guest state and stops all listeners before a new account starts.

The existing CP10 worker remains the only worker. It continues caching its approved shell; no account documents, Firestore responses, restricted maps, or credentials are cached by the service worker.

## Verification and remaining setup

Pure save policies are unit tested. Firebase Rules tests and browser emulation are configured for the Local Emulator Suite and skip only when the developer has not installed the optional emulator tooling. Live provider behavior and physical-device install flows are explicitly left for Console/device QA.

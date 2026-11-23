# CP01–CP12 final reconciliation

**Recorded:** 2026-11-13  
**Purpose:** Original-scope acceptance ledger for the CP01–CP12 completion
sprint. This document does not grant founder approval, release approval, map
rights, or a public deployment.

## Acceptance matrix

| Checkpoint | Original deliverables | Implemented / verified evidence | Original-scope status | Remaining blocker |
| --- | --- | --- | --- | --- |
| CP01 | Audit, inventory and game specification | Accepted audit and baseline comparison in `audit/`; current working-tree integrity is retained | **PASS — development accepted** | Asset/data provenance remains a later CP07/CP12 release gate, not an unrecorded CP01 pass. |
| CP02 | Brand/design system, responsive and motion states | Tokens, components, theme and interaction integration; `design/CP02_VERIFICATION.md` | **PASS — development accepted** | Full assistive-technology/device conformance remains CP11 release QA. |
| CP03 | Home, navigation and truthful onboarding | Keyboard/navigation lifecycle coverage and documented acceptance | **PASS — development accepted** | Broader device/AT QA remains CP11. |
| CP03.5 | Reproducible Vite/TypeScript/test/release foundation | Vite build, typecheck, lint, Prettier, root/subpath test architecture and release documentation exist | **PASS — engineering foundation** | Classic-script bundling warning is evaluated, not suppressed; browser compatibility evidence remains CP11. |
| CP04 | Canonical sessions, scoring, timer, results/review and restart safety | 113 legacy tests include deadline, duplicate, stale callback, terminal and all-mode coverage; Flag Sprint canonical-question regression is retained | **PASS — engineering accepted** | Physical-device and comprehensive screen-reader evidence remains release QA. |
| CP05 | Validated accessible world-map upgrade with coverage, identity and fallback | Candidate adapters, canonical/session guards, chooser/focus/zoom/pan/reset and controlled browser coverage are development-only; public-beta gate is fail-closed | **BLOCKED — original scope** | Exact inherited-map/data redistribution rights; all geographic/policy decisions; independent geometry review; physical-device/AT and performance evidence. No candidate map may be activated. |
| CP06 | Curated expanded modes with accessible alternatives | Flag and Capital Sprint reuse CP04 lifecycle; 129 flag canonical identities audited; keyboard and results paths covered | **PASS — engineering accepted** | Physical-device/screen-reader QA; no unapproved geography expansion. |
| CP07 | Sourced versioned geography, policy and explanations | Candidate review corpus, frozen evidence, founder-pending states and Learning Cue no-leak boundaries are validated | **BLOCKED — original content approval** | Asset/data rights, geographic policy and explicit founder approval. Candidate facts/questions remain production-ineligible. |
| CP08 | Guest progression, migration and durable achievement behavior | Unit/legacy coverage for idempotent terminal results, persistence and duplicate-reward protection | **PASS — engineering accepted** | Cross-device/manual recovery remains CP11/CP12 release QA. |
| CP09 | Feedback, motion, sound and personalization | Reduced-motion, settings and audio control coverage documented; Learning Cue hides unsupported technical copy | **PASS — engineering accepted** | Physical-device/AT confirmation remains release QA. |
| CP10 | Deterministic daily/replay, offline and idempotent XP | `CP10_DAILY_CHALLENGES.md` engineering acceptance; candidate CP05 content excluded | **PASS — engineering accepted** | Physical device, share and screen-reader QA before public release. |
| CP11 | Quality, security, browser/device, accessibility and performance | Local-lab performance, production/subpath build, contrast/reflow and lifecycle evidence are documented | **BLOCKED — security remediation and release QA** | Fresh production audit emits one high Firebase/Firestore/gRPC advisory as four package entries, with no upstream-compatible remediation; field p75 and physical Firefox/Safari/iOS/Android/screen-reader testing also remain. |
| CP12 | Release candidate, feedback, free hosting and owner-authorized beta | Root/subpath artifacts, founder operations packet and fail-closed beta gate are documented | **BLOCKED — original scope** | CP05 rights/founder decisions; CP11 dependency remediation and manual QA; feedback/privacy/retention; host/operations choice; owner acceptance; deployment authorization. |

## Fresh sprint evidence

| Check | Result |
| --- | --- |
| `npm test` | **114 legacy passed; 34 unit passed** |
| `npm run format:check` | **Passed** |
| `npm run typecheck`, `npm run lint`, `npm run build` | **Passed**; the existing classic-script and >500 kB chunk advisories remain non-failing and recorded. |
| Flag Sprint and CP07 Playwright suite | **17 passed** |
| Full Chromium Playwright matrix (`npm run test:e2e -- --workers=1`) | **288 passed, 78 skipped** in 9.1 minutes. It used independent development, root-production and `/mapmaster/` artifacts. Candidate-only and emulator-only cases are intentional skips in non-emulator projects. |
| Firebase Auth/Firestore emulator matrix (`npm run test:e2e:emulator`) | **3 rules tests and 4 browser cloud-sync tests passed.** The runner now forces browser emulator mode, so this evidence is local-only. Expected rule-denial and WebChannel disconnect messages did not fail a test. |
| CP05 transformed-SVG mobile world touch | **Passed** after the adapter began resolving visual `elementFromPoint` identity before the transformed event-target fallback. |
| `npm run build:public-beta` | **Expected failure:** exact CP05 rights gate named `australia`, `brazil`, `canada`, `china`, `germany`, `japan`, `spain`, `uae`, `usa`, and `world`. |
| `git diff --check` | **Passed** |
| `npm audit --omit=dev --json` | **4 high package entries, one high root advisory:** `firebase@12.19.0` → Firestore → `@grpc/grpc-js@1.9.16`, plus one distinct low gRPC advisory. Web runtime exposure is reduced by the browser export, but the production installation graph remains blocked. No unsafe override was applied. |

The full matrix above supersedes the earlier pre-fix 116-pass development run.
The CP05 touch correction does not register candidate maps, alter CP04 scoring,
or relax a release gate.

## CP12 closure recheck — 2026-11-14

The only newly actionable technical release item—the availability of an
officially compatible Firebase/Firestore remediation—was checked without
changing dependencies. `npm audit --omit=dev --json` still reports four high
entries from installed `@grpc/grpc-js@1.9.16`; current `firebase@13.3.0`
selects Firestore `4.20.0`, which still declares `@grpc/grpc-js ~1.9.0` and
cannot use the advisory-fixed `1.13.6+` line. No safe update exists, so the
CP11 and CP12 statuses in the acceptance matrix remain **BLOCKED**. No
candidate, policy, host, production Firebase, feedback, deployment, or
CP13–CP15 scope change occurred.

## P0/P1/P2 disposition

1. **P0 — public-beta release is blocked.** Do not override the CP05
   fail-closed build or activate candidate content.
2. **P1 — CP05 original-scope authority.** The completed browser matrix does
   not clear inherited asset/data rights. Resolve the candidate replacement
   packet, `js/data.js` provenance, the six founder geography decisions, and
   independent geometry/policy review.
3. **P1 — CP11 dependency remediation.** Wait for or deliberately validate an
   upstream-compatible Firebase/Firestore gRPC fix; do not override the
   publisher's `~1.9.0` constraint merely to silence the audit.
4. **P2 — release QA.** Complete physical-device, Firefox/Safari/iOS/Android,
   screen-reader and field-performance evidence. This is not claimed by local
   browser emulation.
5. **P2 — CP12 owner operations.** Approve feedback/privacy/retention,
   zero-cost host ownership/quota response and an explicit deployment scope;
   use `CP12_FOUNDER_OPERATIONS_PACKET.md` without enabling collection or
   hosting beforehand.

The 2026-11-10 founder policy proposal establishes preferred Natural Earth and
amCharts research paths, Firebase Hosting Spark, and a minimal feedback shape.
It is explicitly preparation-only: it changes no CP04 scoring, CP05 release
gate, candidate approval state, deployment authorization, or CP13 status.

## CP13 handoff

**Engineering work may continue only if its scope is separately authorized.**
The original roadmap makes CP13 conditional on CP12 and demonstrated
zero-cost demand/feasibility; CP12 itself is still blocked. Therefore this
reconciliation does **not** authorize CP13 or public deployment.

Any future CP13 work must preserve: CP04 as sole gameplay-state owner; CP05
candidate-only and fail-closed geography gates; CP10 deterministic/idempotent
daily rewards; Firebase account isolation; offline PWA behavior; frozen source
snapshots and founder-pending content states. It must not promote the 194
country facts, the 100-record review corpus, or OpenTDB questions.

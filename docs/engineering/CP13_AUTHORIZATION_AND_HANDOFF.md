# CP13 authorization and implementation handoff

**Authorization recorded:** 2026-11-14

The founder has adopted the limited authorization in
`CP13_READINESS_AMENDMENT.md`. It authorizes development only in local and
Firebase-emulator environments. It does **not** accept CP12, authorize public
deployment, production Firebase changes, billing, candidate promotion, release
gate changes, commits, pushes, merges, or destructive repository operations.

## Original CP13 scope

The roadmap defines CP13 as **Optional Accounts and Cloud Synchronization**:
optional identity, conflict handling and recovery with security/privacy review
and predictable zero-cost operation. The approved implementation definition is
`docs/superpowers/specs/2026-11-03-firebase-ready-design.md`; its local-first
architecture, non-goals and safety constraints are authoritative for this
limited work.

## Preserved blockers

| Checkpoint | Status preserved by this authorization |
| --- | --- |
| CP05 | Candidate maps, rights, geometry and geographic-policy decisions remain blocked; public-beta build remains fail-closed. |
| CP07 | Candidate facts/content remain founder-pending and production-ineligible. |
| CP11 | The Firebase/Firestore/gRPC advisory remains unresolved; browser-bundle evidence is compensating only. Physical/AT and field-performance QA remain open. |
| CP12 | Release acceptance, privacy/feedback/operations choices, hosting, and deployment remain unapproved. |

## Existing CP13 architecture

- `src/ui/firebase-client.ts` supplies optional Firebase Auth and the private
  `players/{uid}` Firestore gateway.
- `src/shared/cloud-save.ts` and `src/shared/cloud-sync.ts` sanitize, merge,
  and locally reconcile bounded saves without minting XP.
- `firestore.rules` enforces own-UID access; the service worker caches no
  account documents or Firestore responses.
- CP04 remains the scoring/terminal-state owner and CP10 remains the
  deterministic daily-reward owner.

## CP13-A — reset-path emulator evidence (complete locally)

**Purpose:** complete the missing local evidence that password-reset requests
are handled entirely by the Auth emulator for a registered local account.

**Evidence:** `tests/emulator/auth.emulator.test.mjs` now registers a synthetic
local account, requests its password reset through the Auth emulator, and
deletes that account. `npm run test:e2e:emulator` passed four local Auth/Rules
tests and four browser cloud-sync tests using only
`mapmaster-local-acceptance`. The test did not use a real domain, recipient,
production project, or production credentials.

## CP13-B — restored-session cloud acknowledgement (complete locally)

**Requirement examined:** an authenticated browser reload must restore its
account and already-synchronized local-first save without duplicating XP, while
accurately reporting that the restored cloud state is saved.

**Initial gap:** the new emulator browser journey in
`tests/e2e/firebase-emulator-sync.spec.ts` registered a synthetic account,
saved XP, reloaded the same browser context, and restored the account identity
and XP—but remained in `syncing` for 15 seconds. The Firestore snapshot already
contained the same semantic save, so no write occurred and the coordinator
never emitted `saved`.

**Change:** `src/shared/cloud-sync.ts` now treats an incoming snapshot that
already contains the merged save as a synchronization acknowledgement. A
focused unit test proves that this path reaches `saved` without another write;
the browser journey proves reload, account restoration, cloud status and
unchanged XP against the local emulator.

**Local evidence:** `npx vitest run tests/unit/cloud-sync.test.ts` passed 8
tests. `npm run test:e2e:emulator` passed 4 Auth/Rules tests and 5 browser
cloud-sync tests against only `mapmaster-local-acceptance`. `npm run
typecheck`, `npm run lint`, `npm run format:check`, and `npm run build` also
passed; the build retained its existing legacy-script and bundle-size warnings.

## Remaining original CP13 acceptance work

No further documented local/emulator acceptance gap was identified by CP13-B.
Final CP13 acceptance remains unavailable under this authorization: the
original scope explicitly leaves live provider behaviour and physical-device
flows to Console/device QA, and its security/privacy and predictable-cost
review cannot override the unresolved CP11 advisory or CP12 operational and
release blockers. This is not authorization for production Firebase or a
public release.

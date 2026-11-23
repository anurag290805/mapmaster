# CP13 readiness amendment — founder decision packet

**Status:** proposed only; it neither authorizes CP13 nor changes any release
gate.  It is intentionally narrower than CP12 acceptance and public deployment.

## Why this amendment exists

The original roadmap makes CP13 conditional on CP12 and demonstrated
zero-cost demand/feasibility.  The current implementation contains optional
account and cloud-sync engineering, but CP12 is not accepted: CP05 replacement
rights/policy, CP07 editorial approval, CP11's upstream Firebase/Firestore/gRPC
finding and physical/AT QA, and CP12 owner/privacy/hosting choices remain open.

The founder may want narrowly scoped CP13 *development* to continue without
mistaking that work for public-beta acceptance or authorization to deploy.

## Recommended amendment

Authorize only local and Firebase-emulator CP13 engineering, with no production
project, real user, deployment, billing, candidate-content promotion, or
public-beta change.  The work must preserve these boundaries:

- CP04 remains the sole owner of scoring, XP, streak and terminal session state.
- CP05 maps remain candidate-only and `build:public-beta` remains fail-closed.
- CP07 candidate material remains editorially pending and production-ineligible.
- CP10 daily completion remains deterministic and idempotent.
- Firestore rules must retain per-account isolation; emulator tests must not
  fall back to real Firebase; private Firestore responses must not enter the
  service-worker cache.
- No user analytics, feedback collection, administrative credentials, paid
  service, hosting project or production test account may be created under this
  amendment.

## Exact approval wording

> I authorize MapMaster to continue CP13 engineering only in local and
> Firebase-emulator environments. This does not accept CP12, permit a public
> beta or deployment, approve candidate geographic/content material, alter the
> CP05 fail-closed gate, create production users or cloud resources, or incur
> charges. All CP05, CP07, CP11 and CP12 release restrictions remain in force.

## Decision consequences

| Decision | Effect on CP12 | Effect on CP13 |
| --- | --- | --- |
| Approve the wording above | None; CP12 remains blocked. | Permits the restricted engineering scope only. |
| Do not approve | None; CP12 remains blocked. | CP13 remains formally unauthorized. |

## Existing engineering evidence

- `tests/e2e/firebase-emulator-sync.spec.ts` and `tests/emulator/` cover the
  local Auth/Firestore path, account isolation, cloud synchronization and rule
  denials.
- `src/ui/firebase-client.ts`, `src/shared/cloud-save.ts` and
  `src/shared/cloud-sync.ts` hold the optional account/cloud boundary.
- `docs/engineering/CP11_QUALITY_SECURITY.md` records the unresolved dependency
  advisory and its browser-runtime limitation; this is compensating evidence,
  not a security clearance.

No change to `docs/ROADMAP.md` is appropriate until the founder explicitly
adopts this amendment.

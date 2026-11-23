# CP12 — Public beta and free hosting acceptance

**Assessment date:** 2026-11-03  
**Engineering status:** ASSESSMENT COMPLETE — ORIGINAL-SCOPE ACCEPTANCE BLOCKED  
**Public-release status:** NOT READY — CP05 gate remains fail-closed

## Authority and boundary

The original CP12 scope is defined only by the CP12 rows in
[`../ROADMAP.md`](../ROADMAP.md) and
[`../CHECKPOINT_STATUS.md`](../CHECKPOINT_STATUS.md): **release candidate,
feedback, and verified free hosting**, with **owner acceptance, license
clearance, and operational and zero-cost terms checked** before separately
authorized deployment. No standalone CP12 specification exists in `docs/`.

CP13 is separately labelled "Accounts and cloud sync" in the roadmap. Its
Firebase authentication/cloud-save implementation is therefore not evidence of
CP12 acceptance. This assessment does not authorize a deployment, change a
Firebase plan, or create a public-beta invitation.

## Requirement assessment

| Original requirement / criterion        | Verified evidence                                                                                                                                                                                                            | Status      | Remaining gate                                                                                                                                                                                                                                                                                                                                                                  |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Release candidate                       | Normal root and `/mapmaster/` artifacts can be built for owner-authorized QA. `build:public-beta` is deliberately fail-closed while blocked assets remain.                                                                   | **BLOCKED** | CP05 requires proven source/redistribution rights for the ten named SVGs and `js/data.js`, the six founder decisions, and the outstanding geography/accessibility/device/performance review. See [`CP05_WORLD_RELEASE_GATE.md`](CP05_WORLD_RELEASE_GATE.md).                                                                                                                    |
| Feedback                                | No approved feedback channel, recipient, privacy notice, consent, retention, moderation, or support workflow is specified.                                                                                                   | **BLOCKED** | Founder must approve the feedback policy and destination before any collection mechanism is implemented or enabled.                                                                                                                                                                                                                                                             |
| Verified free hosting                   | Firebase Hosting's Spark plan is a technically compatible no-billing candidate. Firebase documents 10 GB stored content and 10 GB/month data transfer; at the Spark transfer limit, a site is disabled until the next month. | **PARTIAL** | Founder must select a host, accept its quota/automatic-disable behavior and operational ownership, then separately authorize a controlled deployment. Recheck current [Firebase pricing](https://firebase.google.com/pricing) and [Hosting quotas/pricing](https://firebase.google.com/docs/hosting/usage-quotas-pricing) at that decision. No host was configured or deployed. |
| Owner acceptance                        | None recorded.                                                                                                                                                                                                               | **BLOCKED** | Explicit founder acceptance of the release candidate, feedback process, host, operations, and launch scope.                                                                                                                                                                                                                                                                     |
| License clearance                       | CP05 records unresolved source/redistribution rights for `australia`, `brazil`, `canada`, `china`, `germany`, `japan`, `spain`, `uae`, `usa`, and `world`, plus unresolved `js/data.js` provenance.                          | **BLOCKED** | Documentary clearance for the exact shipped assets and data; do not substitute a generic source-license claim.                                                                                                                                                                                                                                                                  |
| Operational and zero-cost terms checked | Spark feasibility and the current no-billing quota model were reviewed; no billing is enabled.                                                                                                                               | **PARTIAL** | A founder-approved operational plan must define quota monitoring, ownership, outage/limit response, feedback handling, and periodic current-terms review. Firebase's plan details remain subject to its current [pricing-plan terms](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans).                                                                 |

## Local verification record

The following local checks are required for this assessment and are recorded
with their observed results below after execution:

| Check                                                           | Result                                                                                 |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `node --test tests/cp05-release-gate.test.cjs`                  | **PASS** — 6/6 tests; includes the expected fail-closed `build:public-beta` assertion. |
| `npm run typecheck`                                             | **PASS**                                                                               |
| `npm run lint`                                                  | **PASS**                                                                               |
| Root production build: `npm run build`                          | **PASS** — Vite emitted its existing classic-script and >500 kB chunk advisories.      |
| Subpath production build: `npm run build -- --base /mapmaster/` | **PASS** — same non-failing advisories.                                                |

These checks cannot clear asset/data rights, select a host, establish a
feedback policy, or substitute for physical-device/field testing. CP11's
remaining Firefox, Safari, iOS, Android, screen-reader, and field-performance
QA remains manual release QA.

## Acceptance decision and next actions

**Original-scope acceptance: not granted (0% accepted; 0 of 3 CP12
deliverables accepted).** Hosting feasibility is documented, but a feasible
candidate is not a verified, founder-approved hosting operation. Engineering
documentation is complete; it does not satisfy the original public-beta gate.

Founder actions, in order:

1. Clear the exact CP05 map/data rights and resolve the six CP05 founder
   decisions.
2. Approve the feedback policy and operational owner, including privacy,
   consent, retention, moderation, and support escalation.
3. Select and accept a genuinely zero-cost hosting plan, documented quotas,
   limit/outage behavior, and monitoring/response ownership; recheck provider
   terms at that time.
4. Complete the CP11 physical-device, browser, assistive-technology, and
   field-performance release QA.
5. Give explicit owner acceptance and a separate deployment authorization.

Until then, the only permitted use remains owner-authorized local QA. Keep the
CP05 public-beta build guard in place.

## Closure recheck — 2026-11-14

The CP11 remediation check found no officially compatible Firebase/Firestore
update: current `firebase@13.3.0` still brings Firestore's `~1.9.0` gRPC
constraint, while the production-only audit continues to report four high
entries from the installed `@grpc/grpc-js@1.9.16` chain. No dependency or
configuration was changed. CP12 therefore remains **BLOCKED**; this recheck
does not authorize a public beta, deployment, or the requested CP13–CP15
new-chat handoff.

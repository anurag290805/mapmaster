# CP12 founder operations packet

**Recorded:** 2026-11-10  
**Status:** proposal and reproducible local procedure only. No hosting account,
feedback endpoint, billing change, deployment, or public-beta authorization was
created.

## Proposed founder direction — 2026-11-10

**Status: proposed, not yet authorized.** The preferred future host is Firebase
Hosting Spark, with no automatic billing upgrade. The preferred feedback design
is owner-controlled and limited to optional email, free-text report and app
version, with ordinary 90-day retention and no hidden gameplay or account-data
collection. A separate privacy notice for Firebase Authentication and
cloud-save processing is required.

This records a direction for policy preparation and validation only. It does
not create a Firebase project, configure Hosting, enable a form, choose a
recipient, publish a privacy notice, authorize deployment, or accept CP12.

## Decisions requested

| Decision | Conservative proposed default | Founder action needed |
| --- | --- | --- |
| Feedback channel | Do not collect feedback until a controlled inbox/form owner, privacy notice and support workflow exist. | Choose the recipient/owner and authorize a collection mechanism. |
| Data minimisation | Optional contact address; free-text report; local build/version; no game-state, Firebase UID, map click coordinates, cookies or analytics by default. | Approve fields and any exceptional diagnostic data. |
| Consent and notice | Show purpose, recipient, optional-contact status, prohibited sensitive-data guidance and linked notice before submit. | Approve wording and notice location. |
| Retention / moderation | Access limited to named owner(s); no automated public display; triage security reports privately; delete on a founder-approved schedule (proposed 90 days). | Set retention period, access owners and security/support escalation path. |
| Zero-cost host | Firebase Hosting Spark is a feasibility candidate only. It has quota/automatic-disable behaviour and must be rechecked at launch. | Select host, account owner, quota response and accept current provider terms. |
| Release scope | Owner-authorized private local QA only. | Give separate written acceptance and deployment authorization after CP05/CP11 gates close. |

The proposal does **not** invent an email address, privacy policy, third-party
processor, analytics service or moderation promise. Until the named owner,
notice text, recipient and support workflow are approved, the application must
not expose a feedback submission path.

## Zero-cost operations runbook (not executed)

1. Re-read current [Firebase pricing](https://firebase.google.com/pricing),
   [Hosting usage and quotas](https://firebase.google.com/docs/hosting/usage-quotas-pricing),
   and [pricing-plan terms](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans).
   Confirm Spark is sufficient, no billing account is attached, expected static
   traffic fits its limit, and the owner accepts quota-exhaustion behaviour.
2. Obtain completion evidence for the CP05 rights/policy packet, the CP11
   manual procedure below, a production-dependency audit with no unremediated
   release finding, feedback policy, host owner and deployment authorization.
   A normal build is not public-beta clearance; `build:public-beta` must stop
   failing for substantiated reasons, not because its guard was bypassed.
3. Use a new owner-controlled Firebase project on Spark. Configure only the
   authorized web origin, Authentication providers and Firestore rules. Do not
   enable Storage, Functions, paid APIs or a billing upgrade. Never place admin
   credentials or service-account keys in browser variables.
4. Build the reviewed root or `/mapmaster/` artifact. Record revision, build
   command, deployed archive SHA-256 and host/base path. Review the static
   output for candidate content before upload.
5. Run root/subpath browser suites and Firebase emulator suite before release;
   then perform real-domain authorization, reset-email, account isolation and
   service-worker warm-offline tests in `FIREBASE_SETUP.md`.
6. During a future beta, monitor only host quota/availability and the approved
   feedback inbox. Do not add undisclosed analytics or paid monitoring. On an
   outage, stop promotion and wait for founder direction rather than upgrading
   billing automatically.

## Future rollback procedure

1. Stop release promotion and preserve incident evidence without collecting
   additional player data.
2. Select the previously accepted immutable artifact by recorded hash; never
   rebuild a different artifact under the same rollback label.
3. Have the authorized host owner restore it and verify root/subpath navigation,
   offline warm start, account isolation and CP04 score behaviour.
4. Record release/rollback time, artifact hashes, operator and reason in the
   owner release log. Do not mutate player records to compensate for an outage.
5. Reopen release only after root cause, affected gate and owner approval are
   documented. There is no current deployment or artifact history, so this is
   a future procedure rather than a claimed test.

## Required human release QA

These checks are not satisfied by Chromium emulation. Record device/browser
version, URL base, network condition, result and defects.

| Environment | Procedure | Pass condition |
| --- | --- | --- |
| iOS Safari / Add to Home Screen | Install after one online visit; launch offline; return from auth redirect; rotate; use safe areas and virtual keyboard. | Shell warm-starts offline; no hidden control, focus trap, auth loop or score mutation. |
| Android Chrome | Install/use web app; offline warm start; touch maps/flags; test virtual keyboard and back navigation. | Candidate routes remain inaccessible; maps and choices are reachable and score once. |
| Desktop Firefox and Safari | Exercise root and `/mapmaster/` home, Play, settings, daily/restart and back/forward. | One active screen/timer; no console-critical error; base paths resolve. |
| VoiceOver/Safari | Navigate controls, map alternative, live status, result/review and settings without pointer. | Accessible name, focus and outcome context are announced without leaking an answer pre-resolution. |
| NVDA/Firefox and JAWS/Chrome | Repeat keyboard-only Flag Sprint, Typing, Locate alternative and Daily Challenge. | No keyboard trap; score/timer/status intelligible; only one answer earns credit. |
| Real network performance | Test representative low/mid-tier hardware and network; gather approved field RUM or controlled p75 LCP/INP/CLS method. | Owner-adopted CP11 budgets: LCP ≤2.5s p75, INP ≤200ms p75, CLS ≤0.1; no critical-journey errors. |

## Preserved safety boundaries

- Firebase local emulator tests use Auth `127.0.0.1:9099` and Firestore
  `127.0.0.1:8080`; production tests do not substitute for real-domain QA.
- Firestore remains account-private and is not service-worker cached.
- CP04 owns score, XP, streak and terminal state; CP10 remains
  deterministic/idempotent; CP05 remains candidate-only and fail-closed.
- The 194-country library, 100-record external corpus, V3 content and all
  OpenTDB material remain founder-pending and production-ineligible.

## CP12 acceptance statement

Engineering has provided a safe release procedure, but CP12 is **not accepted**:
founder policy/owner choices, CP05 rights and policy clearance, the CP11
Firebase/Firestore/gRPC audit blocker, physical/AT and field-performance
evidence, and separate deployment authorization do not exist. CP13 is not
authorized by this packet.

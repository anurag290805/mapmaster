# CP11 — Quality, Performance and Security

Status: **ENGINEERING-COMPLETE — engineering acceptance recommended; physical-device and field evidence remain release QA.**

## Scope and support policy

CP11 in `docs/ROADMAP.md` requires a browser matrix, audits, performance hardening, and accessibility review after CP04–10. The corrective authorization supplies the operational gates: LCP ≤2.5s p75, INP ≤200ms p75, CLS ≤0.1 p75, no uncaught critical-journey errors, scoring integrity, and 320px/390×844 layouts.

Supported release targets are the current and immediately previous stable releases of Chrome/Chromium (including Brave), Firefox, Safari on macOS and iOS, and Chrome on Android. Root and `/mapmaster/` are supported hosting bases. Chromium is automated; Firefox, WebKit, Safari, iOS, and Android are manual QA pending. Playwright's local installation contains no Firefox or WebKit binary, so none was downloaded merely to claim coverage.

## Corrective results

- The three CP05 development candidate failures were contention-sensitive timeouts, not a candidate activation or geographic release defect: serial Brave reproduction passed 3/3. Candidate tests remain development-only and production/subpath skips are intentional.
- CP06 exposed a genuine cold-start race: classic setup code could enable Start before the deferred gameplay bridge existed. `js/events.js` now keeps Start disabled with the existing status live region until `mapmaster:gameplay-ready`; serial Brave passed all nine choice/deadline tests in development, root, and subpath (27/27). This does not alter CP04 scoring, deadline, or terminal ownership.
- Dark-theme primary selected controls and legacy answer feedback had insufficient contrast. `css/integration.css` now uses charcoal text on the pale brand surface and dark-theme success/error tokens. Automated contrast assertions pass for primary, correct, and wrong states.
- The CP11 mobile checks cover actual 390×844 touch start, 320px with simulated 200% text scaling/no horizontal overflow and keyboard activation, 44px controls, visible focus, and the existing reduced-motion/live-region/color-text behavior. They do not constitute complete WCAG conformance.
- No CP05 candidate route, asset eligibility, provenance rule, or public-beta gate changed. `build:public-beta` remains fail-closed for `australia.svg`, `brazil.svg`, `canada.svg`, `china.svg`, `germany.svg`, `japan.svg`, `spain.svg`, `uae.svg`, `usa.svg`, and `world.svg`.

## Performance procedure and evidence

`tests/e2e/cp11-performance.spec.ts` records buffered LCP, layout shift, optional Event Timing, DOM-content-loaded time, game-start latency, and uncaught page errors while traversing Play → Typing → World → Practice. It is a repeatable local-lab procedure, deliberately not field telemetry or p75 evidence. Run it serially with Brave and four repeats:

`MAPMASTER_BROWSER_PATH="/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" ./node_modules/.bin/playwright test tests/e2e/cp11-performance.spec.ts --project=production --workers=1 --repeat-each=4`

On 2026-11-03, root production lab samples were: LCP 400/248/256/264ms; game start 103.7/90.3/124.2/128.4ms; CLS 0 in all four; DOMContentLoaded 356.8/197.7/199.7/210.5ms; Event Timing 104ms, unavailable, unavailable, 168ms; zero uncaught errors. This supports local regression detection and the CLS gate, but **does not establish LCP or INP field p75**. The existing serial map-readiness probe measured 387.9/379.9/115.6/380.0ms for India/world switching; variance was retained rather than optimized without user-impact evidence.

## Verification record

| Check | Result |
|---|---|
| Final static/unit/lifecycle/root build (`npm run check`) | 82 passed, 0 failed, 0 skipped (64 legacy + 18 unit); typecheck, lint, format and root build passed |
| Final serial Brave regression (CP05 candidate, CP06 choices/deadlines, CP11 quality/performance; development/root/subpath) | 42 passed, 0 failed, 6 expected skips; skips are the three intentional CP05 development-only tests in each production target |
| Focused local performance repeats | 4 passed, 0 failed, 0 skipped |
| Focused map-readiness probe | 1 passed, 0 failed, 0 skipped |
| Subpath build (`npm run build -- --base /mapmaster/`) | passed |
| Fresh `npm audit --omit=dev --json` (2026-11-10) | **4 high findings; release blocker recorded below** |
| `npm run build:public-beta` | expected failure; CP05 gate retained |

## Dependency advisory disposition

The earlier zero-production finding is superseded. The fresh production-only
audit reports **four high-severity package entries**, but they are propagation
of one high finding through one installed chain, not four independent high
vulnerabilities:

| Advisory | Severity | Installed affected package | Consequence in `npm audit` |
| --- | --- | --- | --- |
| [GHSA-m9gg-hp2v-232j / CVE-2026-101916](https://github.com/advisories/GHSA-m9gg-hp2v-232j) | High, CVSS 7.4 | `@grpc/grpc-js@1.9.16`, affected `<1.13.6` | Direct root; propagates to `@firebase/firestore`, `@firebase/firestore-compat`, and `firebase`, which are the four high entries. |
| [GHSA-f596-whhp-79r4 / CVE-2026-101915](https://github.com/advisories/GHSA-f596-whhp-79r4) | Low, CVSS 3.7 | Same `@grpc/grpc-js@1.9.16` | A distinct low server-error disclosure finding; it does not add another high package entry. |

The installed path is `firebase@12.19.0` →
`@firebase/firestore@4.17.2` (also deduped for
`@firebase/firestore-compat@0.4.14`) → `@grpc/grpc-js@1.9.16`. Firestore's
declared `~1.9.0` range selects that final 1.9-line release.

Runtime evidence is narrower than the lockfile finding, but not dismissal:
MapMaster imports `firebase/firestore`; the Firestore package export map selects
`dist/index.esm.js` for browsers, while its Node entry
`dist/index.node.cjs.js` explicitly requires `@grpc/grpc-js` and
`@grpc/proto-loader`. The browser entry does not import that Node module and
the production bundle has no `@grpc/grpc-js` import/require; it uses the
browser WebChannel transport. The advisories concern gRPC server-side
certificate/auth-context handling and server error forwarding respectively,
which MapMaster does not configure. This is compensating evidence, not a clean
audit result: the vulnerable Node dependency remains in the production
installation graph.

The Firebase team's open
[issue #10400](https://github.com/firebase/firebase-js-sdk/issues/10400)
documents this exact restrictive range and its web-only runtime distinction.
As checked on 2026-11-13, current `firebase@13.3.0` still selects
`@firebase/firestore@4.20.0`, which still declares `@grpc/grpc-js ~1.9.0`.
`npm audit` suggests `firebase@9.14.0`; that is a downgrade to
`@firebase/firestore@3.7.3`, is a major architectural regression, and is
within the advisory's affected Firebase range. It is not a remediation.

A lockfile override to `1.13.6+` would violate Firestore's upstream tilde
range and can leave the original nested copy installed; no dependency was
changed merely to make the audit pass. This is an upstream
security/compatibility blocker: obtain a Firebase/Firestore release that
declares a fixed compatible gRPC range, then update in a separately reviewed
change and rerun the emulator, account-isolation, build and browser matrix.

### Remediation recheck — 2026-11-14

The production-only audit was rerun without changing dependencies and still
reports four high entries, all propagated from the installed
`@grpc/grpc-js@1.9.16` chain. The current published `firebase@13.3.0` selects
`@firebase/firestore@4.20.0`; its published dependency remains
`@grpc/grpc-js ~1.9.0`, so it cannot select the advisory's fixed `1.13.6+`
line. `npm audit` continues to suggest the incompatible major downgrade to
`firebase@9.14.0`. No officially compatible remediation is available from
this check, and no package, lockfile override, production configuration, or
release gate was changed. Recheck only when Firebase/Firestore publishes a
version whose declared range permits the fixed gRPC release.

## Remaining manual QA and release blockers

- Field RUM or controlled real-device/network p75 LCP and INP measurements are still needed before asserting the performance budgets.
- Test physical Safari/iOS and Android Chrome, including virtual keyboards, safe areas, service-worker offline warm start, and root/subpath navigation; Firefox needs desktop smoke coverage.
- Screen-reader QA remains: VoiceOver/Safari, NVDA/Firefox, and JAWS/Chrome; include the pre-existing Locate map alternative and Flag Sprint cue limitations, calendar narration, focus restoration, and dynamic status announcements.
- The fresh production dependency audit has four high Firebase/Firestore/gRPC
  findings. Do not declare CP11 or a public release security-clean until an
  upstream-compatible remediation is available and verified.
- This is not a full WCAG conformance claim. CP05 unresolved redistribution rights above continue to block public release independently of CP11.

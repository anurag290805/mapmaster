# MapMaster player-audit remediation report

**Date:** 2026-11-15  
**Scope:** remediation of the ten findings in `MAPMASTER_FULL_PLAYER_AUDIT.md` only.  
**Environment:** local Vite/Playwright browser checks; local-only Firebase Auth and Firestore emulators where configured. No deployment, production Firebase operation, email delivery, commit, or push was performed.

## Verdict

All ten documented findings are **PASS** for the implemented local/browser acceptance surface. The CP05 release gate, score rules, timers, deterministic Daily question generation, local-first progression, Firebase rules, and cloud-save merge behavior were not relaxed or bypassed.

## Finding-by-finding results

| Finding | Before evidence | Remediation and after evidence | Verdict |
| --- | --- | --- | --- |
| H-01 Locate target invisible | [Locate screenshot](evidence/locate-desktop.png) shows only `Target` over the light map. | The Locate name now uses charcoal ink when it is inside the light map panel. Browser coverage starts a real World Locate session, checks the rendered color, and completes a selection. | **PASS** |
| H-02 Account dialog layering | [Account screenshot](evidence/account-unconfigured-desktop.png) shows the hero globe/art crossing the modal. | Open dialogs now use an opaque, isolated top-layer surface. Browser coverage verifies the dialog’s top-layer hit testing, opaque background, and isolation; mobile dialog flow was also exercised. | **PASS** |
| H-03 Stale Sprint/Daily feedback and slow handoff | [Sprint screenshot](evidence/stale-choice-feedback-desktop.png) shows `✓ Astana` and the Kazakhstan cue while Mexico is already the prompt. | A correct Sprint answer updates score/streak then immediately replaces the task, clears feedback and cue text, and defers optional sound. This removes the throttled timeout path and prevents old content being associated with the next prompt. Regression coverage verifies prompt replacement in under 500ms from the input event, empty feedback, hidden/cleared cue, reduced-motion behavior, and exact-once scoring. | **PASS** |
| H-04 Locate not keyboard-operable | Audit traversal reached the unnamed map object but no answer control. | Locate now supplies a labelled native select plus `Check map answer` control synchronized to the eligible map pool. It works with Tab, keyboard selection, Enter, screen-reader label, and mobile native controls; mouse/SVG selection remains intact. | **PASS** |
| M-01 Daily identity always says medium | Audit showed `:medium` for Easy and Hard routes. | The selected route is now a single displayed state: focus/selection updates `data-selected`, `aria-pressed`, and the deterministic identity before launch. | **PASS** |
| M-02 Unconfigured Firebase silently accepts input | Audit found editable controls with no visible recovery. | When no Firebase client is configured, the account dialog states that accounts are unavailable, keeps guest play available, and disables credential, Google, reset, and registration controls. Configured emulator accounts remain tested separately. | **PASS** |
| M-03 Dense duplicate gameplay chrome | [Locate screenshot](evidence/locate-desktop.png) shows the full site header plus a second game header and large HUD. | Active games enter an in-session shell: global navigation is removed while the compact game header retains sound, theme, and restart. HUD cards have reduced height/padding, putting the task higher in the viewport. The normal header returns on result/exit. | **PASS** |
| M-04 Bright/inconsistent Sprint controls | [Flag Sprint screenshot](evidence/flagChoice-desktop.png) showed light answer buttons in the charcoal game. | Choice controls now have one charcoal treatment with cobalt/lime hover/focus and existing distinct correct/wrong states. Desktop and mobile tests verify they remain dark even when focused. | **PASS** |
| L-01 First-session progression bridge | Audit empty state only said to complete a game. | Empty Progress now names a short, truthful recommendation—Daily Easy, five capital questions—and provides a `Try Daily Easy` route. This neither grants XP nor changes duplicate/reward rules. | **PASS** |
| L-02 Daily calendar orientation | Audit found day state visible but selected/current relationship unclear. | The calendar now has a textual current-day/route explanation, `aria-current="date"`, and a fuller accessible label for today; future dates remain disabled and labelled as locked. | **PASS** |

## Implementation notes

- Added `tests/e2e/audit-remediation.spec.ts` with eleven desktop/mobile/reduced-motion browser checks spanning all audit findings plus a local console/request smoke check.
- Updated the related CP07 Flag Sprint assertions to the intentional H-03 contract: correct answers still score exactly once, but answer/learning feedback never persists into a subsequent question.
- Account availability is represented as UI state, so configured local emulators keep the full sign-in/register/reset surface while unconfigured local builds are honestly guest-only.
- The Locate alternative is an equivalent answer path, not a map-data or scoring change. It is populated only from the existing eligible Locate pool.

## Verification performed

| Command / check | Actual result |
| --- | --- |
| Focused `audit-remediation.spec.ts` browser coverage with all Firebase variables blank | **11 passed across focused runs:** the ten finding checks plus a final local console/request smoke check. Covered desktop, 390px mobile, keyboard selection, compact game shell, unavailable-account state, reduced motion, and local console/request failures. |
| Focused CP07/Flag Sprint checks | **3 passed:** no stale candidate feedback, Bosnia scores exactly once by keyboard, and Flag Sprint clears answer feedback before next prompt. |
| Focused existing CP04/CP09/CP10/account checks | **4 passed:** legacy Locate mouse path, account guest shell, reduced-motion screen navigation, and Daily keyboard/calendar path. |
| `npm run test:e2e:emulator` | **Passed, exit 0:** 4 Auth/Firestore emulator unit tests and 5 browser cloud-sync tests. This covered guest migration, restoration, offline reconnect without duplicate XP, quiescent writes, and cross-account isolation. Expected local Firestore `PERMISSION_DENIED` logs occurred during rules-rejection assertions. |
| `npm run lint` | Passed. |
| `npm run format:check` | Passed. |
| `npm run typecheck` | Passed. |
| `npm run build` | Passed. Vite retained its existing warnings that classic scripts cannot be bundled and that one generated chunk exceeds 500 kB. |
| `git diff --check` | Passed. |

## Remaining limitations / explicitly untested

- This is not production Firebase acceptance: no production project, real email, Google account, or public deployment was used.
- No human screen-reader session, physical touch device, service-worker reinstall cycle, or long full-world session was performed in this remediation pass.
- The pre-existing CP05 geographic/release gates and their content decisions remain unchanged and unaccepted by this work.
- The build-size warning is pre-existing and not part of these ten audit findings.

## Final assessment

**Remediation status: PASS (10/10).** The original player-blocking and polish findings are addressed with regression coverage, while game integrity, guest play, local-first storage, account isolation, and CP05 safeguards remain in place.

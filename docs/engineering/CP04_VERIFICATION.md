# CP04 implementation verification — 2026-10-31

Branch `anurag/mapmaster-cp04-core-gameplay`, based on `2908da04979aac084ecf4f9bbb85511d3aafe1db`; changes are uncommitted. No CP05/06 implementation or deployment is included.

The only mutable gameplay session remains `gameState` in `js/state.js`. `src/shared/gameplay.ts` supplies stateless normalization, canonical-name resolution, a small explicit alias list, deadline calculation and accuracy calculation through the Vite module bridge. Classic scripts remain ordered and are copied by the existing build. The bridge is initialized asynchronously; starting before it is ready is refused with a message. Gameplay transitions still reside in the legacy handlers and are not a fully migrated TypeScript session engine.

I-01 and I-13 regression tests were run before the fixes: the partial answer scored twice, and the flag and capital cases both ended the game. All three subsequently passed. A separate review-color regression was also observed failing before its callback guard and passing after it.

Final `npm run check`: exit 0; 19 Node tests and 3 Vitest tests passed, none skipped; typecheck, lint, formatting check and build passed. Final `MAPMASTER_BROWSER_PATH="/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" npm run test:e2e`: 60 passed, 0 failed, 0 skipped across development, production and production-subpath. The sandbox initially denied the loopback listener; the browser runs used approved local-server access. Vite reports its expected warnings about classic scripts.

Earlier browser runs are material evidence: one 39-case run had 38 passes and an onboarding/settings timeout; a 48-case run had 46 passes and two locate tests that attempted interaction before world-map readiness; after adding an explicit world-document/target readiness assertion, a 48-case run passed. A 54-case run had 52 passes: the development smoke test saw India geometry instead of world geometry, and a deadline test raced the timer before its click; the latter was made deterministic. A subsequent 54-case run passed. A later 60-case run had 59 passes and one production smoke failure with India geometry instead of world geometry. The final 60-case run passed. These intermittent SVG observations do not establish the cause or resolution of I-15.

Remaining limits: I-02, I-12, I-14 and I-15 are CP05 map work; partial flag/capital coverage and source/alias policy remain CP07. The flag's accessible name no longer reveals the answer, but an equivalent nonvisual identification interaction is not established. The tests do not exhaustively cover all map scopes, all terminal/race permutations, every delayed UI callback, screen readers or physical touch. Results and modes still depend on shared legacy globals, and broader session-rule extraction remains incremental. No claim of complete accessibility, geography accuracy or production readiness is made.

## Verification-hardening pass

The results above describe the initial implementation pass. The following evidence supersedes its final-run counts; earlier failures remain part of the record.

### Deadline and terminal policy

Challenge input and hint handlers check the monotonic clock before applying an action. **At `now >= deadline`, time expiry wins**, including over a correct final answer, a wrong answer or a last-life click. If an action is accepted before the deadline and ends the game, that result wins over a later timer callback. A hint that reduces the deadline to the current time ends the game immediately. `endGame` accepts a terminal transition only while the session is active.

`tests/cp04-lifecycle.test.cjs` executes the production mode and lifecycle functions with a controlled clock and tiny two-question fixtures. It checks both sides of the deadline, simultaneous last-life loss, duplicate submissions, repeated end calls, post-end score/attempt/streak/bonus/time/target/result stability, and hint expiry. It also checks start → exit → restart, old interval callbacks, old feedback and result animations, a retained old map callback, and repeated locate setup. All four modes complete a two-question practice session in the fixture; each times out in challenge, and locate also loses its final life.

The retained old-map callback test initially failed: after a new locate session began, the callback could deduct a life from it. The fix binds the listener to both session ID and map document and removes the actual bound listener when leaving gameplay. The same test passes after the change. This is a CP04 lifecycle fix, not a change to map geometry or loading.

### Acceptance matrix

| Requirement | Evidence | Status / limit |
|---|---|---|
| I-01 canonical answers and duplicate prevention | Red/green regressions; exact, alias and ambiguity unit tests; browser typing flow | Pass for covered cases; geography aliases remain a curated subset. |
| I-13 lives | Red/green flag and capital regressions; browser wrong-answer challenges; deterministic last-life locate test | Pass for configured rules. |
| Deadline, terminal and stale-session behavior | Controlled lifecycle suite; browser expiry, hint, restart and review flows | Pass for specified scenarios. Same-deadline policy is defined above. |
| Four modes end to end | Two-question deterministic completions in all modes; one-question real-browser completions; flag/capital correct-answer flows | Pass for the fixtures. The locate browser test dispatches an SVG DOM click; it does not establish physical hit-testing for every geometry. |
| Review and focus | Browser checks game, result, restart and review focus; review banner and state cleanup | Pass for tested paths; not a complete accessibility audit. |
| Flag accessible name and keyboard | Browser accessible-name assertions and Enter submission through completion | Pass for answer disclosure and tested keyboard paths. A nonvisual flag-identification equivalent is not established. |
| Mobile/touch | 390×844 touch-emulated gameplay submission after keyboard setup; baseline/CP04 setup-click comparison below | Gameplay tap passed; setup pointer activation remains an inherited CP11 issue. No physical-device claim. |
| Classic-script and build compatibility | Existing ordered-script smoke checks and all three browser projects | Pass for tested development, preview and subpath flows. |
| Map/data coverage | Prior audit and comparison below | I-02/I-12/I-14/I-15 remain CP05; data coverage, aliases and sourcing remain CP07. |

### Map and touch comparison

The CP03 verification at the starting commit records world geometry persisting after selecting Japan, including a correct object `data` attribute and no corresponding SVG request. The current `applyMap` assignment is unchanged from that commit; `js/events.js`, `js/data.js` and Vite's copy logic have no CP04 diff. This is strong evidence that I-15 is inherited, although CP04 timing effects cannot be ruled out and the root cause is not established.

A local Brave probe served the current unchanged setup markup and CSS, alternately intercepting the nine classic scripts with their exact `git show 2908da04979aac084ecf4f9bbb85511d3aafe1db` contents or using the CP04 scripts. In five fresh contexts per version, each run requested `svg/world.svg` and displayed the world document after 1.5 seconds: baseline 5/5, CP04 5/5. This limited non-reproduction does not negate prior failures. The repeatable probe is `tools/cp04-map-probe.cjs`; run a local Vite server on port 4188, then set `MAPMASTER_BROWSER_PATH` and run `node tools/cp04-map-probe.cjs`. Its baseline comparison uses baseline scripts with the current setup HTML; it is not a separate baseline build.

In separate 390×844 touch-emulated comparisons, the setup Start click timed out with interception in 3/3 baseline-script contexts and 3/3 CP04 contexts. Setup markup and CSS are unchanged. A test using keyboard activation to enter the game then successfully tapped Submit. This does not establish usable touch-only setup. CP11 should investigate setup layout, pointer hit targets, physical devices and assistive technology.

CP05 acceptance must include reproducible same-origin load/error handling, correctly matched requested and displayed SVG documents through rapid scope changes and restart/navigation, stale load/event isolation, and validated clickable geometry and accessible alternatives across supported scopes. The observed cause of I-15 remains unconfirmed.

### Final hardening checks

- Targeted deterministic lifecycle suite: **15 passed, 0 failed, 0 skipped**. The initial stale-listener regression failed before the fix and passed afterward.
- Targeted development browser verification after adapting the touch test to enter by keyboard: **6 passed, 0 failed, 0 skipped**. The prior touch-only setup attempt failed as documented above.
- Final `npm run check`: **34 Node tests and 3 Vitest tests passed; 0 failed, 0 skipped**; typecheck, lint, formatting check and build passed. Vite's classic-script warnings remain expected.
- Final `MAPMASTER_BROWSER_PATH="/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" npm run test:e2e`: **78 passed, 0 failed, 0 skipped**, across development, production preview and `/mapmaster/` subpath. The server used authorized local loopback access; external HTTPS was aborted in the tests.
- `git diff --check`: run as the final workspace check. No dependencies or paid services were added. No commit or deployment was made.

These results support **development acceptance of CP04 only**, subject to independent review and explicit acceptance of the inherited CP05/CP07/CP11 limitations above. They do not establish complete geographic accuracy, map reachability, screen-reader compliance, physical touch support or production readiness.

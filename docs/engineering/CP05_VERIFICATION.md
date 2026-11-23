# CP05 verification — work in progress

This report is preliminary; CP05 acceptance is rejected pending the remaining implementation and verification.

- Starting branch `anurag/mapmaster-cp04-core-gameplay`, clean tree, HEAD `da45962a7ea684e41bb4299bfa0d04863a4cb1fb`; checkpoint branch `anurag/mapmaster-cp05-world-map` created at that commit.
- `node --test tests/cp05-map-assets.test.cjs`: failed before the fix on the missing North America path; passed after it (1 test). It verifies file presence and three representative path IDs per asset, not browser behavior or complete geographic coverage.
- `node tools/audit-data.cjs`: before the change reported two missing configured map files and exited 1; afterward reported zero missing files and exited 0. This audit does not validate interactive targets.
- Initial `npm run check` at baseline passed 34 Node and 3 Vitest tests. A subsequent run after the filename change passed 35 Node and 3 Vitest tests, typecheck, lint, formatting and build. The later copy-only help text edits were not included in that run.
- The initial Playwright invocation failed before tests because sandbox policy denied binding 127.0.0.1; a permitted rerun is recorded separately in the final report.
- The permitted Playwright run reproduced the I-15 symptom in the development world typing smoke test: expected `/svg/world.svg`, received `/svg/india.svg` after five seconds. Its cause remains unconfirmed. I-15 and map-side I-12 remain unresolved. No CP05 race, touch, keyboard, physical device or performance acceptance evidence is established. Existing SVG rights and attribution remain public-launch blockers; see `docs/audit/ASSET_PROVENANCE.md`.

## Browser results

- `MAPMASTER_BROWSER_PATH="/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" npm run test:e2e`: 77 passed, 1 failed, 0 skipped. The development world typing smoke test received India geometry instead of world; the production and subpath counterparts passed. This reproduces the symptom, not its cause.
- `MAPMASTER_BROWSER_PATH="/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" npm run test:e2e -- tests/e2e/cp05-map-assets.spec.ts`: the initial probe, with the game screen hidden, failed 6 of 6. After changing the probe to display the game screen, 5 passed and 1 failed: development North America did not show the requested document and representative geometry within five seconds. Both regions passed in production and subpath, and South America passed in development. These calls invoke map selection directly, not a complete user flow. This is not evidence of reliable regional gameplay.
- No physical-device testing or performance measurements were performed. The test suite's touch emulation is not physical-device evidence.
- Final `npm run check` after the added browser test and help text edits: exit 0; 35 Node tests and 3 Vitest tests passed, none failed or skipped; typecheck, lint, format check and build passed.
- `git diff --check`: passed. The changes remain uncommitted.

## Corrective pass

- A controlled test held the initial India request until after World was selected. It passed against the original object lifecycle in development, so it did not reproduce the earlier intermittent symptom. The original root cause remains unconfirmed.
- After the ownership change, the full 90-test browser run passed in development, preview and subpath before the later target-pool changes. During that run the rapid India → World → India → World and delayed-India tests passed in all three environments. An earlier version of the delayed-request test timed out in the two production environments because it intercepted only `svg/india.svg`, while Vite rewrote the initial asset to a hashed URL; that test harness was corrected and the failures retained here.
- After the pool changes, the targeted map-asset, coverage and race run passed 15 of 15. Asia's unavailable names were reported and excluded in the three environments.
- The regional gameplay probe passed 6 of 6: a real Playwright mouse click on the United States in North America and Brazil in South America scored in each environment. The test sets the prompted target directly so it tests map hit handling and scoring, not a complete randomly selected game. It is not physical-device or small-country evidence.
- `python3 tools/audit-map-labels.py` reports ten unmatched configured names under current aliases and duplicate XML IDs in multiple country maps. It is an inventory, not proof of geographic identity or hit-test reachability. No assumption of missing geometry should be made solely from a label mismatch.
- Final full `MAPMASTER_BROWSER_PATH="/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" npm run test:e2e`: 99 passed, 0 failed, 0 skipped after the eligibility changes. This run preceded addition of the separate performance probe.
- The separate `tests/e2e/cp05-performance.spec.ts` probe passed 3 of 3. With the game screen visible, it recorded elapsed time from `applyMap` until Playwright observed `svgLoaded` and the expected document URL, for India → World → India → World respectively: development 333.9, 257.2, 120.6, 135.0 ms; preview 222.2, 977.2, 133.7, 389.1 ms; subpath 227.2, 1054.2, 137.6, 411.8 ms. These single local samples include polling and contention from three concurrent workers; they are not benchmarks, parse-time attribution, frame-rate, memory or physical-device measurements.
- Uncompressed checked-in SVG sizes: India 208,400 bytes; World 1,236,503 bytes; North America 314,607 bytes; South America 101,388 bytes. No resource-retention, zoom responsiveness, production-network or memory measurement was made.
- Final complete rerun with the performance probe included: `MAPMASTER_BROWSER_PATH="/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" npm run test:e2e` passed 102, failed 0, skipped 0 across development, preview and subpath. `npm run check` passed 36 Node tests, 3 Vitest tests, typecheck, lint, formatting and build. These results do not resolve the documented acceptance gaps.

## Final-pass inventory and rerun (2026-10-31)

- `python3 tools/inventory-map-geometry.py` produced the machine-readable `CP05_MAP_INVENTORY.json`: 32 configured assets, 1,347 paths, zero paths without IDs, and 575 repeated IDs. Every repeated ID is a path/circle pair in one of 16 country assets. The inventory does not verify geometry, entity identity, membership, absent countries, or license. A separate XML parse independently checked all 32 asset hashes and path counts against the generated report.
- `python3 tools/audit-map-labels.py` listed ten configured names without label matches. These are not confirmed missing geometries. There is no validated canonical target registry; all identity associations are unverified, although the current runtime still allows label-matched targets. I-12 remains open.
- `node tools/audit-data.cjs`: exit 0, no missing configured map files. This is not a geographic correctness test.
- `npm run check`: exit 0; 36 Node tests and 3 Vitest tests passed, no failures or skips; typecheck, lint, formatting and build passed. This includes the retained CP04 lifecycle tests, but does not demonstrate that every CP04 behavior has been exhaustively validated.
- Full Brave Playwright matrix: initial sandboxed attempt failed before tests because local server bind to 127.0.0.1:4174 returned EPERM; the permitted rerun passed 102, failed 0, skipped 0 in development, production preview and `/mapmaster/`. Existing mouse tests cover two regional targets; touch-emulated CP04 submission is not evidence of touch on SVG geometry. The delayed-request test passed with the earlier implementation and thus does not demonstrate a necessary stale-load guard. Historical I-15 cause remains unproven.
- The same single-sample readiness probe recorded India → World → India → World in milliseconds: development 1007.7, 926.6, 405.2, 859.0; preview 521.9, 386.8, 130.9, 905.5; subpath 230.3, 1116.0, 125.2, 889.3. These are local polling observations under four-worker contention, not frame-rate, memory, network or physical-device measurements.
- `git diff --check`: exit 0. Branch `anurag/mapmaster-cp05-world-map`, HEAD `da45962a7ea684e41bb4299bfa0d04863a4cb1fb`; working tree remains dirty and contains both the existing CP05 work and this inventory/report. No commit, push, merge, reset, rebase or deployment was performed.
- CP05 acceptance is **not justified**. Geographic validation and licensing are unresolved; required accessible locate selection, viewport controls, actual touch interaction, stronger deterministic race evidence, broader performance and cleanup measurements, and physical-device CP11 checks remain outstanding.

## Geographic foundation recovery (2026-10-31)

- Recovery decision and reproducible source evidence: `CP05_GEOGRAPHIC_RECOVERY.md`; requirements and per-question source candidates: `CP05_GEO_REQUIREMENTS.json` and `CP05_GEO_FEASIBILITY.json`. The snapshot has 32 scopes, 1,174 configured questions and eight India bonus entries. **Zero** canonical entity identities or source associations have been approved; no replacement geometry is integrated. The direct-migration gate failed on unresolved identity/policy, mismatched French/Italian administrative levels, name ambiguity, source topology and small-target reachability. User-visible coverage has not been intentionally reduced by this pass.
- Seven Natural Earth 5.1.1 source archives and pinned geoBoundaries India ADM1 simplified geometry were inspected offline. Their exact hashes, counts, duplicate source-ID and topology results are in the feasibility JSON. On the selected 10m sources, Egypt and Goiás each have a Shapely ring self-intersection. The 110m country layer has no normalized-name candidate for 29 of the 194 world questions. Name matches are discovery candidates, not verified coverage or proof of source correctness. India gbOpen metadata reports 2011 while its names include post-2011 entities; provenance/date reconciliation remains necessary.
- `node --test tests/cp05-geography-recovery.test.cjs`: 3 passed, 0 failed, 0 skipped. The first run occurred while an earlier feasibility JSON was still present and failed one assertion about its outdated status field; after the generator finished, the tests passed. The checks cover snapshot drift, non-promotion of candidate names and known source ambiguities; they do not validate geography.
- `node tools/audit-data.cjs`: exit 0; no missing configured SVG files. I-02's prior Americas filename mismatch remains corrected and the browser tests exercised both maps; this does not establish geographic correctness. I-12 remains open: current runtime eligibility still uses labels, despite excluding the previously unmatched Asia names. I-15 historical root cause remains unproven, and existing race tests do not yet fail without the relevant guard. No further lifecycle implementation was made in this recovery pass.
- `npm run check`: exit 0 after adding the tests; 39 Node tests and 3 Vitest tests passed, no failures or skips, with typecheck, lint, format check and build passing. CP04 tests are retained and included.
- `MAPMASTER_BROWSER_PATH="/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" npm run test:e2e`: exit 0 with local-server permissions; 102 passed, 0 failed, 0 skipped across development, preview and `/mapmaster/`. Existing regional tests exercise mouse clicks on two targets; touch-emulated CP04 submission is not proof of touch on map geometry. No screen-reader or physical-device evidence was added.
- Single local readiness samples in milliseconds, India → World → India → World: development 469.2, 544.3, 171.0, 590.9; preview 211.5, 540.1, 147.2, 980.4; subpath 278.4, 392.6, 404.1, 909.0. These include polling and four-worker contention and do not measure frame rate, memory retention, network transfer or device performance. No new viewport controls or cleanup measurements were implemented.
- `git diff --check`: exit 0. Branch `anurag/mapmaster-cp05-world-map`, HEAD `da45962a7ea684e41bb4299bfa0d04863a4cb1fb`; original CP05 changes and recovery artifacts remain uncommitted. No commit, push, merge, reset, rebase or deployment was performed.
- CP05 remains **not accepted**. Geographic mapping and legacy asset licensing, accessible locate alternatives, bounded viewport controls, deterministic stale-event protection evidence, actual SVG touch testing, small-target fairness, performance/cleanup, and CP11 device/accessibility verification remain outstanding.

### Working-tree status after recovery

```text
## anurag/mapmaster-cp05-world-map
 M css/game.css
 M docs/audit/ASSET_PROVENANCE.md
 M index.html
 M js/data.js
 M js/events.js
 M js/game.js
 M js/modes.js
 M js/navigation.js
 M js/ui.js
 M tests/cp04-lifecycle.test.cjs
?? docs/engineering/CP05_GEOGRAPHIC_RECOVERY.md
?? docs/engineering/CP05_GEO_FEASIBILITY.json
?? docs/engineering/CP05_GEO_REQUIREMENTS.json
?? docs/engineering/CP05_IMPLEMENTATION.md
?? docs/engineering/CP05_MAP_INVENTORY.json
?? docs/engineering/CP05_VERIFICATION.md
?? docs/superpowers/
?? tests/cp05-geography-recovery.test.cjs
?? tests/cp05-map-assets.test.cjs
?? tests/cp05-targets.test.cjs
?? tests/e2e/cp05-map-assets.spec.ts
?? tests/e2e/cp05-performance.spec.ts
?? tests/e2e/cp05-race.spec.ts
?? tests/e2e/cp05-regional-play.spec.ts
?? tools/audit-geography-candidates.py
?? tools/audit-map-labels.py
?? tools/inventory-geography-requirements.cjs
?? tools/inventory-map-geometry.py

```

## Controlled geographic reconciliation (2026-10-31)

- `CP05_GEO_REGISTRY.json` version 0.1.0 is a reconciliation ledger only and explicitly disallows gameplay approval. It preserves 1,174 configured question occurrences and eight India bonuses in 989 records: 196 country-code groups, 36 provisional India source pairs and 757 unresolved subdivision/special-region question records. Exact distinct geographic entity count is not established for the unresolved records. Ledger statuses: 0 verified, 167 reconciled, 764 ambiguous, 0 missing, 58 policy-dependent. Reconciled denotes identifier and automated cross-scale evidence, not independently verified geography or playable coverage.
- World: 165 reconciled, 22 policy-dependent and seven ambiguous out of 194 configured questions. The seven low cross-scale overlap cases were inspected for polygon counts and bounds, including Maldives 2/176 pieces and disjoint 50m/10m Vatican polygons. A pilot was not implemented; source geometry, small-target reachability and boundary policy are unresolved. The rest of the scope and source-identifier evidence is in `CP05_GEOGRAPHIC_RECONCILIATION.md` and the registry.
- Targeted tests: `node --test tests/cp05-registry.test.cjs tests/cp05-geography-recovery.test.cjs` passed 6, failed 0, skipped 0. `node tools/validate-geo-registry.cjs` reported 989 records and 1,182 occurrences with no structural errors. A test for a mismatched canonical country ID failed before the validator was strengthened, then passed afterward. These tests do not establish geographic truth.
- `node tools/audit-data.cjs`: exit 0; no missing configured SVG files. `npm run check`: exit 0; 42 Node tests and 3 Vitest tests passed, none failed or skipped; typecheck, lint, formatting and build passed. CP04 tests remain included.
- Full Brave Playwright matrix: 102 passed, 0 failed, 0 skipped across development, preview and `/mapmaster/`. It exercised the existing application, not a replacement-map pilot. Existing I-02 path corrections remain exercised; I-12 label-only eligibility and I-15's unproven historical cause/insufficient guard-removal test remain open. No new keyboard geographic selection, viewport control, actual map touch, cleanup or physical-device evidence was added.
- Single visible-map readiness observations in milliseconds for India → World → India → World: development 253.7, 365.8, 391.4, 243.3; preview 293.3, 387.9, 132.5, 432.5; subpath 195.3, 909.8, 135.9, 439.2. They include polling and concurrent-worker contention and do not measure full rendering responsiveness, memory, production network or physical devices.
- `git diff --check`: exit 0. Branch `anurag/mapmaster-cp05-world-map`, HEAD `da45962a7ea684e41bb4299bfa0d04863a4cb1fb`. CP05 remains unaccepted and all prior and current work remains uncommitted; no commit, push, merge, reset, rebase or deployment was performed.

### Working-tree status after reconciliation

```text
## anurag/mapmaster-cp05-world-map
 M css/game.css
 M docs/audit/ASSET_PROVENANCE.md
 M index.html
 M js/data.js
 M js/events.js
 M js/game.js
 M js/modes.js
 M js/navigation.js
 M js/ui.js
 M tests/cp04-lifecycle.test.cjs
?? docs/engineering/CP05_GEOGRAPHIC_RECONCILIATION.md
?? docs/engineering/CP05_GEOGRAPHIC_RECOVERY.md
?? docs/engineering/CP05_GEO_FEASIBILITY.json
?? docs/engineering/CP05_GEO_REGISTRY.json
?? docs/engineering/CP05_GEO_REQUIREMENTS.json
?? docs/engineering/CP05_IMPLEMENTATION.md
?? docs/engineering/CP05_MAP_INVENTORY.json
?? docs/engineering/CP05_VERIFICATION.md
?? docs/superpowers/
?? tests/cp05-geography-recovery.test.cjs
?? tests/cp05-map-assets.test.cjs
?? tests/cp05-registry.test.cjs
?? tests/cp05-targets.test.cjs
?? tests/e2e/cp05-map-assets.spec.ts
?? tests/e2e/cp05-performance.spec.ts
?? tests/e2e/cp05-race.spec.ts
?? tests/e2e/cp05-regional-play.spec.ts
?? tools/audit-geography-candidates.py
?? tools/audit-map-labels.py
?? tools/build-geo-registry.py
?? tools/inspect-small-country-geometry.py
?? tools/inventory-geography-requirements.cjs
?? tools/inventory-map-geometry.py
?? tools/validate-geo-registry.cjs

```

## Isolated world-pilot resume (2026-11-01)

The eight-country, 623-part development-only fixture and all 186 excluded world entries are documented in `CP05_WORLD_PILOT.md` and `pilot/manifest.json`. Independent UN code and GeoNames landmark checks were applied to each source feature; Fiji was excluded after the Suva anchor failed containment. Source, simplified and rounded geometry validity and multipart association were checked, but complete boundaries and the other world/region questions remain unverified.

- Initial full Brave rerun: **108 passed, 2 failed, 10 skipped**; both failures were preview-isolation tests waiting for a full SPA fallback load. The check was corrected to inspect build output and request fixture resources directly. A later targeted run was **7 passed, 1 failed, 10 skipped** because the dev fixture lacked a favicon and emitted a 404; it now links the existing brand icon.
- Final targeted pilot matrix: **8 passed, 0 failed, 10 skipped** (the ten skips are development-only interaction cases in preview projects). Actual mouse clicks reached all eight identities and two Canada pieces; keyboard and chooser, touch-emulated tap, view controls, drag, wheel, reset, focus, responsive widths, duplicate/wrong scoring, stale listener and guard-removal stale-load behavior passed. The focused console check had no errors.
- `node tools/audit-data.cjs`: exit 0. `npm run check`: exit 0, **46 Node + 3 Vitest passed**, no failures or skips; typecheck, lint, formatting and build passed. Pilot JS modules also passed `node --check`. Final Brave full matrix: **110 passed, 0 failed, 10 skipped**, including actual preview and `/mapmaster/` isolation assertions and all retained CP04/gameplay regressions. `git diff --check`: exit 0.
- Single local samples: initial pilot navigation/readiness 239 ms, replacements 188/91/102/98/83 ms, six zoom/pan Playwright actions 199 ms. These include polling, browser/test overhead and concurrent workers; no production-network, frame-rate, long-run memory, physical-device or comprehensive assistive-technology measurement is claimed. Regenerating the SVG and manifest reproduced identical SHA-256 hashes.
- The fixture is recommended for independent pilot review with the documented limitations; this does not establish CP05 acceptance, resolve I-12 or prove the historical cause of I-15. The live world map and all existing assets remain in place. No commit, push, merge, reset, rebase or deployment was performed.

### Working-tree status after pilot verification

```text
## anurag/mapmaster-cp05-world-map
 M css/game.css
 M docs/audit/ASSET_PROVENANCE.md
 M index.html
 M js/data.js
 M js/events.js
 M js/game.js
 M js/modes.js
 M js/navigation.js
 M js/ui.js
 M tests/cp04-lifecycle.test.cjs
?? docs/engineering/CP05_GEOGRAPHIC_RECONCILIATION.md
?? docs/engineering/CP05_GEOGRAPHIC_RECOVERY.md
?? docs/engineering/CP05_GEO_FEASIBILITY.json
?? docs/engineering/CP05_GEO_REGISTRY.json
?? docs/engineering/CP05_GEO_REQUIREMENTS.json
?? docs/engineering/CP05_IMPLEMENTATION.md
?? docs/engineering/CP05_MAP_INVENTORY.json
?? docs/engineering/CP05_VERIFICATION.md
?? docs/engineering/CP05_WORLD_PILOT.md
?? docs/superpowers/plans/2026-10-31-cp05-geographic-recovery.md
?? pilot/core.mjs
?? pilot/index.html
?? pilot/manifest.json
?? pilot/map.svg
?? pilot/pilot.css
?? pilot/pilot.mjs
?? tests/cp05-geography-recovery.test.cjs
?? tests/cp05-map-assets.test.cjs
?? tests/cp05-pilot-core.test.cjs
?? tests/cp05-registry.test.cjs
?? tests/cp05-targets.test.cjs
?? tests/e2e/cp05-map-assets.spec.ts
?? tests/e2e/cp05-performance.spec.ts
?? tests/e2e/cp05-pilot.spec.ts
?? tests/e2e/cp05-race.spec.ts
?? tests/e2e/cp05-regional-play.spec.ts
?? tools/audit-geography-candidates.py
?? tools/audit-map-labels.py
?? tools/build-geo-registry.py
?? tools/generate-world-pilot.py
?? tools/inspect-small-country-geometry.py
?? tools/inventory-geography-requirements.cjs
?? tools/inventory-map-geometry.py
?? tools/validate-geo-registry.cjs
```

## Full-world diagnostic continuation (2026-11-01)

**Checkpoint: CP05 — Full World-Country Coverage and Integration. Outcome: partial; live integration withheld.** The preexisting 194 configured questions remain unchanged. The original registry records 165 reconciled, 22 policy-dependent and seven ambiguous world occurrences. The new coverage report records eight pilot-independently-checked identities and 186 further code-corroborated identities; these categories do not establish full feature or sovereignty approval. Current UN M49 alpha-3 entries corroborate 193; separate historical UN and UN Population Division evidence corroborates Taiwan's code, not a sovereignty claim. The 22 policy watchlist entries remain specifically marked in the per-question report. The provisional default de facto development view was explicitly chosen by the user, who also required future alternative views to preserve country identities and scoring and applicable Indian and other distribution requirements to be checked before release.

The `candidate/world.svg` diagnostic has 194 logical entity groups, 3,630 polygon components for those groups and 64 source-only context features. Context has no pointer events or game association. The complete lists, source feature IDs and exceptions are in `candidate/world-manifest.json` and `CP05_WORLD_COVERAGE.json`; all 194 candidate-gameplay entries are currently unsupported and live-ineligible. The SVG is 14,024,221 bytes and is excluded, along with the pilot, from `dist`. XML parsing succeeded with 4,471 elements; an automated test checked unique SVG IDs, identity and source mapping, and each group's part count. Repeated generation with identical inputs reproduced identical SVG and manifest hashes before the manifest schema version was added. The source archive hash is checked by the generator. No full-candidate browser readiness, memory, switching, input, small-country reachability or score testing is claimed.

Natural Earth 10m source geometry was valid for 193 entries; Egypt had a self-intersecting ring. The isolated candidate uses GEOS `make_valid` for Egypt; its planar source area changed by approximately 7.1e-14 square degrees, with no positive-area intersection with the adjacent 10m Libya, Sudan or Israel features in the diagnostic. Mixing in 50m Egypt produced positive-area overlaps and was rejected. All 194 candidate shapes were valid after repair and eight-decimal rounding. The 194-target planar overlap scan found zero pairs above 1e-10 square degrees; it is not a boundary, political, reachability or interaction proof. No geographic shape was enlarged for hit testing. See provenance for the public-domain source, checksum, transformation and unresolved inherited rights.

The existing eight-country pilot's prior documented browser evidence applies only to that pilot: real mouse and touch-emulated input, keyboard and chooser, viewport controls and stale-load/listener tests, including a guard-removal control. Emulated input is not physical-device evidence. Neither the full candidate's interaction nor its readiness, frame rate, memory and mobile usability have been measured, and the historical I-15 root cause remains unproven. Live CP04 state and maps remain unchanged by this continuation. No candidate game adapter has been implemented because source identity, geometry, policy and equivalent accessible interaction are not fully reviewed.

Before activation: independently review all unapproved feature relationships and disputed areas; review Egypt's repair and tiny/multipart targets; build and verify accessible mouse, touch, keyboard, chooser and viewport controls against actual candidate gameplay; verify wrong-country rejection and lifecycle ownership; verify Indian and other release requirements and inherited licensing; repeat all gameplay and subpath regressions. Do not claim 194/194 playable coverage or CP05 acceptance based on the diagnostic inventory.

### Current regression evidence

- `node tools/audit-data.cjs`: exit 0, 194 unique configured world entries, no missing configured SVG files; audit counts do not prove playable geographic coverage.
- `npm run check`: 49 Node tests and three Vitest tests passed, zero failed or skipped; TypeScript, lint, formatting and build passed. The check was repeated after adding multipart group assertions.
- Initial Brave invocation could not start the local server: sandbox `EPERM` binding `127.0.0.1:4174`; no tests ran in that attempt. With local server permission, the exact requested Brave command passed **110, failed 0, skipped 10** in 2.3 minutes. The 10 skips are development-only pilot interaction cases in preview configurations, while preview isolation checks and production subpath tests ran. This suite checks the established pilot and existing game, not interaction with the new diagnostic candidate.
- `git diff --check`: exit 0. The build excludes both `pilot/` and `candidate/`. The selected source archive is public domain; inherited provenance and distribution-law questions remain release blockers.

### Current working tree

Branch `anurag/mapmaster-cp05-world-map`; HEAD `da45962a7ea684e41bb4299bfa0d04863a4cb1fb`. All work remains uncommitted; no commit, push, merge, reset, rebase or deployment was performed. The full status follows (including preexisting CP05 work):

```text
## anurag/mapmaster-cp05-world-map
 M css/game.css
 M docs/audit/ASSET_PROVENANCE.md
 M index.html
 M js/data.js
 M js/events.js
 M js/game.js
 M js/modes.js
 M js/navigation.js
 M js/ui.js
 M tests/cp04-lifecycle.test.cjs
?? candidate/world-manifest.json
?? candidate/world.svg
?? docs/engineering/CP05_GEOGRAPHIC_RECONCILIATION.md
?? docs/engineering/CP05_GEOGRAPHIC_RECOVERY.md
?? docs/engineering/CP05_GEO_FEASIBILITY.json
?? docs/engineering/CP05_GEO_REGISTRY.json
?? docs/engineering/CP05_GEO_REQUIREMENTS.json
?? docs/engineering/CP05_IMPLEMENTATION.md
?? docs/engineering/CP05_MAP_INVENTORY.json
?? docs/engineering/CP05_VERIFICATION.md
?? docs/engineering/CP05_WORLD_COVERAGE.json
?? docs/engineering/CP05_WORLD_PILOT.md
?? docs/superpowers/plans/2026-10-31-cp05-geographic-recovery.md
?? docs/superpowers/plans/2026-11-01-cp05-world-coverage.md
?? pilot/core.mjs
?? pilot/index.html
?? pilot/manifest.json
?? pilot/map.svg
?? pilot/pilot.css
?? pilot/pilot.mjs
?? tests/cp05-geography-recovery.test.cjs
?? tests/cp05-map-assets.test.cjs
?? tests/cp05-pilot-core.test.cjs
?? tests/cp05-registry.test.cjs
?? tests/cp05-targets.test.cjs
?? tests/cp05-world-candidate.test.cjs
?? tests/cp05-world-coverage.test.cjs
?? tests/e2e/cp05-map-assets.spec.ts
?? tests/e2e/cp05-performance.spec.ts
?? tests/e2e/cp05-pilot.spec.ts
?? tests/e2e/cp05-race.spec.ts
?? tests/e2e/cp05-regional-play.spec.ts
?? tools/audit-geography-candidates.py
?? tools/audit-map-labels.py
?? tools/audit-world-coverage.py
?? tools/build-geo-registry.py
?? tools/generate-world-candidate.py
?? tools/generate-world-pilot.py
?? tools/inspect-small-country-geometry.py
?? tools/inventory-geography-requirements.cjs
?? tools/inventory-map-geometry.py
?? tools/validate-geo-registry.cjs
```

## Full-world candidate interaction verification (2026-11-01)

Detailed scope, per-input coverage, source decisions, failed initial touch coordinate and remaining blockers are in `CP05_WORLD_CANDIDATE_VALIDATION.md`. The development harness completed all 194 questions in Brave: one real mouse hit, one keyboard selection and 192 chooser selections. It rejected one wrong-country answer for each question. Distinct Canada components were selected with real mouse actions; Afghanistan was tapped with touch emulation on a 390px viewport. These results validate the harness's canonical associations and accessible selection path, not 194/194 direct pointer reachability or complete geography. No physical-device or comprehensive assistive-technology evidence is claimed.

A fresh pinned-source check reconstructed all 194 source shapes, repaired Egypt with GEOS, applied eight-decimal rounding and confirmed all 194 valid and with manifest-matching part counts. It does not establish political or boundary correctness. Existing source licenses and geographic caveats are documented in the candidate report. Exact exception and unsupported-approval lists remain in the coverage report and manifest.

- `node tools/audit-data.cjs`: exit 0; 194 configured unique world names, no missing configured files. This is not a correctness or playable-coverage audit.
- `node tools/validate-geo-registry.cjs`: exit 0; 989 records and 1,182 occurrences structurally valid.
- `npm run check`: exit 0; 50 Node tests and three Vitest tests passed, zero failed or skipped. Typecheck, lint, format check and build passed.
- `MAPMASTER_BROWSER_PATH="/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" npm run test:e2e`: exit 0; **118 passed, 0 failed, 20 skipped**, 2.7 minutes. Ten original pilot and ten new candidate interaction cases were intentionally skipped in preview configurations because those fixtures are development-only; production isolation assertions ran. All four live modes remain covered by CP04 regression tests.
- `git diff --check`: exit 0. The production build contains neither `pilot/` nor `candidate/`.
- An initial touch-specific run failed because a fractional test point rounded into Tajikistan; the integer-pixel hit-test correction and full rerun passed. This was a test point-selection issue, not evidence of physical-device behavior.
- Targeted single-worker local samples: ready 828 ms, mouse selection with assertion 28 ms, 390px viewport ready 721 ms, reload 696 ms, six zoom/pan button actions 654 ms. In the full concurrent run the equivalent samples were 1,983 ms, 17 ms, 2,445 ms, 2,107 ms and 1,680 ms. These include browser/test overhead and do not simulate production networks.
- Targeted JS heap after requested GC over initial load and three replacements: 2,357,704 / 2,577,272 / 2,836,140 / 2,854,440 bytes. Full concurrent run: 3,147,300 / 2,857,324 / 2,863,052 / 3,168,036 bytes. These are V8 heap values only; native rendering, browser-process memory and long-run retention require further study. Local SVG 14,024,221 bytes; offline gzip -9 sample 5,370,679 bytes.

The candidate harness is **not accepted for live integration**: geographic identity and boundary reviews remain incomplete, Egypt's repair and small-country differences need review, pointer reachability is not verified for all shapes, and physical-device, assistive-technology, memory and legal/distribution checks remain. No live map replacement or CP05/public-launch acceptance is implied.

### Working-tree status after candidate verification

Branch `anurag/mapmaster-cp05-world-map`; HEAD `da45962a7ea684e41bb4299bfa0d04863a4cb1fb`. All changes remain uncommitted. Full status, including prior CP05 work:

```text
## anurag/mapmaster-cp05-world-map
 M css/game.css
 M docs/audit/ASSET_PROVENANCE.md
 M index.html
 M js/data.js
 M js/events.js
 M js/game.js
 M js/modes.js
 M js/navigation.js
 M js/ui.js
 M tests/cp04-lifecycle.test.cjs
?? candidate/world-manifest.json
?? candidate/world.svg
?? docs/engineering/CP05_GEOGRAPHIC_RECONCILIATION.md
?? docs/engineering/CP05_GEOGRAPHIC_RECOVERY.md
?? docs/engineering/CP05_GEO_FEASIBILITY.json
?? docs/engineering/CP05_GEO_REGISTRY.json
?? docs/engineering/CP05_GEO_REQUIREMENTS.json
?? docs/engineering/CP05_IMPLEMENTATION.md
?? docs/engineering/CP05_MAP_INVENTORY.json
?? docs/engineering/CP05_VERIFICATION.md
?? docs/engineering/CP05_WORLD_CANDIDATE_VALIDATION.md
?? docs/engineering/CP05_WORLD_COVERAGE.json
?? docs/engineering/CP05_WORLD_PILOT.md
?? docs/superpowers/plans/2026-10-31-cp05-geographic-recovery.md
?? docs/superpowers/plans/2026-11-01-cp05-world-coverage.md
?? pilot/candidate-core.mjs
?? pilot/core.mjs
?? pilot/index.html
?? pilot/manifest.json
?? pilot/map.svg
?? pilot/pilot.css
?? pilot/pilot.mjs
?? pilot/world/candidate.mjs
?? pilot/world/index.html
?? tests/cp05-candidate-core.test.cjs
?? tests/cp05-geography-recovery.test.cjs
?? tests/cp05-map-assets.test.cjs
?? tests/cp05-pilot-core.test.cjs
?? tests/cp05-registry.test.cjs
?? tests/cp05-targets.test.cjs
?? tests/cp05-world-candidate.test.cjs
?? tests/cp05-world-coverage.test.cjs
?? tests/e2e/cp05-map-assets.spec.ts
?? tests/e2e/cp05-performance.spec.ts
?? tests/e2e/cp05-pilot.spec.ts
?? tests/e2e/cp05-race.spec.ts
?? tests/e2e/cp05-regional-play.spec.ts
?? tests/e2e/cp05-world-candidate.spec.ts
?? tools/audit-geography-candidates.py
?? tools/audit-map-labels.py
?? tools/audit-world-coverage.py
?? tools/build-geo-registry.py
?? tools/generate-world-candidate.py
?? tools/generate-world-pilot.py
?? tools/inspect-small-country-geometry.py
?? tools/inventory-geography-requirements.cjs
?? tools/inventory-map-geometry.py
?? tools/validate-geo-registry.cjs
```

## World release-candidate gate verification (2026-11-01)

The candidate is **not ready for controlled live-game integration**. `CP05_WORLD_RELEASE_GATE.md` records each identified geographic exception, the pinned Natural Earth 5.1.1 sources and checksums, public-domain terms, interaction evidence, performance method and the exact release blockers. The candidate remains development-only; `dist` excludes both `candidate/` and `pilot/`, and no live World or regional SVG was replaced.

The final development evidence completed the 194-question harness through one actual mouse selection, one keyboard selection and 192 named-chooser selections, with 194 wrong-country rejections. Representative real pointer actions covered Brazil, Canada, Japan, South Africa, Australia and India; Canada also verified two multipart components. Brave touch emulation selected Japan at a 390px viewport; Vatican City used focus plus the chooser. These actions validate selected routes and target identity handling, not 194 direct-pointer proofs, physical-device input, full assistive-technology behavior or geographic correctness.

The disabled `world-map-adapter.mjs` unit suite passed five cases for exact manifest coverage, stale document/session rejection, DOM-ID validation, pointer-capture identity and drag suppression. A browser test confirmed an active callback is blocked after the authoritative-session value changes. The adapter is not connected to live CP04 state. I-12 remains open; I-15's historical root cause remains unproven despite controlled stale-mutation guard evidence.

Lossless SVG serialization reduced 14,024,221 bytes to 13,885,679 bytes (0.99%; gzip 5,370,679 to 5,316,130). Same-browser samples were variable and did not establish a responsiveness gain, so the source candidate was not replaced. Heap samples are V8-only and omit native rendering and browser process memory.

- `node tools/audit-data.cjs`: exit 0.
- `npm run check`: exit 0; 55 Node tests and 3 Vitest tests passed, plus typecheck, lint, formatting and build.
- `MAPMASTER_BROWSER_PATH="/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" npm run test:e2e`: exit 0; **121 passed, 0 failed, 26 skipped** in 4.5 minutes. The 26 skips are deliberate development-harness exclusions outside production; production isolation checks ran.
- `git diff --check`: exit 0.

The branch is `anurag/mapmaster-cp05-world-map` at `da45962a7ea684e41bb4299bfa0d04863a4cb1fb`; all work remains uncommitted. No commit, push, merge, reset, rebase or deployment occurred. The next step is independent geographic/policy review of the documented associations and a separate live-integration review; do not enable the candidate before both.

## Controlled integration recovery evidence (2026-11-01)

- Targeted Node coverage: `node --test tests/cp04-lifecycle.test.cjs tests/cp05-candidate-core.test.cjs tests/cp05-release-gate.test.cjs tests/cp05-world-candidate.test.cjs tests/cp05-targets.test.cjs` — **23 passed, 0 failed, 0 skipped**.
- `node tools/audit-data.cjs` — exit 0; **194** distinct world names and **0** missing configured map files. This is a configuration audit, not geography approval.
- `npm run check` — exit 0; **55** Node tests and **3** Vitest tests passed, with typecheck, lint, formatting and production build passing. Vite reports the nine deliberate classic scripts as non-bundleable; the build plugin copies them in their required order.
- Focused Brave development coverage passed the CP04 score/streak/duplicate/completion path and the Challenge last-life, review, restart and stale-document path. The touch-emulated companion exercises chooser, focus, reset and a real emulated touch tap. Emulation is not physical-device evidence.
- `MAPMASTER_BROWSER_PATH="/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" npm run test:e2e` — **124 passed, 0 failed, 32 skipped** across 156 development, production and production-subpath cases. The 32 skips are the 16 intentional development-only candidate/pilot/release-gate cases in each production project; production isolation tests themselves passed.

The recovered failure was in the test setup, not CP04: the setup constrained `locateEligible` to Afghanistan and Albania, then clicked Brazil. CP04 correctly rejected that non-eligible identity before score or life mutation. The regression now clicks Albania, proving a canonical eligible wrong selection deducts the last life. That exposed the review remount gap, now covered: the candidate remains visible in review but CP04 rejects chooser selection because `canPlay()` is false.

Production isolation remains mandatory: `?cp05Candidate=1` is recognized only on local Vite port 4174, never preview or `/mapmaster/`; the standard World Edition and all existing regional maps remain selected by default. Geographic/policy approval, direct physical-device testing, complete screen-reader study and long-run browser-process memory measurements remain outstanding.

## CP05 Japan and Germany validation resume (2026-11-04)

Japan validation used the already-pinned MLIT N03 2024 archive (SHA-256
`a03111be0fe726ff270cbc1dd16f38bc926cf814e67c8cd2e52157629d138b98`) only
as a comparison source. The revised deterministic process topology-preservingly
simplifies every municipal geometry at `0.005°` **before** unioning by
`N03_001`; it keeps the raw union and the prior post-union simplification only
as diagnostics. It never writes an SVG or changes a playable candidate.

- All 122,031 MLIT municipal source polygons, all 47 raw prefectural unions,
  and all 47 simplify-before-union comparison geometries are valid. The
  historical post-union diagnostic is invalid only for Hyōgo (`Nested shells`).
  Hyōgo's 2,139 valid source polygons and its raw union are valid; its corrected
  comparison geometry is valid.
- 47/47 prefecture names, MLIT `N03_001`/`N03_007` identifiers, candidate
  question keys, and Natural Earth source IDs are unique and matched. No source
  feature became empty or invalid during pre-union simplification. Multipart
  counts are retained in the machine-readable output so unioning/simplification
  effects are auditable rather than silently treated as lost prefectures.
- The refreshed 47-way metrics have IoU range `0.515776–0.971931`, mean
  `0.899250`, and maximum Hausdorff distance `6.587904°`. Hyōgo is `0.944830`
  IoU. Okinawa (`0.515776`; 29 candidate versus 4,223 comparison parts), Tokyo
  (`0.733234`; 23 versus 5,200), and Kagoshima (`0.795907`; 13 versus 6,219)
  remain island/coastline/generalisation review items, not candidate defects or
  grounds to alter gameplay geometry.

Germany validation reused BKG's official VG250 01.01.2026 URL and its published
MD5 `19abb1eda644eea121ac037ca3c12e46`. A single bounded 120-second HTTP-range
resume of the retained partial produced 38,312,449 bytes with calculated MD5
`d715678a253f88da77015ab592714176`; `unzip -t` failed because the ZIP
end-of-central-directory is absent. The archive is therefore neither verified
nor extracted, and no partial or third-party geometry was used. The exact
technical blocker and the 0/16 comparison status are recorded in
`candidate/admin1/comparison/germany-bkg-vg250-access-blocker.json`; no more
download attempts were made.

Focused validation: `node --test tests/cp05-admin1-comparison.test.cjs` passed
3/3 after a red/green regression for simplify-before-union derivation, and
`git diff --check` exited 0. These checks do not clear the six maps, relax
`live_approved: false`, or change the fail-closed public-beta build.

## CP05 Japan Okinawa / Kagoshima correction (2026-11-05)

The pinned MLIT N03 2024 comparison was used to resolve a specific source
association error, not to redraw a boundary. Six whole valid polygons from the
Natural Earth `JPN-3502` (Okinawa) record were conclusively associated only
with MLIT Kagoshima (`N03_001` `鹿児島県`, `N03_007` `46000`) and not with MLIT
Okinawa (`沖縄県`, `47000`). The generator now moves exactly those six
source-WKB-SHA-256-attested polygons to the existing Kagoshima question
(`japan:018`) while retaining their original Natural Earth coordinates and the
Okinawa source provenance. It neither imports MLIT geometry nor changes a
question key.

The updated 47-prefecture comparison has no missing or invalid candidate or
reference feature. Okinawa improves from IoU `0.515776` (29 parts) to
`0.753732` (23); Kagoshima from `0.795907` (13) to `0.885321` (19); Tokyo is
unchanged at `0.733234`; Hyōgo remains valid at `0.944830`. The erroneous
Okinawa→Kagoshima candidate/reference overlap is now `0.0 deg²`. The existing
small adjacent-boundary overlap set is unchanged. Full component hashes,
per-component bounds, before/after metrics and the remaining Tokyo/island
review are in `CP05_SIX_MAP_GEOGRAPHIC_ACCEPTANCE.md` and the machine-readable
comparison record.

This correction remains candidate-only: `candidate/admin1/japan.svg` and its
manifest retain `live_approved: false`; production maps, CP04 routing,
Firebase, public-beta safeguards, and the release status remain unchanged.

Focused validation after the correction passed: the source-pinned candidate and
comparison tests, all 70 legacy tests (one new component-assignment assertion)
and 34 unit tests; the Japan development candidate browser checks for all
keyboard targets, live CP04 Kagoshima scoring, and mobile touch chooser scoring
of the reallocated-component target (3/3); ESLint; Prettier; and the production
build. The build retains its pre-existing classic-script and 500 kB chunk
warnings.

## CP05 Brazil pointer-scoring investigation (2026-11-05)

The previously observed Brazil failure (`#scoreDisplay` expected `1`, received
`0` after the Acre mouse action) did **not** reproduce in the same local
development-only Admin-1 scenario, in ten repeated runs, or in the original
multi-scope command. A focused regression records the actual event and CP04
state contract: keyboard activation of Alagoas is an eligible wrong attempt
(`score 0`, `totalAttempts 1`); Acre pointer-down resolves to
`cp05-brazil-bra-576` / `brazil:001`; the map's intentional pointer capture
retargets pointer-up to the SVG root; and the adapter retains the pointer-down
identity and produces `score 1`, `totalAttempts 2`. There were no browser page
errors. A duplicate Acre pointer selection and a click dispatched on the
detached pre-reload Acre node are both ignored. Mobile touch chooser selection
also preserves wrong/correct/duplicate CP04 semantics.

The source mapping, SVG geometry, adapter, and runtime code were not changed:
the evidence supports a transient browser-run/test observation, not a Brazil
geographic or CP04 defect. Brazil remains quarantined with `live_approved:
false`; this does not alter its geographic **PARTIAL** status or the
fail-closed public-beta gate.

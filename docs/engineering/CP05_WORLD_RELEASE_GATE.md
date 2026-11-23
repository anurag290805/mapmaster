# CP05 world-map release-candidate gate — 2026-11-01

## Gate decision

**Do not enable live integration.** Candidate identifiers and all-question chooser selection have been exercised, but geographic feature associations, disputed/context geometry, the real CP04 adapter integration, full accessibility and release requirements are not cleared. The previously authorized Natural Earth default de facto view is a provisional *development* baseline; it is not a sovereignty determination, a final policy approval for every feature, or legal clearance. Alternative views must preserve canonical identities and scoring. The existing World Edition and all other live maps remain unchanged.

## Evidence and exception review

The 10m and 50m Admin-0 Countries layers are Natural Earth **5.1.1**, with archive SHA-256 respectively `ce1ac7036499a0edd641fbc093cd209a98f96a49d2eca8480aaacad35138a7f6` and `5fed433373581fa648920435f937d95f2d3c0200e067409c6478dcdf1b853139`. Both are public-domain data under [Natural Earth terms](https://www.naturalearthdata.com/about/terms-of-use/). [Natural Earth's policy](https://www.naturalearthdata.com/about/disputed-boundaries-policy/) documents de facto defaults and alternative national views; it does not settle MapMaster's gameplay treatment. [UN M49](https://unstats.un.org/unsd/methodology/m49/) corroborates identifiers for statistical use, not borders or sovereignty. The source-reference and checksum details for every row are also in `CP05_WORLD_COVERAGE.json`.

**Technical status used below:** source IDs and codes match the recorded candidate associations; that is not independent proof that every pixel, part, or territorial association is correct. Every row remains unapproved for live gameplay. For each, the current provisional development policy permits examining the Natural Earth default; feature-specific geographic review and applicable publication rules remain open. Recommended default action is to retain the 10m candidate without changing the configured question pool, independently inspect its assigned and contextual geometry, and provide a named chooser/focus alternative. In the current diagnostic, clicking noninteractive context does not score any country; a chooser can still submit a configured country. Consequently a player who perceives contextual territory as part of a target cannot select that territory on the map. The table identifies where that issue is concretely known; for other watchlist entries, an exception requires examination, not an assertion that its border is wrong.

### Egypt and tiny-state/island discrepancies

| Entity and source ID | Observed issue; technical conclusion | Policy / resolution and gameplay consequence |
| --- | --- | --- |
| Egypt `1159320575` | 10m source self-intersection at 35.621087106 E, 23.139292914 N. GEOS `make_valid` creates eight valid parts; area change is approximately 7.1e-14 square degrees and tested Israel/Libya/Sudan 10m overlaps are zero. This proves topology, not the geographic correctness of the repair. | Development baseline chosen; independent repair and neighboring-border review still needed. Do not promote the shape to live gameplay pending that review. |
| Vatican City `1159321407` | 50m bounds 12.4275–12.4392 E versus 10m 12.4527–12.4540 E; they do not overlap. 10m has one very small part. A CIA geographic-name record lists Vatican City near 41°54′N, 12°27′E, consistent at coarse resolution with the 10m location, not a boundary certification. [Source](https://www.cia.gov/readingroom/docs/CIA-RDP01-00707R000100010006-1.pdf). | No new geopolitical policy inferred; obtain authoritative detailed boundary and retain chooser. At world scale direct pointer/touch may be impossible. |
| Monaco `1159321043` | 50m and 10m have one part each, different bounds and low overlap; identity codes agree but detailed boundary is unverified. | Independently review the 10m polygon; keep chooser/focus. Tiny geometry is a pointer risk. |
| Seychelles `1159321291` | 50m has one polygon versus 26 at 10m; the 10m feature includes a wider island extent. | Retain all 10m parts; verify their identities and accessible selection. A 50m swap would remove represented parts. |
| Maldives `1159321053` | 50m has two polygons versus 176 at 10m, spanning a wider north–south area. | Retain 10m islands; independently inspect and use chooser/focus. A 50m swap reduces represented parts. |
| Kiribati `1159320981` | 50m has 19 parts versus 35 at 10m and different bounds across the antimeridian. | Verify dispersed islands and antimeridian behavior; chooser and focus are necessary where pieces are too small. |
| Marshall Islands `1159321057` | 50m has five parts versus 22 at 10m and materially different bounds. | Retain and inspect all 10m parts; chooser and focus cover small targets. |
| Tuvalu `1159321333` | 50m has one part versus nine at 10m with wider bounds. | Retain and inspect 10m parts; chooser and focus cover small targets. |

All comparisons are representation diagnostics, not proof that 10m is authoritative. No small-country geometry is removed or enlarged, and no live answer pool is reduced.

### Disputed-boundary watchlist

Each row below records the exact canonical question and Natural Earth source feature. For all rows, identifier matching is technically corroborated but the *full geometry and territory-to-answer association are unverified*. A final release/alternative-view decision and applicable mapping requirements remain open. The common gameplay consequence is that only the assigned target group is selectable; neutral context cannot score. Where a specific nearby context is named, the manifest confirms its separate, noninteractive source feature, not an adjudication of its sovereignty.

| Country / canonical ID | 10m NE_ID | Specific review priority |
| --- | ---: | --- |
| Armenia `iso3166-1:AM` | `1159320333` | Inspect Armenia–Azerbaijan sensitive border representation and source currency. |
| Azerbaijan `iso3166-1:AZ` | `1159320381` | Inspect Azerbaijan–Armenia sensitive border representation and source currency. |
| China `iso3166-1:CN` | `1159320471` | Review its displayed borders and alternate national view; Taiwan has a distinct configured target. |
| Cyprus `iso3166-1:CY` | `1159320533` | Northern Cyprus (`1159320531`) and UN Buffer Zone (`1159320511`) are noninteractive context; decide appropriate target handling without asserting sovereignty. |
| Egypt `iso3166-1:EG` | `1159320575` | Review the topology repair and sensitive borders as above; Bir Tawil is separate context. |
| Georgia `iso3166-1:GE` | `1159320779` | Inspect sensitive boundary and de facto representation; do not infer control or legal status from codes. |
| India `iso3166-1:IN` | `1159320847` | Siachen Glacier (`1159320963`) is noninteractive context; review boundary view and applicable Indian mapping requirements. |
| Iran `iso3166-1:IR` | `1159320881` | Review source border attribution and any disputed-area representation; watchlist alone is not evidence of an error. |
| Iraq `iso3166-1:IQ` | `1159320887` | Review source border attribution and any disputed-area representation; watchlist alone is not evidence of an error. |
| Israel `iso3166-1:IL` | `1159320895` | Source class is `Disputed`; inspect its geometry and association alongside Palestine, including context and alternate views. |
| Morocco `iso3166-1:MA` | `1159321035` | Western Sahara (`1159321223`) is noninteractive context; inspect policy and answer consequences before any integration. |
| Pakistan `iso3166-1:PK` | `1159321153` | Review India/Pakistan view and separate Siachen context; verify applicable distribution requirements. |
| Palestine `iso3166-1:PS` | `1159320899` | Source is `Indeterminate`, with `ISO_A3=PSE` and `ADM0_A3=PSX`; inspect West Bank/Gaza associations and context separately from sovereignty. |
| Russia `iso3166-1:RU` | `1159321201` | Inspect source currency and Ukraine-related de facto boundaries; do not infer sovereignty from control. |
| Serbia `iso3166-1:RS` | `1159321267` | Kosovo (`1159321007`) is noninteractive context; inspect desired answer behavior and view without deciding status. |
| Somalia `iso3166-1:SO` | `1159321261` | Somaliland (`1159321259`) is noninteractive context; inspect desired answer behavior and view without deciding status. |
| South Sudan `iso3166-1:SS` | `1159321235` | Review undetermined Sudan/South Sudan boundary and Abyei; source uses `ISO_A3=SSD`, `ADM0_A3=SDS`. |
| Sudan `iso3166-1:SD` | `1159321229` | Review undetermined Sudan/South Sudan boundary and Abyei; no final boundary is assumed. |
| Syria `iso3166-1:SY` | `1159321295` | Inspect disputed-border source representation and currency; watchlist alone does not approve or reject geometry. |
| Taiwan `iso3166-1:TW` | `1159321335` | Natural Earth has `ISO_A2=CN-TW`, `ISO_A2_EH=TW`, `ISO_A3=TWN`; retain separate configured ID without implying a sovereignty decision. |
| Turkey `iso3166-1:TR` | `1159321331` | Inspect source border representation and Cyprus-related context; do not infer an adjudication from the source. |
| Ukraine `iso3166-1:UA` | `1159321345` | Inspect source currency and Russia-related de facto boundaries; do not infer sovereignty from control. |

The [UN geographical names training material](https://unstats.un.org/unsd/ungegn/pubs/documents/Training%20Manual.pdf) describes unresolved Sudan/South Sudan boundary/Abyei issues and illustrates differing map conventions. It does not certify this candidate. The watchlist is conservative rather than an exhaustive survey of current disputes.

## Interaction and lifecycle evidence

The isolated development harness contains 194 logical target groups, 3,630 target polygon components and 64 noninteractive context features. A Brave development run completed all 194 questions: one actual mouse answer, one keyboard answer and 192 chooser answers, with one wrong-country rejection for each question. The all-country loop establishes that every configured identity has a supported selection route; it does **not** establish direct pointer reachability for every polygon.

Representative real-pointer evidence covers Brazil, Canada, Japan, South Africa, Australia and India at focused views. A 390px viewport received a Brave touch-emulated tap on Japan; Vatican City was selected through the named chooser after focus. Canada was hit in two separate components and resolved to the same canonical identity. Dragging a zoomed map changed the view without changing score. Those are browser actions, not synthetic SVG dispatches. Emulated touch is not physical-device evidence, and no comprehensive screen-reader/assistive-technology study has been performed.

The diagnostic has keyboard-focusable generic map targets (`Map target n`) so a quiz does not expose answers through SVG accessibility labels; the named chooser is the non-pointer alternative. It provides zoom, directional pan, drag pan, reset, focus and review/new-session transitions. Its stale-response test delays an old SVG response, replaces it, then navigates away; neither obsolete response installs a map. The prepared adapter separately rejects retired documents, sessions, canonical IDs and DOM-ID mismatches, retains pointer-down identity through SVG pointer capture, and ignores drags. Its unit test has five passing cases and its browser test shows a session change prevents a later callback. This is evidence for a future integration seam, not evidence that the historical I-15 cause is proven.

## Performance and optimization investigation

The retained 10m candidate is 14,024,221 bytes (5,370,679 bytes with local `gzip -9`). A lossless path-number serializer produces 13,885,679 bytes (5,316,130 gzipped): a 138,542-byte / 0.99% raw reduction and 54,549-byte / 1.02% gzip reduction. It changes neither command ordering nor numeric coordinate values; tests compare every path token and all non-path markup. The generated candidate remains the original, pinned asset because the small size reduction is not a proven responsiveness improvement and replacing it would require a new reproducibility checksum review.

In an isolated single-worker local Brave comparison at 390px, original/optimized readiness was 1,902/1,347 ms; reload pairs 1,123/1,934 and 3,076/2,171 ms; controls 1,013/1,856 ms; post-GC JS heap 2,770,800/2,676,692 bytes. Task CPU, layout and style times varied in the opposite direction across the variants. In the concurrent full suite, original/optimized readiness was 7,916/5,950 ms and reloads also varied widely. The same browser/process, route interception and control sequence were used, but local caching, contention and rendering variance dominate this small sample. No performance conclusion supports a geometry change.

The broader development run recorded candidate readiness 7,939 ms under four-worker contention, pointer-selection assertion latency 69 ms, mobile-ready 3,566 ms, mobile reload 4,790 ms and six view-control actions 8,478 ms. Post-GC V8 used heap samples across three replacements were 2,380,888, 2,680,260, 2,697,008 and 2,860,004 bytes. These are diagnostic samples only: they exclude native SVG rasterization, GPU, full browser-process memory, production transfer/network cost and physical devices. Rendering, zoom/pan and repeated loads remain performance gates for a future production candidate.

## Integration decision and final verification

`js/world-map-adapter.mjs` is a prepared, disabled adapter seam. It requires an external authoritative session accessor and can only emit a manifest-backed canonical country while its document and session remain current. It does not own questions, scoring, lives, timer, review state or navigation, so CP04 session authority is unchanged. It is intentionally not imported by the classic live scripts and is not bundled as an enabled game mode. Consequently there is no claim that candidate gameplay has passed live World/India switching, real live review-state integration, or production candidate accessibility. The existing live World Edition remains the active map.

The release gate is **closed**. Geographic feature review is incomplete for all 194 entries; Egypt's repaired topology, seven small-country representation differences and the disputed-boundary watchlist remain unresolved. The Natural Earth license is public domain, but inherited live-asset provenance and applicable distribution/mapping requirements remain release questions. I-12 remains open because existing regional map eligibility is label-based and Asia has unsupported labels. I-15's historical root cause remains unproven; the diagnostic guard tests only show that this guard class blocks controlled stale mutations.

## Restricted public-beta scope (frozen 2026-11-01)

CP05 development is complete only for the **guarded, no-candidate technical scope**: the existing CP04 application paths may be regression-tested, while `candidate/`, `pilot/`, the world-map adapter and every unapproved Natural Earth/India-derived map remain absent from production. No geographic replacement, disputed-boundary presentation, Egypt repair, or India ADM1 layer is in scope for beta.

An external public-beta invitation is **not yet authorized**. `docs/audit/ASSET_PROVENANCE.md` records unverified provenance or redistribution conditions for inherited country, continent and other SVG maps, as well as unresolved geography/flag data provenance. Until the product owner clears the applicable rights for the exact shipped assets, the only permitted use of this technical scope is owner-authorized QA; it is not demonstrably distributable public map gameplay. The six founder decisions in `CP05_FOUNDER_DECISIONS.md` and the frozen geographic findings remain prerequisites for any later map-beta expansion.

### Beta verification update

The four previously recorded Brave failures all passed in one serial affected-test run (12 runs, zero failures). A subsequent four-worker full Brave run recorded one failure in the development-only controlled-candidate CP04 score test; the same test immediately passed in isolation (one pass, two expected non-development skips). The evidence is consistent with parallel candidate-SVG rendering pressure and does not reproduce as a production-map or CP04 gameplay defect. It remains a diagnostic-harness performance limitation and does not authorize the candidate; production isolation stays required and the public-beta rights gate above remains closed.

Final commands on 2026-11-01:

- `node tools/audit-data.cjs`: exit 0; 194 distinct world names and zero missing configured files. This is a configuration audit, not geographic approval.
- `npm run check`: exit 0; 55 Node tests and 3 Vitest tests passed; typecheck, lint, formatting and build passed.
- `MAPMASTER_BROWSER_PATH="/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" npm run test:e2e`: exit 0; 121 passed, 0 failed, 26 skipped in 4.5 minutes. Skips are candidate/pilot interactive cases outside the deliberately production-excluded development harness; production isolation and existing CP04 paths ran.
- `git diff --check`: exit 0.

Branch `anurag/mapmaster-cp05-world-map` remains at `da45962a7ea684e41bb4299bfa0d04863a4cb1fb`; the CP05 work, including this report, is uncommitted. No commit, push, merge, reset, rebase or deployment was performed. The next CP05 step is independent approval of the listed country/context associations and release requirements, followed by a production-adapter integration review with live-state, accessibility and device-performance evidence. Do not enable the candidate before that review.

## Recovery addendum — controlled CP04 integration (2026-11-01)

The development-only route mounts the candidate against the real CP04 Locate lifecycle. Canonical SVG identity resolution belongs to the adapter; all scoring and lifecycle writes remain CP04 calls. The adapter rejects stale document/session/DOM-ID combinations, while CP04 rejects terminal and review input through `canPlay()`. A review-only candidate remount preserves map context and named chooser access without enabling selection, lives, timers or scoring.

Classic-script compatibility uses runtime module-script insertion from `events.js`; no static module import enters the classic sequence. SVG keyboard handling dispatches a bubbling keyboard-originated click because candidate `<g>` elements cannot be relied on to expose `.click()`. The build allowlist keeps the experimental candidate and adapter out of production artifacts, and the query parameter cannot activate them on preview or the `/mapmaster/` subpath.

This addendum does not change the gate decision: **do not enable live integration**. The candidate is development-only, regional-map geographic work remains open, and the recorded licensing, geographic-policy, accessibility, physical-device and performance blockers still apply.

## CP05 engineering handoff — 2026-11-01

**CP05 DEVELOPMENT COMPLETE — PUBLIC RELEASE BLOCKED.** Engineering acceptance covers the guarded development candidate, its 194-country evidence set, the geographic audits and the frozen six founder decisions; none is promoted to live gameplay.

`ASSET_PROVENANCE.md` records 22 cleared inherited SVGs (16 SimpleMaps and six credited amCharts maps) and the attributed Twemoji 14.0.2 flag provider. The ten named SVGs without demonstrated source/redistribution rights remain blocked: `australia`, `brazil`, `canada`, `china`, `germany`, `japan`, `spain`, `uae`, `usa` and `world`. This is separate from the unproven provenance and factual review of the geography data in `js/data.js`; clearing map artwork does not clear that data set.

`npm run build:public-beta` now fails before emitting a beta artifact while those ten SVGs are blocked. The normal development/production build is preserved for owner-authorized QA, and candidate/pilot assets remain excluded by the production copy allowlist. No questions or gameplay were removed: the withheld SVGs affect Locate for World and the nine corresponding country scopes; Typing and Capital remain mechanically available but their underlying geography-data provenance is still not release-cleared. Flag mode uses the attributed Twemoji provider but is likewise not a geographic-data approval.

Public-release prerequisites: establish source and redistribution rights for the ten SVGs and `data.js`; resolve the six founder decisions; complete the 194-country/India geographic, accessibility, physical-device and performance gates; then replace the fail-closed beta gate only with reviewed, reproducible asset approval. This is deferred release work, not CP06 implementation.

# Asset provenance — follow-up 2026-10-31

Evidence describes the inspected files and current upstream statements, not a legal opinion or a blanket clearance. The workspace is not identical to the remote checkout. Verify the exact asset version, acquisition and applicable terms before release, retain required notices, and replace assets whose provenance cannot be established.

| Asset | Evidence | Release action |
|---|---|---|
| Application code | Workspace README asserts MIT but has no LICENSE. Separate GitHub `main` checkout at `e161914d3dfe4883282d4140c85ec9d017a05a2f` includes MIT License, copyright 2026 Anurag Srivastava. Workspace code differs in five JS files, HTML and CSS. | Confirm authorship and rights for local differences; preserve applicable MIT notice and determine whether third-party code is incorporated. |
| 16 country SVGs | Embedded Simplemaps copyright and license URL in argentina, egypt, france, greece, india, indonesia, italy, mexico, nigeria, pakistan, russia, south_africa, south_korea, thailand, turkey and vietnam. [SimpleMaps terms](https://simplemaps.com/resources/svg-license) permit use in distributed websites/software while restricting unmodified standalone map collections. | Cleared for application distribution; preserve the embedded notice and do not redistribute the map files as a standalone collection. |
| Six continent SVGs | africa, asia, europe, north_america, south_america, oceania have exact `ammap.com` copyright headers and the amCharts namespace. [amCharts SVG maps](https://www.amcharts.com/svg-maps/) permits commercial use with credit. | Cleared: the persistent home-page `Map data © amCharts` credit links to the source. |
| Other 10 SVGs | No matching SimpleMaps/amCharts marker found by the audit search. World and country maps include metadata/labels but no verified author or terms. | Trace original sources and license/attribution; replace if unverified. |
| Flag images | `modes.js` requests Twemoji 14.0.2 PNG files from cdnjs. The pinned [Twemoji 14.0.2 graphics licence](https://github.com/jdecked/twemoji/blob/v14.0.2/LICENSE-GRAPHICS) is CC BY 4.0. | Cleared for the current external delivery: persistent home-page attribution links to the pinned licence. Pin or self-host only after separately recording the delivered archive checksum. |
| Font | Google Fonts Poppins import in `css/variables.css`. [Poppins license in Google Fonts](https://github.com/google/fonts/blob/main/ofl/poppins/OFL.txt) identifies SIL OFL 1.1. | Verify exact delivered files and obligations before bundling; include appropriate notices. |
| Icons | HTML Unicode/emoji, system glyphs; SVG progress ring and hero illustration constructed in app. Platform glyph appearance and licensing are external; no icon library identified. | Verify any substituted artwork and accessible labels; do not assume font glyph rights cover redistribution. |
| Sounds | CP09 replaces embedded WAV data with short, original Web Audio oscillator patterns authored in `js/audio.js`; no external asset, request, library, or third-party recording is used. | No audio asset attribution required. Effects are optional, muted persistently by the player, and never convey critical state alone. |
| Screenshots | Eight bundled PNGs described by README, not loaded by app. No creator/source statement. | Confirm ownership and permissions for any published images. |
| Geography and flags data | `data.js` has no documented dataset provenance or factual review. SVG aliases may derive from several providers. | Record authoritative sources, versions, licensing, boundaries and naming decisions before release. |
| Third-party code | No package manifest; static code contains no detailed attribution or source inventory. | Review history and author records; identify any copied snippets and comply with their terms. |

Git history was inspected for the map filename; commit `15503f3` renames the North America SVG, but does not establish authorship of its geometry. All unresolved third-party assets remain release risks.

## CP01 consolidation

Consolidation: the candidate retains the remote MIT LICENSE, but this does not independently clear audited changes or third-party assets. Trace or replace unresolved assets before public release (CP07/12).

## CP05 replacement evaluation

[Natural Earth](https://www.naturalearthdata.com/) describes its data as public domain and publishes versioned Admin 0 and Admin 1 cultural data; its [10m download page](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/) documents de facto boundaries and alternate points of view. [geoBoundaries API documentation](https://www.geoboundaries.org/api.html) describes gbOpen as CC BY 4.0 compatible and exposes original source/license metadata. Both are potential no-fee sources, not yet verified replacements for the specific editions or bundled assets. Coverage, version, exact layer license/attribution, political boundary policy, conversion and target size must be checked per source before adoption. Existing unresolved rights remain a launch blocker.

## CP05 geographic recovery sources

The pinned checksums and layer findings are in `../engineering/CP05_GEO_FEASIBILITY.json` and `../engineering/CP05_GEOGRAPHIC_RECOVERY.md`. Natural Earth describes its vector data as public domain; the inspected geoBoundaries India ADM1 metadata reports CC BY 2.5 India as the original source license and gbOpen describes its release as CC BY 4.0 compatible. Version, source and attribution must be preserved and checked before distribution. These are evaluated candidates only: the existing SVGs remain in use and their unresolved provenance and redistribution rights remain launch blockers.

### CP05 diagnostic full-world source (2026-11-01)

The isolated `candidate/world.svg` is derived from Natural Earth 1:10m Admin-0 Countries v5.1.1, [official archive](https://naturalearth.s3.amazonaws.com/10m_cultural/ne_10m_admin_0_countries.zip), SHA-256 `ce1ac7036499a0edd641fbc093cd209a98f96a49d2eca8480aaacad35138a7f6`. [Natural Earth's terms](https://www.naturalearthdata.com/about/terms-of-use/) place its data in the public domain, allow commercial reuse and do not require attribution. The candidate rounds to eight decimal degrees, groups by entity and repairs the invalid Egypt source using GEOS `make_valid`; that repair remains subject to geographic review. Its manifest records source context, checksum, exact size, policy and source feature associations. This evidence does not resolve inherited asset provenance or any legal requirements for disputed map depictions. Verify Indian and other distribution rules before public release.

## CP05 release matrix — 2026-11-01

| Asset set | Count | Status | Public-distribution action |
|---|---:|---|---|
| Marked SimpleMaps country SVGs | 16 | CLEARED | Ship only as part of MapMaster; retain notices. |
| Marked amCharts continent SVGs | 6 | CLEARED | Persistent source credit is present. |
| Twemoji 14.0.2 flag provider | 1 provider | CLEARED | Persistent CC BY 4.0 credit is present; it remains externally fetched. |
| Unmarked SVGs (`australia`, `brazil`, `canada`, `china`, `germany`, `japan`, `spain`, `uae`, `usa`, `world`) | 10 | BLOCKED | Withhold from a public release until original source and redistribution rights are evidenced. A versioned Natural Earth public-domain layer or credited amCharts map is only REPLACEABLE after identifier, interaction and boundary-policy review. |
| Existing `data.js` geography and candidate/pilot map assets | 2 sets | BLOCKED | Candidate/pilot remains excluded from production; do not activate while its geographic and policy gates are unresolved. |

### CP05 amCharts source snapshots (2026-11-05)

`candidate/amcharts/source/` contains three unmodified, high-detail source SVGs retrieved from their respective amCharts download URLs. Their exact SHA-256 values, source pages, path counts, path-ID-to-question mappings, explicit noninteractive context paths and required attribution are pinned in `candidate/amcharts/manifest.json` and checked by `tests/cp05-amcharts-candidates.test.cjs`.

| Scope | Source SVG | Coverage result | Required handling |
|---|---|---|---|
| China | `chinaHigh.svg` | 33 configured questions map to 33 source paths; `CN-TW` is explicit context. | Keep the embedded amCharts credit and CC BY 4.0 attribution; do not infer a boundary or sovereignty policy. |
| Spain | `spainHigh.svg` | 17 configured questions map to 17 source paths, with explicit Spanish/English aliases. | Keep the embedded amCharts credit and CC BY 4.0 attribution. |
| UAE | `uaeHigh.svg` | Seven configured emirates map to seven source paths; `OM-MU`, `AE-NZ1`, and `AE-NZ2` are explicit context. | Never silently delete or score those three paths; retain attribution and obtain feature/policy review before promotion. |

The amCharts source pages inspected on 2026-11-05 state that individual SVG downloads are usable under CC BY 4.0, including commercial projects, when the amCharts credit is kept. These snapshots remain candidate-only: `candidate/` is not copied to `dist`, precached or loaded by the live game. This clears none of the inherited `svg/china.svg`, `svg/spain.svg` or `svg/uae.svg` provenance, and does not relax the public-beta gate.

# Asset provenance — follow-up 2026-10-31

Evidence describes the inspected files and current upstream statements, not a legal opinion or a blanket clearance. The workspace is not identical to the remote checkout. Verify the exact asset version, acquisition and applicable terms before release, retain required notices, and replace assets whose provenance cannot be established.

| Asset | Evidence | Release action |
|---|---|---|
| Application code | Workspace README asserts MIT but has no LICENSE. Separate GitHub `main` checkout at `e161914d3dfe4883282d4140c85ec9d017a05a2f` includes MIT License, copyright 2026 Anurag Srivastava. Workspace code differs in five JS files, HTML and CSS. | Confirm authorship and rights for local differences; preserve applicable MIT notice and determine whether third-party code is incorporated. |
| 16 country SVGs | Embedded Simplemaps copyright and license URL in argentina, egypt, france, greece, india, indonesia, italy, mexico, nigeria, pakistan, russia, south_africa, south_korea, thailand, turkey and vietnam. [SimpleMaps terms](https://simplemaps.com/resources/svg-license) describe website/software use and restrict unmodified redistribution of its maps as a collection. | Check original downloads, modifications and intended distribution against the terms; retain notices. |
| Six continent SVGs | africa, asia, europe, north_america, south_america, oceania contain an amCharts namespace and metadata; this suggests, but does not prove, their source. [amCharts SVG maps](https://www.amcharts.com/svg-maps/) states its free maps require credit. | Match exact files to upstream and verify relevant version/terms; credit as required or replace. Namespace alone is not a license. |
| Other 10 SVGs | No matching SimpleMaps/amCharts marker found by the audit search. World and country maps include metadata/labels but no verified author or terms. | Trace original sources and license/attribution; replace if unverified. |
| Flag images | `modes.js` requests Twemoji 14.0.2 PNG files from cdnjs. [Twemoji upstream](https://github.com/twitter/twemoji#license) identifies graphics as CC BY 4.0 and code as MIT; its README describes attribution. | Verify exact CDN package/version and attribution, add notices as needed, handle network failure. |
| Font | Google Fonts Poppins import in `css/variables.css`. [Poppins license in Google Fonts](https://github.com/google/fonts/blob/main/ofl/poppins/OFL.txt) identifies SIL OFL 1.1. | Verify exact delivered files and obligations before bundling; include appropriate notices. |
| Icons | HTML Unicode/emoji, system glyphs; SVG progress ring and hero illustration constructed in app. Platform glyph appearance and licensing are external; no icon library identified. | Verify any substituted artwork and accessible labels; do not assume font glyph rights cover redistribution. |
| Sounds | `audio.js` embeds short WAV data URIs and synthesizes Web Audio tones; no origin record for embedded WAV. | Confirm authorship of WAV data or replace with documented generated sounds. |
| Screenshots | Eight bundled PNGs described by README, not loaded by app. No creator/source statement. | Confirm ownership and permissions for any published images. |
| Geography and flags data | `data.js` has no documented dataset provenance or factual review. SVG aliases may derive from several providers. | Record authoritative sources, versions, licensing, boundaries and naming decisions before release. |
| Third-party code | No package manifest; static code contains no detailed attribution or source inventory. | Review history and author records; identify any copied snippets and comply with their terms. |

Git history was inspected for the map filename; commit `15503f3` renames the North America SVG, but does not establish authorship of its geometry. All unresolved third-party assets remain release risks.

## CP01 consolidation

Consolidation: the candidate retains the remote MIT LICENSE, but this does not independently clear audited changes or third-party assets. Trace or replace unresolved assets before public release (CP07/12).

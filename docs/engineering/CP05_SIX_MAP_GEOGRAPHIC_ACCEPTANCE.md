# CP05 six-map geographic acceptance record

**Status:** PARTIAL — candidates remain quarantined.  
**Effective date:** 2026-11-05.  
**Applies to:** `candidate/admin1/{australia,brazil,canada,germany,japan,usa}.svg` only.

This is an evidence record, not an approval to register any map. The source
archive, candidate checksums, question mappings, source IDs, topology results,
and Brazil repair attestation remain canonical in
[`candidate/admin1/manifest.json`](../../candidate/admin1/manifest.json) and
the [CP05 release-blocker triage](CP05_RELEASE_BLOCKER_TRIAGE.md).

## Method and common limits

1. The candidate input is Natural Earth Admin-1 5.1.1, public domain, pinned
   to archive SHA-256
   `efc59726337323058f9446210adc96673179cd344e053666ee3d28cb58ba2b05`.
   Natural Earth's terms record its public-domain status; attribution is
   optional.
2. Each candidate question key was matched to a source feature by the
   manifest's recorded name/ID mapping. This confirms the game contract has
   the expected number of unique targets; it does not turn a Natural Earth ID
   into an official national identifier.
3. National authorities below independently support the administrative scope,
   names, or recorded exclusions. Except for the Goiás measurement, this pass
   did not obtain a version-pinned, coordinate-level authority dataset for all
   units. It therefore cannot assert line-for-line boundary equivalence.
4. The review-only package at
   [`candidate/admin1/review/`](../../candidate/admin1/review/README.md)
   concentrates the visual review on tiny, island, and multipart cases. It is
   outside every production path.

## Independent comparison matrix

### Founder policy resolution: Macquarie Island

**RESOLVED — 2026-11-04.** MapMaster assigns Macquarie Island to the Tasmania
gameplay target, following Australian administrative jurisdiction rather than
the ABS statistical `Other Territories` classification. Existing question
identity, candidate geometry, and accessibility fallbacks remain unchanged.
This resolves only that ownership policy; it does not make Australia verified,
promote an asset, or relax the CP05 public-beta gate.

| Candidate | Authority and version/date                                                                                                                                                                                                                                                                     | Licensing use                                                                           | Identifier / coverage method                                                                                                                                                                                                                                     | Meaningful discrepancy or limit                                                                                                                                                                                                                                                                                                 | Automated geographic result |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| Australia | [ABS ASGS Edition 3, 2021–2026](https://www.abs.gov.au/statistics/standards/australian-statistical-geography-standard-asgs/edition-3-july-2021-june-2026/main-structure-and-greater-capital-city-statistical-areas/australia-and-stateterritory); NSW Lord Howe and Tasmania Macquarie records | Scope verification only; not used to derive SVG paths                                   | 8/8 question keys; 10 selected components. `AU-ACT`, `AU-NSW`, `AU-NT`, `AU-QLD`, `AU-SA`, `AU-TAS`, `AU-VIC`, `AU-WA` recorded in manifest. ABS identifies the eight states/territories; component records keep Lord Howe with NSW and Macquarie with Tasmania. | Coordinate overlay and visual confirmation of the two remote islands still needed. Jervis Bay and Ashmore/Cartier remain outside the eight questions.                                                                                                                                                                           | **PARTIAL**                 |
| Brazil    | [IBGE Goiás UF 2024 archive](https://geoftp.ibge.gov.br/organizacao_do_territorio/malhas_territoriais/malhas_municipais/municipio_2024/UFs/GO/GO_UF_2024.zip), 2024                                                                                                                            | Independent validation only; no IBGE geometry is redistributed or used in candidate SVG | 27/27 candidate names and feature mappings; Goiás `BRA-1294` compared as valid IBGE vs valid rendered candidate                                                                                                                                                  | Goiás IoU is **0.9740752215706935** and Hausdorff distance **0.1824711046560697°**. The small area delta from repair proves ring cleanup, but the inter-dataset difference can arise from source vintage/resolution or a real location difference. Without a dated all-state official overlay it is not accepted as equivalent. | **PARTIAL**                 |
| Canada    | [Statistics Canada 2021 Boundary Files Reference Guide](https://www150.statcan.gc.ca/n1/pub/92-160-g/92-160-g2021001-eng.htm)                                                                                                                                                                  | Scope and metadata verification only                                                    | 13/13 province/territory questions; Natural Earth source IDs are recorded separately. StatsCan explains province/territory identifiers and official boundary-file metadata.                                                                                      | 434 candidate polygon parts make Nunavut, British Columbia, and Newfoundland and Labrador mandatory visual checks. This record does not claim Natural Earth coastline equality with Statistics Canada 2021 boundaries.                                                                                                          | **PARTIAL**                 |
| Germany   | [BKG VG250 01.01.2026 archive](https://daten.gdz.bkg.bund.de/produkte/vg/vg250_ebenen_0101/aktuell/vg250_01-01.utm32s.shape.ebenen.zip) and [Destatis Länder list](https://www.destatis.de/DE/Methoden/abkuerzung-bundeslaender-DE-EN.html) | BKG `dl-de/by-2-0`, validation only; no geometry redistributed | 16/16 Länder map to unique manifest question keys and `DE-*` source subdivision codes. | Official BKG partial is not extractable or checksum-valid, so no coordinate comparison is admitted. Bremen and Schleswig-Holstein still require visual review. | **BLOCKED** |
| Japan     | MLIT National Land Numerical Information N03, 2024; pinned SHA-256 is in `comparison/sources.json` | Validation only; no MLIT geometry is used to derive candidate SVG paths | 47/47 Japanese `N03_001` prefecture names, `N03_007` codes, candidate question keys, and candidate Natural Earth source IDs are unique. Six hash-attested Natural Earth components were reassigned from Okinawa to Kagoshima. | Tokyo and residual Okinawa/Kagoshima islands/coastline generalisation still produce material multipart and area differences. | **PARTIAL** |
| USA       | [U.S. Census cartographic-boundary documentation, 2024](https://cdntest.test.census.gov/programs-surveys/geography/technical-documentation/naming-convention/cartographic-boundary-file.html)                                                                                                  | Scope/caveat verification only                                                          | 50/50 state keys; `USA-3556` / District of Columbia deliberately excluded. Alaska, Hawaii, and Maine selected for multipart review.                                                                                                                              | Census says cartographic boundary files are simplified, may omit small areas, and are unsuitable for precise geographic relationships. They cannot validate exact candidate geometry; DC/territory policy remains intentional.                                                                                                  | **PARTIAL**                 |

### Brazil Goiás: what the 0.974075 IoU establishes

The candidate repair is constrained to an exact Natural Earth 5.1.1 WKB input
and an exact GEOS 3.14.1 `MakeValid` output. It removes the self-intersection
without adding coordinates and changes area by only
`7.105427357601002e-15` square degrees. The repaired candidate is topologically
valid.

IBGE 2024 is independent (valid archive SHA-256
`32556057bbbbe00fbe8555a9241544de7e776239ef2c3a4caa47bb6f5286bca6`), not a
replacement source. Its 0.974075 IoU is high enough to show broadly
corresponding Goiás coverage, but it is below an evidence-free equivalence
threshold. Natural Earth 5.1.1 and IBGE 2024 differ in scale, generalisation,
and possibly effective date. A reviewer must inspect the difference geometry
against a versioned official national boundary source before accepting the
candidate; the repair is **not** promoted merely because it is valid.

## Question-ID versus rendering conclusions

All six manifests have unique question keys and source IDs at the required
coverage: Australia 8 (10 source components), Brazil 27, Canada 13, Germany
16, Japan 47, USA 50. Candidate SVG groups carry the same question key and
source ID, so the CP04 adapter can route answers without treating display
projection as geography. The fixed `0 0 1000 700` SVG viewBox and responsive
scaling change on-screen appearance, not source topology. A tiny or remote
component can still be visually under-represented; that is why the package
selects it for manual review and why automated keyboard reachability is not a
substitute for touch or screen-reader QA.

## Required manual acceptance before any promotion

- Review each starred target in the local package against the linked authority,
  recording version/effective date and any omitted islands, boundary shifts, or
  label mismatch.
- Obtain/reconcile a legally usable, version-pinned coordinate reference for
  every country where a reviewer needs geometry equivalence rather than scope
  validation. Do not substitute a simplified cartographic file for a precise
  boundary decision.
- Test actual iOS and Android PWA touch hit targets, zoom/pan/reset, VoiceOver,
  and TalkBack. Existing automated CP04 keyboard/mobile-viewport evidence does
  not cover physical-device accessibility.
- Obtain founder sign-off for remaining CP05 geographic-policy issues recorded
  in the triage; the Macquarie→Tasmania ownership decision is already resolved.

Until then, all six assets retain `live_approved: false`, remain outside the
registry and production build, and the CP05 public-beta gate must fail closed.

## Final automated comparison pass (2026-11-04)

The reusable validation-only utility
[`compare-cp05-admin1-authorities.py`](../../tools/compare-cp05-admin1-authorities.py)
normalises human-readable names, unions multipart features, validates both
geometries, and records area, intersection/union, two-way coverage and
Hausdorff distance. Input data were normalised to geographic coordinates and
topology-preservingly simplified at `0.005°` on both sides before metrics were
calculated. That processing resolution is a reproducibility choice, **not** an
acceptance threshold. The utility deliberately has no automatic pass cutoff.

| Scope     | Authority comparison source, version and licence                                                                                   | SHA-256                                                                                          | Quantitative result                                                                                                                                                                                                                                                                                                                                                                  | Automated conclusion                                                                                                                                                                                                                                                                                            |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Australia | ABS ASGS State/Territory 2021 REST geometry; CC BY 4.0, validation only                                                            | `c4ba682502849c56c3c14f4246dfa1f95fb5db3f1f8ba27dc478839be1b751b9`                               | 8/8 mapped units valid and compared; IoU range `0.921494–0.996294`, mean `0.981662`. `Other Territories` is an unmatched authority unit. Tasmania has Hausdorff distance `15.827853°`.                                                                                                                                                                                               | **PARTIAL** — Macquarie→Tasmania ownership is founder-resolved; the ABS statistical mismatch remains documented and ACT's `0.921494` is still a small-target/generalisation review item.                                                                                                                        |
| Brazil    | IBGE 2024 UF archives (`{UF}_UF_2024.zip`); validation only                                                                        | 27 archive hashes in [`comparison/sources.json`](../../candidate/admin1/comparison/sources.json) | 27/27 names matched, valid and compared. IoU `0.912374–0.991102`, mean `0.970805`; maximum Hausdorff `8.601490°`. Lowest: Acre `0.912374`, DF `0.943258`, Rio Grande do Sul `0.954166`. Goiás retains its pinned source-preserving repair; its exact repair area delta remains `7.105427357601002e-15` deg².                                                                         | **PARTIAL** — coverage/validity is now complete, but these metrics cannot by themselves certify source-vintage equivalence or resolve material low-IoU/boundary-distance review.                                                                                                                                |
| Canada    | Statistics Canada 2021 _Digital_ Province/Territory boundary REST geometry; Open Government Licence–Canada; publication 2022-09-21 | `0c853d8d1e5bbae86babe5bd706cae86a12f84551308a92a4d4740e483b3e270`                               | 13/13 valid and name-matched; IoU range `0.383907–0.998642`, mean `0.825879`. Candidate coverage of reference is low for Nunavut `0.384203` and NWT `0.410912`, while reference coverage of candidate remains `0.997992` and `0.996634`.                                                                                                                                             | **PARTIAL** — the official digital file includes coastal water whereas the Natural Earth candidate is effectively land/coastline geometry. Its low IoU measures extent semantics, not a demonstrated missing-candidate boundary. The land-only cartographic endpoint did not return within the bounded request. |
| Germany   | BKG VG250 `utm32s.shape.ebenen.zip`, 01.01.2026, `dl-de/by-2-0`; validation only | Published MD5 `19abb1eda644eea121ac037ca3c12e46` | One bounded official HTTP-range resume left a 38,312,449-byte partial with MD5 `d715678a253f88da77015ab592714176`; ZIP integrity failed because the end-of-central-directory is absent. 0/16 coordinate comparisons are admitted. | **BLOCKED** — delivery/access failure, not a candidate failure. No further retries or third-party substitute were used. |
| Japan     | MLIT National Land Numerical Information N03 administrative areas, 2024; validation only and publisher attribution/terms retained | `a03111be0fe726ff270cbc1dd16f38bc926cf814e67c8cd2e52157629d138b98` | 122,031 valid municipal records were checked. All 47 raw unions and all 47 simplify-before-union comparison geometries are valid; 47/47 names/administrative IDs match and no source feature became empty/invalid. After the source-preserving Amami reassignment, IoU is `0.733234–0.971931`, mean `0.906216`; maximum Hausdorff remains `6.587904°`. Okinawa changes `0.515776→0.753732`; Kagoshima `0.795907→0.885321`; Tokyo remains `0.733234`. Hyōgo is valid at source/raw-union and comparison stages, but the historical post-union simplification alone is invalid (`Nested shells`). | **PARTIAL** — a proven cross-prefecture association was corrected in the quarantined candidate. Island/coastline/generalisation and multipart discrepancies still require human geography and device review; no automatic threshold is asserted. |
| USA       | U.S. Census 2024 1:500,000 Cartographic Boundary states; federal source, validation only                                           | `3e81cbb6cf5f60d9b01ef3e730afa14d61ce5f784252a0b33a696135e71447bc`                               | 50/50 valid and name-matched; IoU range `0.597183–0.998563`, mean `0.969802`. The source has six unmatched non-state/state-equivalent units: AS, MP, DC, GU, PR, VI. Candidate coverage of Michigan is `0.998407` while its area is `67.0267%` larger.                                                                                                                               | **PARTIAL** — DC/territory exclusion is deliberate. Michigan/Wisconsin/Great Lakes differences reflect water/coastline treatment and the Census file's documented small-scale generalisation; they cannot certify exact boundary identity.                                                                      |

The following authority facts make the comparison mode explicit: ABS exposes the
2021 S/T service and licenses its site material under CC BY 4.0; Statistics
Canada records the digital file as EPSG:3347 and Open Government Licence–Canada;
and the Census describes its cartographic files as simplified, shoreline-clipped
small-scale products that may omit small parts. These sources are used only for
validation in this repository.

### Automated discrepancy routing

- **Australia:** Macquarie→Tasmania gameplay ownership is founder-resolved.
  Retain the current mapping; separately complete mainland/island visual and
  interaction review. Do not infer broader ABS policy from this decision.
- **Brazil:** review the named low-IoU/distance outliers against source vintage
  and official boundary presentation; 27/27 comparison coverage is complete.
- **Canada:** rerun against the official land-only cartographic layer once its
  endpoint/archive is available; retain the digital comparison as evidence of
  water-extent semantics only.
- **Germany:** BKG must provide a complete, checksum-verifiable official archive
  or approve the validation host. The `403`, incomplete original download, and
  one bounded failed range-resume are recorded; 0/16 geometry comparisons are
  asserted. **Japan:** Hyōgo's earlier invalidity is isolated to the discarded
  post-union simplification diagnostic. The verified Okinawa→Kagoshima Amami
  reassignment is recorded below; review residual Okinawa/Tokyo/Kagoshima
  overlays for island/coastline and multipart semantics.
- **USA:** review Great Lakes/water treatment against the selected gameplay
  policy; Census cartographic geometry is unsuitable as a precision boundary
  approval source.

The local review page now accepts two local GeoJSON files and draws the
candidate as a translucent blue fill and the authority as a red outline. The
files never leave the browser or repository checkout, so these validation-only
sources are not bundled with MapMaster.

### Japan Okinawa → Kagoshima component correction (2026-11-05)

The triage finding was independently confirmed against the pinned MLIT N03 2024
comparison geometry: each listed whole Natural Earth `JPN-3502` polygon has
zero overlap with MLIT Okinawa (`N03_001` `沖縄県`, `N03_007` `47000`) and its
only Japanese prefectural authority overlap is MLIT Kagoshima (`N03_001`
`鹿児島県`, `N03_007` `46000`). This is an administrative-assignment error, not
a water or coastline-treatment difference. The transformation moves only those
unchanged Natural Earth polygons to `JPN-3501` / `japan:018`; it does not copy,
clip, or otherwise derive any candidate coordinate from MLIT.

| NE `JPN-3502` polygon index | Exact source WKB SHA-256 | Bounds (°E, °N) | MLIT Kagoshima intersection (deg²) |
| ---: | --- | --- | ---: |
| 7 | `77cef780b3b31304a939f7b3e935d6600a6580569d767e5c3b0b59f009b40f7d` | `128.525157–128.706879`, `27.350735–27.454820` | `0.005186110` |
| 8 | `d1db188558eaf25c419ee93f6a797cb5724fc3c37861dd9f0a07cbee0ef9b58e` | `128.878917–129.029633`, `27.681383–27.914130` | `0.018765528` |
| 9 | `d1da7a5f8b1cbe6e450b84a7d1a23abe9344523fb50ccdf7ce269b4655d880a1` | `129.180837–129.350434`, `28.077094–28.195461` | `0.005465988` |
| 10 | `c98e1cc1e25991b9b2bdd73e447847a5cadf87045c34368bd08d7dc69f75a853` | `129.913585–130.031016`, `28.283759–28.373481` | `0.003824618` |
| 11 | `d1fa40e7eb9183a72062370055837cbd599c5a405c519261e751eb0289f7e811` | `129.145763–129.721690`, `28.119574–28.509833` | `0.057525867` |
| 16 | `57f756470b7b5a060bf80a7791062deae3fc87564ec479d25a8b3f2fb0260460` | `128.396251–128.454845`, `27.020697–27.066474` | `0.001723742` |

`tools/generate-cp05-admin1-candidates.py` attests the six source hashes in
the candidate manifest. For a metrics fixture that had already been
topology-preservingly simplified, `reassign-cp05-japan-candidate-components.py`
first matched each source component uniquely (source-to-metric IoU range
`0.846919–0.977530`) before moving the existing candidate component. The
resulting 47-way output is
[`japan-mlit-n03-2024.json`](../../candidate/admin1/comparison/japan-mlit-n03-2024.json).

Before/after: Okinawa changes from 29 to 23 parts and IoU
`0.515776→0.753732`; Kagoshima changes from 13 to 19 parts and IoU
`0.795907→0.885321`; Tokyo is unchanged at `0.733234`. Both candidate and MLIT
geometries remain valid for all 47 prefectures, none are missing or empty, and
the reassigned Okinawa↔Kagoshima cross-authority overlap is now exactly
`0.0 deg²` in both directions. The existing 63 small adjacent-boundary
candidate overlaps are bit-for-bit unchanged (total `0.0114121424 deg²`), so
the correction introduced no new overlap defect. Japan remains **PARTIAL**:
Tokyo's remote islands and remaining island/coastline/device review are still
open.

## Final discrepancy triage (2026-11-04)

This is a human-review queue derived only from the source-pinned comparison
records. A local overlay was prepared for each listed country with candidate,
authority, candidate-only, and authority-only layers; it is a temporary
validation artefact outside the repository and production build. It does not
make a numerical metric an acceptance threshold or license a geometry change.

| Country | Affected units and quantified discrepancy | Evidence-based classification | Review action and acceptance blocker |
| --- | --- | --- | --- |
| Japan | **Corrected Okinawa / Kagoshima:** six `JPN-3502` whole components formerly produced `0.091302 deg²` of Okinawa-candidate-only overlap with MLIT Kagoshima. They now produce `0.0 deg²` cross-authority overlap in either direction. Okinawa IoU is `0.753732` (from `0.515776`); Kagoshima is `0.885321` (from `0.795907`). **Tokyo:** unchanged at IoU `0.733234`, Hausdorff `6.587904°`; tiny MLIT-only remote components near `136.070°E, 20.423°N` are absent from the candidate. Other material metrics: Nagasaki `0.825524`, Osaka `0.826683`, Kagawa `0.847883`, Kanagawa `0.866696`, Fukui `0.872133`. | MLIT `N03_001`/`N03_007` proves the six source components belong to Kagoshima (`鹿児島県`/`46000`), not Okinawa (`沖縄県`/`47000`); the correction is hash-attested and source-preserving. Tokyo's distance is driven by omitted/very-small remote MLIT components plus mainland boundary generalisation. The remaining named units show island fragmentation or adjoining-border generalisation; the metrics do not prove a wrong question identity. | Retain the recorded reassignment and inspect Tokyo remote components plus Kagoshima's `128.400°E, 27.035°N` authority components for omitted islands. **Blocker:** no prefectural asset is geographically accepted until residual island/coastline and physical-device review is complete. |
| Brazil | **Acre:** IoU `0.912374`, candidate `6.121%` smaller, coverage `0.924976/0.985287`; a contiguous authority-only section is material and inland. **Federal District:** `0.943258`, Hausdorff `0.031529°`, a small-target boundary/generalisation case. **Rio Grande do Sul:** `0.954166`, candidate `3.393%` smaller, Hausdorff `1.060605°`. **Rio Grande do Norte:** `0.964922`, but Hausdorff `8.601490°` from a remote candidate component outside the IBGE comparison extent. Amapá (`0.965127`) and Sergipe (`0.957904`) remain secondary boundary reviews. Goiás remains the separately attested repair (`0.9740752215706935` exact repair comparison; valid topology and negligible repair-area delta). | All 27 names/IDs match, so this pass found no state-identity or question-mapping loss. Acre and Rio Grande do Sul are not water-only discrepancies and cannot be attributed to source vintage or an actual border defect from metrics alone. DF is proportionally sensitive because it is small. RN is an offshore-component scope/association question, not proof that its mainland is misidentified. | Use the existing IBGE overlays for Acre, RS, DF, RN and AP; record border/coast/remote-component treatment against the dated source before any map replacement. Preserve Goiás's checksum-linked repair exactly. **Blocker:** material inland or offshore differences require visual acceptance; numerical overlap alone cannot approve a state boundary. |
| Australia | **Tasmania:** IoU `0.964768`, Hausdorff `15.827853°`; the distant candidate-only component at `158.832–158.962°E, 54.750–54.469°S` is Macquarie Island. **ACT:** `0.921494`, small-target/generalisation case. NSW (`0.995714`) retains Lord Howe and Queensland (`0.996036`, Hausdorff `1.385643°`) retains island/coastline variation. | Tasmania's large distance is the expected ABS statistical `Other Territories` difference, not an administrative-error signal: the founder rule assigns Macquarie to Tasmania for gameplay. The remaining figures are resolution/island review items; no automatic reassignment is supported. | Confirm Macquarie and Lord Howe in the local overlay and on physical touch targets; retain the existing Tasmania rule. **Blocker:** island and device accessibility acceptance, not a new ownership decision. |
| Canada | Nunavut IoU `0.383907` and NWT `0.410343`, but authority coverage of candidate is `0.997992` and `0.996634`; PEI `0.655066`, Nova Scotia `0.747607`, Newfoundland and Labrador `0.791651`, and BC `0.920746` follow the same direction. | The Statistics Canada *Digital* reference is water-inclusive while the Natural Earth candidate is effectively land/coastline geometry. The near-complete authority coverage of candidate and large authority-only water extent classify these as extent semantics, not demonstrated missing candidate territory. | Keep the digital comparison as water-treatment evidence; visually inspect multipart/island reachability for Nunavut, NWT, BC and Newfoundland/Labrador. **Blocker:** no official land-only comparison and no device acceptance; do not infer equivalence. |
| USA | Michigan IoU `0.596720`, candidate/reference coverage `0.998523/0.597247`, candidate area `67.188%` larger. Wisconsin `0.852712` (`16.571%` larger), New York `0.911882` (`7.954%` larger), and Ohio `0.915303` (`8.797%` larger). Michigan's candidate-only Great Lakes area is `11.455255` square degrees versus `0.027166` authority-only. | The overlays place the excess in Great Lakes/water areas while candidate coverage of the Census reference remains `>=0.991848` for all four units. This is coastline/water treatment under a 1:500,000 cartographic file, not proof of a wrong state association. The six unmatched Census state-equivalent units remain the deliberate DC/territory exclusion. | Retain the 50-state scope and current geometry; obtain product approval for water treatment and perform island/device review. **Blocker:** cartographic-source caveat and visual/device acceptance, not a numerical correction. |
| Germany | 0/16 coordinate comparisons. The official BKG VG250 01.01.2026 partial has wrong MD5 and no ZIP end-of-central-directory. | Official comparison is explicitly unavailable; no candidate defect or equivalence conclusion follows. | Later manual acquisition may use the **same official BKG archive** through a BKG-approved/access-enabled host or manual delivery, retaining the published MD5 and passing ZIP integrity before the existing comparator is run. Do not use the retained partial, WFS route, or a third-party substitute. **Blocker:** authoritative source access/integrity. |

### Release-scope recommendation

- **Independently supportable now:** the six configured scopes, their recorded
  question/source IDs, the Brazil Goiás topology attestation, Japan's valid
  MLIT-derived comparison process, and the Macquarie→Tasmania gameplay policy.
  These are evidence records only; they do not approve any candidate SVG for
  production.
- **Still requires visual and device acceptance:** Japan's residual island and
  coastline review after the recorded cross-prefecture correction; Brazil's material state-boundary/offshore cases;
  Australia ACT and remote islands; Canada's multipart land/water presentation;
  and USA Great Lakes/water presentation. Existing browser evidence is retained
  for unchanged CP04 gameplay, but is not physical-device, map-geometry, or
  source-equivalence acceptance.
- **Blocked:** Germany awaits a complete checksum-verifiable BKG archive.
  Every candidate also remains subject to the existing legacy-asset licensing,
  CP05 policy, accessibility, and public-beta gates. `live_approved: false`
  and the fail-closed public-beta build remain mandatory.

# First Geography Release — founder approval checklist

Status: **candidate-only; no approval is recorded by this document.** The interactive, development-only checklist is available at `/?externalGeoPreview=1`. Its canonical, offline proposal data is [`first-geography-release.v1.json`](../release-prep/first-geography-release.v1.json).

Every proposal below is factually ready, technically accepted in the existing ledger, and `pending_founder_approval`. That does **not** make it approved, production eligible, reward eligible, or eligible for CP05 release. Each entry remains `production_eligible: false`.

## Founder action

- [ ] Individual: record a decision for each proposal ID below.
- [ ] Bulk option (unexecuted): approve the reviewed, unambiguous Wikidata + GeoNames set after reviewing every item, its linked evidence, and the attribution obligations below.
- [ ] Keep all 50 OpenTDB records frozen: 38 factually ready, 7 pending, and 5 rejected. None are in this proposal or may enter a release until CC BY-SA attribution/redistribution/ShareAlike review is complete.

All source links and the retrieval date (`2026-11-09`) are in the canonical manifest and the development checklist. Wikidata uses its QID page and frozen `normalized/wikidata.v1.json`; GeoNames uses its GeoNames ID page and frozen `normalized/geonames.v1.json`.

## Country Explorer — 20 proposed facts

| Pending decision / exact player-facing prompt → answer | QID / claim and qualifier | Relevant uncertainty |
| --- | --- | --- |
| [ ] `wikidata:Q79:capital` — What is Egypt's current capital? → Cairo | Q79, P36 | Historical Thinis and Memphis claims preserved; no continent claim. |
| [ ] `wikidata:Q114:capital` — What is Kenya's capital? → Nairobi | Q114, P36 | Multiple languages retained separately. |
| [ ] `wikidata:Q1028:capital` — What is Morocco's capital? → Rabat | Q1028, P36 | Territorial-area conflicts are excluded. |
| [ ] `wikidata:Q1033:capital` — What is Nigeria's current federal capital? → Abuja | Q1033, P36; start 1991-12-12 | Lagos retained as a historical capital. |
| [ ] `wikidata:Q258:capital-roles` — Which capital roles does South Africa use? → Pretoria (administrative), Cape Town (legislative), and Bloemfontein (judicial). | Q258, P36; capital function retained | Multi-role fact, never a singular-capital question. |
| [ ] `wikidata:Q414:capital` — What is Argentina's capital? → Buenos Aires | Q414, P36 | Historical currency separate. |
| [ ] `wikidata:Q155:capital` — What is Brazil's current capital? → Brasília | Q155, P36; start 1960-04-22 | Rio de Janeiro/historical currency separate. |
| [ ] `wikidata:Q16:capital` — What is Canada's capital? → Ottawa | Q16, P36; start 1867-05-15 | English and French not collapsed. |
| [ ] `wikidata:Q96:capital` — What is Mexico's capital? → Mexico City | Q96, P36 | No language or area claim. |
| [ ] `wikidata:Q30:capital` — What is the United States' current capital? → Washington, D.C. | Q30, P36; start 1800-11-17 | New York City/Philadelphia historical; no national-language claim. |
| [ ] `wikidata:Q668:capital` — What is India's capital? → New Delhi | Q668, P36 | Language legal context and highest-point claims excluded. |
| [ ] `wikidata:Q252:capital` — As of the reviewed evidence date, which city is listed as Indonesia's capital? → Jakarta | Q252, P36; start 1950-08-17, as-of 2026-11-09 | Nusantara/historic capitals retained; never undated single-role gameplay. |
| [ ] `wikidata:Q17:capital` — What is Japan's current capital? → Tokyo | Q17, P36; start 1943-01-01 | Historic capitals and dated area claims separate. |
| [ ] `wikidata:Q869:capital` — What is Thailand's capital? → Bangkok | Q869, P36; start 1767-01-01 | Start qualifier retained in provenance. |
| [ ] `wikidata:Q183:capital` — What is Germany's current capital? → Berlin | Q183, P36; start 1999-01-01, federal-capital role | Bonn/currency/area claims separate. |
| [ ] `wikidata:Q233:capital` — What is Malta's capital? → Valletta | Q233, P36 | Currency history separate. |
| [ ] `wikidata:Q20:capital` — What is Norway's capital? → Oslo | Q20, P36 | Territorial/continental scope excluded. |
| [ ] `wikidata:Q45:capital` — What is Portugal's current capital? → Lisbon | Q45, P36; start 1385-01-01 | Coimbra and escudo history separate. |
| [ ] `wikidata:Q408:capital` — What is Australia's current capital? → Canberra | Q408, P36; start 1927-05-09 | Melbourne/currency/territory claims separate. |
| [ ] `wikidata:Q664:capital` — What is New Zealand's current capital? → Wellington | Q664, P36; start 1865-01-01 | Earlier capitals/currency/continental scope separate. |

## City Challenge — 15 proposed questions

| Pending decision / exact player-facing prompt → answer | GeoNames ID / retained class-code | Relevant uncertainty |
| --- | --- | --- |
| [ ] `geonames:360630:city` — Which reviewed city is at 30.06263, 31.24967? → Cairo | 360630, P/PPLC | No country inference. |
| [ ] `geonames:184745:city` — Which reviewed city is at -1.28333, 36.81667? → Nairobi | 184745, P/PPLC | No country inference. |
| [ ] `geonames:2332459:city` — Which reviewed city is at 6.45407, 3.39467? → Lagos | 2332459, P/PPLA2 | City identity, not current-capital claim. |
| [ ] `geonames:6094817:city` — Which reviewed city is at 45.41117, -75.69812? → Ottawa | 6094817, P/PPLC | No country inference. |
| [ ] `geonames:3530597:city` — Which reviewed city is at 19.42847, -99.12766? → Mexico City | 3530597, P/PPLC | No constitutional-status inference. |
| [ ] `geonames:3435910:city` — Which reviewed city is at -34.61315, -58.37723? → Buenos Aires | 3435910, P/PPLC | No country inference. |
| [ ] `geonames:3469058:city` — Which reviewed city is at -15.77972, -47.92972? → Brasília | 3469058, P/PPLC | No country inference. |
| [ ] `geonames:1261481:city` — Which reviewed city is at 28.62137, 77.2148? → New Delhi | 1261481, P/PPLC | No broader Delhi/territory inference. |
| [ ] `geonames:1850147:city` — Which reviewed city is at 35.6895, 139.69171? → Tokyo | 1850147, P/PPLC | No country inference. |
| [ ] `geonames:1609350:city` — Which reviewed city is at 13.75398, 100.50144? → Bangkok | 1609350, P/PPLC | No country inference. |
| [ ] `geonames:1642911:city` — Which reviewed city is at -6.21462, 106.84513? → Jakarta | 1642911, P/PPLC | Capital-transition evidence remains separate and dated. |
| [ ] `geonames:2950159:city` — Which reviewed city is at 52.52437, 13.41053? → Berlin | 2950159, P/PPLC | No country inference. |
| [ ] `geonames:2267057:city` — Which reviewed city is at 38.72509, -9.1498? → Lisbon | 2267057, P/PPLC | No country inference. |
| [ ] `geonames:2172517:city` — Which reviewed city is at -35.28346, 149.12807? → Canberra | 2172517, P/PPLC | No country inference. |
| [ ] `geonames:2179537:city` — Which reviewed city is at -41.28664, 174.77557? → Wellington | 2179537, P/PPLC | No country inference. |

## Geographic-feature learning — 15 proposed questions

| Pending decision / exact player-facing prompt → answer | GeoNames ID / retained class-code | Relevant uncertainty |
| --- | --- | --- |
| [ ] `geonames:1283416:feature` — Which reviewed geographic feature is at 27.98791, 86.92529? → Mount Everest | 1283416, T/MT | No country, border, ownership, or sovereignty inference. |
| [ ] `geonames:157452:feature` — Which reviewed geographic feature is at -3.07583, 37.35333? → Mount Kilimanjaro | 157452, T/MT | Identity only; no country inference. |
| [ ] `geonames:1864094:feature` — Which reviewed geographic feature is at 35.3607, 138.72773? → Mount Fuji | 1864094, T/VLC | Identity only; no country inference. |
| [ ] `geonames:3181986:feature` — Which reviewed geographic feature is at 45.833, 6.864? → Mont Blanc | 3181986, T/MT | Never a single-country summit-ownership claim. |
| [ ] `geonames:3866949:feature` — Which reviewed geographic feature is at -32.65383, -70.01141? → Aconcagua | 3866949, T/MT | Identity only; no country inference. |
| [ ] `geonames:2212709:feature` — Which reviewed geographic feature is at 26, 13? → Sahara | 2212709, T/DSRT | No country code; no territorial scope. |
| [ ] `geonames:3407729:feature` — Which reviewed geographic feature is at -0.16667, -49? → Amazon River | 3407729, H/STM | Raw name “Amazone River”; English selection label retains mismatch flag. |
| [ ] `geonames:2031269:feature` — Which reviewed geographic feature is at 44.00109, 105.01179? → Gobi Desert | 2031269, T/DSRT | Identity only; no country inference. |
| [ ] `geonames:791630:feature` — Which reviewed geographic feature is at 45.33333, 29.66667? → Danube River | 791630, H/STM | No length, source, or sovereignty claim. |
| [ ] `geonames:2164628:feature` — Which reviewed geographic feature is at -17.98722, 146.76979? → Great Barrier Reef | 2164628, H/RF | Identity only; no country inference. |
| [ ] `geonames:7645281:feature` — Which reviewed geographic feature is at -25.34434, 131.03282? → Uluru | 7645281, T/RK | Alternative names retained; no erasure. |
| [ ] `geonames:879432:feature` — Which reviewed geographic feature is at -17.91933, 25.85051? → Victoria Falls | 879432, H/FLLS | Transboundary feature; preserve local names/non-singular national framing. |
| [ ] `geonames:148996:feature` — Which reviewed geographic feature is at -1, 33? → Lake Victoria | 148996, H/LK | Raw name “Victoria”; conventional English label retains mismatch flag. |
| [ ] `geonames:5296392:feature` — Which reviewed geographic feature is at 36.11276, -113.99607? → Grand Canyon | 5296392, T/VAL | Identity only; no country inference. |
| [ ] `geonames:351036:feature` — Which reviewed geographic feature is at 30.16196, 31.14946? → Nile | 351036, H/STM | No length, source, or country-ownership claim. |

## Attribution and release blockers

| Source | Attribution / license direction | Remaining blocker |
| --- | --- | --- |
| Wikidata | Frozen QIDs, query evidence, retrieval dates, and source links must remain available; Wikidata structured data is CC0. | Explicit founder decision for each proposed claim; normal CP05 and release eligibility checks after approval. |
| GeoNames | GeoNames data is CC BY 4.0: show attribution, a license link, and any modification indication wherever redistributed. | Explicit founder decision plus a production attribution placement check. |
| OpenTDB | Treat OpenTDB-derived questions as candidate-only pending attribution, redistribution, and CC BY-SA ShareAlike analysis. | Legal clearance; all 50 frozen out of production, including 5 rejected. |

No checklist state in this report or preview changes the factual-review ledger, human approval, gameplay approval, release gates, CP04 scoring, CP05, CP10, Firebase, offline PWA, or production bundles.

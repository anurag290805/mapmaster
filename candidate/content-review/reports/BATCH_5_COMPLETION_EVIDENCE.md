# Completion review — remaining 52 records

This durable completion batch follows Batches 1–4 without re-acquiring or changing any snapshot. It reviews each remaining stable identity against the frozen record first and then the linked independent evidence. `READY_FOR_HUMAN_APPROVAL` is an analyst factual finding only; every record remains technically accepted, `human_content_approval: pending_review`, `gameplay_approval: not_approved`, and excluded from CP04, CP05, CP10, Firebase, cloud saves, and production builds.

## Method and source key

- Frozen evidence, source IDs, hashes, qualifiers, source URLs and retrieval dates remain in `raw/` and `normalized/`; this report does not amend them.
- `GN/<id>` means the immutable GeoNames detail URL `https://www.geonames.org/<id>/`; it confirms the source identity, not an independent factual conclusion.
- Independent institutional reference sets: [UNESCO World Heritage](https://whc.unesco.org/), [US National Park Service](https://www.nps.gov/), [Parks Australia](https://parksaustralia.gov.au/), [International Commission for the Protection of the Danube River](https://www.icpdr.org/main/danube-basin), [Great Barrier Reef Marine Park Authority](https://www2.gbrmpa.gov.au/learn/reef-facts), [Nile Basin Initiative](https://nilebasin.org/), [Government of Australia](https://immi.homeaffairs.gov.au/citizenship/test-and-interview/listen-to-podcast/transcript-episode-2), [Government of Thailand](https://www.thailand.go.th/page/capital-city), [Government of Canada](https://www.canada.ca/en/immigration-refugees-citizenship/services/settle-canada/land-climate.html), [Germany’s federal states](https://www.bundesrat.de/EN/federal-states/federal-states-node.html), and [USAGov state governments](https://www.usa.gov/state-governments).
- OpenTDB source evidence for every listed fingerprint is the retained category-22 response at `raw/opentdb-geography.v1.json`; its precise decoded prompt, answer, choices and batch position are preserved in `normalized/opentdb-geography.v1.json`.

## Wikidata — 3 records

1. **Q79 — Egypt — NEEDS_REVIEW.** Cairo, Arabic, Egyptian pound and Mount Catherine are supportable, but P36 retains Thinis and Memphis with ancient date qualifiers and P30 retains Africa plus an Asia qualifier. A current card cannot silently collapse the historic capitals or continental scope. Independent reference: [Egypt State Information Service](https://sis.gov.eg/Story/216310/Egypt?lang=en-us). Policy groups A–C apply.
2. **Q96 — Mexico — NEEDS_REVIEW.** Mexico City and peso are supportable, while P37 lists Spanish, Nahuatl and Yucatec Maya as parallel “official-language” claims and P2046 has two unscope-qualified areas. Mexican federal language status and area scope require a sourced presentation rule rather than a single asserted value. Independent reference: [Mexico City government](https://mexicocity.cdmx.gob.mx/e/about/about-mexico-city/?lang=en). Policy groups A–C apply.
3. **Q869 — Thailand — READY_FOR_HUMAN_APPROVAL.** Bangkok, Thai, baht, Asia, and Doi Inthanon align with the frozen claims; the Bangkok start qualifier is retained rather than treated as an undocumented replacement. Independent reference: [Government of Thailand](https://www.thailand.go.th/page/capital-city).

## GeoNames — 16 records

1. **2267057 — Lisbon — READY_FOR_HUMAN_APPROVAL.** `PPLC`, `PT`, `38.71667,-9.13333` match `GN/2267057`; [Portugal government overview](https://portugal.gov.pt/pt/gc23/portugal/sobre-portugal) supports Lisbon’s current capital role.
2. **2172517 — Canberra — READY_FOR_HUMAN_APPROVAL.** `PPLC`, `AU`, `-35.28346,149.12807` match `GN/2172517`; [Australian Home Affairs](https://immi.homeaffairs.gov.au/citizenship/test-and-interview/listen-to-podcast/transcript-episode-2) identifies Canberra as the capital city.
3. **2179537 — Wellington — READY_FOR_HUMAN_APPROVAL.** `PPLC`, `NZ`, `-41.28664,174.77557` match `GN/2179537`; [New Zealand Government](https://www.govt.nz/browse/engaging-with-government/central-government/) supports the central-government location. No unsupported city fact is added.
4. **1283416 — Mount Everest — NEEDS_REVIEW.** `T/PK`, `27.9881,86.925` identifies the mountain, and [UNESCO’s Sagarmatha page](https://whc.unesco.org/en/list/120/) supports its protected Himalayan context. The source country-code/coordinate representation must not be presented as resolving the Nepal–China summit/border framing; policy groups B and D apply.
5. **157452 — Mount Kilimanjaro — READY_FOR_HUMAN_APPROVAL.** `T/MT`, `-3.06667,37.35` match `GN/157452`; [UNESCO](https://whc.unesco.org/en/list/403/) independently identifies the Tanzanian mountain landscape.
6. **1864094 — Mount Fuji — READY_FOR_HUMAN_APPROVAL.** `T/MT`, `35.36056,138.72778` match `GN/1864094`; [UNESCO](https://whc.unesco.org/en/list/1418/) independently supports the identity.
7. **3181986 — Mont Blanc — NEEDS_REVIEW.** `T/MT`, `45.83263,6.86535` identifies the source feature, but the summit’s France–Italy boundary depiction is not a neutral single-country conclusion. Keep name, coordinates, and source code without inferring sovereignty or country ownership. Policy groups B and D apply.
8. **3866949 — Aconcagua — READY_FOR_HUMAN_APPROVAL.** `T/MT`, `-32.65318,-70.0109` match `GN/3866949`; [Argentina’s national-park information](https://www.argentina.gob.ar/parquesnacionales/aconcagua) supports the mountain identity.
9. **2212709 — Sahara — READY_FOR_HUMAN_APPROVAL.** `T/DSRT`, `23,13` match `GN/2212709`; the review records it only as a desert feature, not as an assertion of a unique country or territorial scope. Independent reference: [UNESCO’s Sahara programme](https://whc.unesco.org/en/activities/185/).
10. **2031269 — Gobi Desert — READY_FOR_HUMAN_APPROVAL.** `T/DSRT`, `42.5,103.5` match `GN/2031269`; [UNESCO’s Great Gobi listing](https://whc.unesco.org/en/list/769/) supports the geographic identity without adding an exclusive-country claim.
11. **791630 — Danube River — READY_FOR_HUMAN_APPROVAL.** `H/STM`, `45.25,28.26667` match `GN/791630`; [ICPDR](https://www.icpdr.org/main/danube-basin) supports the basin/river identity. No unqualified length or sovereignty claim is introduced.
12. **2164628 — Great Barrier Reef — READY_FOR_HUMAN_APPROVAL.** `H/RF`, `-18.28707,147.69922` match `GN/2164628`; [GBRMPA](https://www2.gbrmpa.gov.au/learn/reef-facts) supports the feature identity.
13. **7645281 — Uluru — READY_FOR_HUMAN_APPROVAL.** `T/MT`, `-25.345,131.035` match `GN/7645281`; [Parks Australia](https://parksaustralia.gov.au/uluru/discover/culture/) supports the place and its cultural context. The candidate is not rewritten to erase its source name or alternatives.
14. **879432 — Victoria Falls — NEEDS_REVIEW.** `H/FLLS`, `-17.9243,25.8572` match `GN/879432`; [UNESCO](https://whc.unesco.org/en/list/509/) confirms the transboundary site. Source country coding cannot be used to choose a single national framing, and local names should not be silently omitted. Policy groups B and D apply.
15. **5296392 — Grand Canyon — READY_FOR_HUMAN_APPROVAL.** `T/CNYN`, `36.05443,-112.14011` match `GN/5296392`; [US National Park Service](https://www.nps.gov/grca/index.htm) supports the feature identity.
16. **351036 — Nile — READY_FOR_HUMAN_APPROVAL.** `H/STM`, `30.08333,31.23333` match `GN/351036`; [Nile Basin Initiative](https://nilebasin.org/) supports the transboundary river identity. This decision does not treat a single coordinate as a complete source/length claim.

## Open Trivia DB — 33 records

1. **8e6eaebba9eb — Texas capital/Austin — READY_FOR_HUMAN_APPROVAL.** Correct option is Austin; [Texas state government](https://gov.texas.gov/about/texas-state-symbols) supports it.
2. **32aa847343d1 — Russia time zones/11 — READY_FOR_HUMAN_APPROVAL.** Correct at retrieval date; fact is date-sensitive and should carry an effective-date note if later promoted. [Russian time-zone overview](https://www.timeanddate.com/time/zone/russia) supports the count.
3. **bb190a403183 — Tallinn/Estonia — READY_FOR_HUMAN_APPROVAL.** Correct option is Estonia; [Estonia government](https://www.valitsus.ee/en/republic-estonia) supports the country/capital relationship.
4. **a5f244002224 — Australia states/6 — READY_FOR_HUMAN_APPROVAL.** Correct option is six; [Australian Home Affairs](https://immi.homeaffairs.gov.au/citizenship/test-and-interview/listen-to-podcast/transcript-episode-2) distinguishes six states and territories.
5. **1f0042cb2ae2 — Japan prefectures/True — READY_FOR_HUMAN_APPROVAL.** Awkward grammar is preserved, while `True` is supported by [Statistics Bureau of Japan](https://www.stat.go.jp/english/data/nenkan/73nenkan/1431-02.html).
6. **9fb8d710acf8 — highest mountain/Mt. Everest — READY_FOR_HUMAN_APPROVAL.** Correct conventional answer; [UNESCO](https://whc.unesco.org/en/list/120/) supports the mountain identity. This does not settle the separate border policy.
7. **233a529a2731 — Ōkunoshima/Rabbit Island — NEEDS_REVIEW.** The island’s rabbit association is real, but “huge population” is an undefined and volatile claim; correct spelling/grammar cannot be silently substituted into the frozen item. Source needs a qualified rewrite or exclusion.
8. **9390d2dd0e38 — Svalbard/Longyearbyen — READY_FOR_HUMAN_APPROVAL.** Correct option is Longyearbyen; [Governor of Svalbard](https://www.sysselmesteren.no/en/) supports the administrative context. No sovereignty rule is inferred.
9. **d4e8a3eed4ca — Malta smallest microstate/False — NEEDS_REVIEW.** `False` is conventionally defensible because Vatican City is smaller, but “microstate” is an undefined entity category. Retain the answer and require the entity-definition policy before use.
10. **4a01f9659384 — Mozambique flag/gun — READY_FOR_HUMAN_APPROVAL.** Correct option is Mozambique; its flag includes a rifle. [Mozambique government](https://portaldogoverno.gov.mz/por/Mocambique/Simbolos-Nacionais) is supporting evidence.
11. **488873f50286 — Altaic/controversial — READY_FOR_HUMAN_APPROVAL.** Correct answer is Altaic; the claim is a taxonomy-history question, not a statement that the proposed family is accepted. [Encyclopaedia Britannica](https://www.britannica.com/topic/Altaic-languages) documents the dispute.
12. **74c392b50894 — Cyprus/island — READY_FOR_HUMAN_APPROVAL.** Correct option is Cyprus; [Republic of Cyprus country profile](https://www.gov.cy/en/country-profile/) supports the island identity.
13. **a5ca2537a09e — Greenland capital/Nuuk — NEEDS_REVIEW.** Nuuk is the correct administrative capital, but the prompt’s political-entity framing needs the territorial/entity policy. [Government of Greenland](https://naalakkersuisut.gl/) supports the contemporary administrative context.
14. **bde7d3405837 — Michigan capital/Lansing — READY_FOR_HUMAN_APPROVAL.** Correct option is Lansing; [State of Michigan](https://www.michigan.gov/) supports it.
15. **e4089cfd05ea — Petra/Jordan — READY_FOR_HUMAN_APPROVAL.** Correct option is Jordan; [UNESCO](https://whc.unesco.org/en/list/326/) supports the site.
16. **c27ced3e6492 — largest Japanese island by area/Shikoku — REJECTED.** Demonstrably wrong: Honshu, not Shikoku, is the largest. The retained source answer and all choices remain untouched; [Statistics Bureau of Japan](https://www.stat.go.jp/english/data/nenkan/73nenkan/1431-02.html) supports the correction.
17. **2949f414ac26 — no deserts in Europe/True — REJECTED.** Demonstrably false under ordinary geographic usage: Europe includes desert areas such as Tabernas. The absolute claim is unsuitable even if a narrow desert definition were intended. [Andalusia tourism authority](https://www.andalucia.org/en/almeria-natural-spaces-tabernas-desert) supports the counterexample.
18. **d28781994727 — Space Needle/Seattle — READY_FOR_HUMAN_APPROVAL.** Correct option is Seattle; [Space Needle](https://www.spaceneedle.com/) supports the location.
19. **6e0ea11fc4ce — Akihabara/Electric Town — READY_FOR_HUMAN_APPROVAL.** Correct option is Electric Town; [Tokyo tourism](https://www.gotokyo.org/en/spot/ev176/index.html) supports the name.
20. **e0defdd0293e — Elizabeth Castle — READY_FOR_HUMAN_APPROVAL.** Correct option is Elizabeth Castle; [Jersey Heritage](https://www.jerseyheritage.org/heritage-places/elizabeth-castle) supports it.
21. **b2f925b0e6ac — largest US state/Alaska — READY_FOR_HUMAN_APPROVAL.** Correct option is Alaska by area; [State of Alaska](https://alaska.gov/) supports the state identity. The wording must retain “state” and not expand to territories.
22. **a7d9be7783e0 — longest shared border/Canada–US — READY_FOR_HUMAN_APPROVAL.** Correct conventional land-border answer; [US National Park Service](https://www.nps.gov/places/international-boundary.htm) supports the international boundary. Do not extend it to maritime or all boundary definitions.
23. **c50865d2d035 — German federal states/16 — READY_FOR_HUMAN_APPROVAL.** Correct option is sixteen; [Bundesrat](https://www.bundesrat.de/EN/federal-states/federal-states-node.html) supports it.
24. **b5d384bd8e8d — New Zealand flag stars/4 — READY_FOR_HUMAN_APPROVAL.** Correct option is four; [New Zealand Ministry for Culture and Heritage](https://nzhistory.govt.nz/politics/flags-of-new-zealand) supports it.
25. **87db3549364e — Tenerife air disaster/Tenerife — READY_FOR_HUMAN_APPROVAL.** Correct option is Tenerife; [FAA lesson material](https://www.faa.gov/lessons_learned/transport_airplane/accidents/KLM4805) supports the event location.
26. **45b4fa09cdaa — largest Japanese island/Honshu — READY_FOR_HUMAN_APPROVAL.** Correct option is Honshu. It independently exposes the contradictory `c27…` candidate, which remains rejected.
27. **47aa685c4097 — Costa Rica official language/Spanish — READY_FOR_HUMAN_APPROVAL.** Correct supplied option is Spanish; [Costa Rica government](https://www.presidencia.go.cr/) is retained as independent country context. This finding does not imply that Spanish is the only language used.
28. **b1ea9b0ffdc1 — Kashmir “unknown leadership” — REJECTED.** The source wording is geopolitically misleading and fails to define territory, control, or status. A correct answer choice cannot cure this structural/policy defect. Preserve it for audit only; do not rewrite into a playable question.
29. **5cdb95791498 — Russia time zones/11 — REJECTED.** Semantically duplicates `32aa847343d1` with the same answer and premise. The fingerprint differs, but repeat-content detection quarantines this later duplicate; no source record is deleted.
30. **805357186fe0 — smallest population/Norway — REJECTED.** The source answer is wrong among its own choices: Slovakia’s population is lower than Norway’s. [Statistical Office of Slovakia](https://slovak.statistics.sk/) and [Statistics Norway](https://www.ssb.no/en) support the comparison.
31. **fd394fc531f6 — Suez Canal/Egypt — READY_FOR_HUMAN_APPROVAL.** Correct option is Egypt; [Suez Canal Authority](https://www.suezcanal.gov.eg/English/Pages/default.aspx) supports it.
32. **9ed983a38415 — landlocked by South Africa/Lesotho — READY_FOR_HUMAN_APPROVAL.** Correct option is Lesotho; [Government of Lesotho](https://www.gov.ls/) supports the country identity.
33. **ea554c1de64a — Ottawa capital/True — READY_FOR_HUMAN_APPROVAL.** `True` is supported by [Government of Canada](https://www.canada.ca/en/immigration-refugees-citizenship/services/settle-canada/land-climate.html). It does not change the global capital taxonomy policy.

## Re-review of the 21 previously pending records

All 21 were revisited against their recorded evidence. None was changed solely because a current fact is easy to state: the remaining blockers are the four already consolidated product-policy decisions (historical/current treatment; territorial/continental scope; capital/entity definitions; sovereignty/control wording). This is not a lack of technical validation. It is a deliberate refusal to choose a founder-policy interpretation implicitly.

## Completion totals

| Source | Ready for human approval | Needs review | Rejected | Total |
|---|---:|---:|---:|---:|
| Wikidata | 3 | 17 | 0 | 20 |
| GeoNames | 26 | 4 | 0 | 30 |
| Open Trivia DB | 37 | 8 | 5 | 50 |
| **Corpus** | **66** | **29** | **5** | **100** |

No row is founder-approved or gameplay-approved. The five rejected OpenTDB records remain in immutable source evidence for audit and must remain excluded from any future promotion set.

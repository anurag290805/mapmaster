# First Geography Release — V3 editorial acceptance packet

Status: **candidate-only; not live**. This packet is an editorial recommendation, not founder approval. Every record remains `pending_founder_approval` and `production_eligible: false`.

V3 is a small overlay on [v2](first-geography-release.v2.json), whose SHA-256 is `c0486f41a5c161d78f473bc647b6370a8de2bf23bd9e032be9ed86b6c448a7c6`. V1 and V2 are unchanged. The overlay preserves the v2 stable identities, frozen evidence references, source claims, GeoNames class codes, alternative names, and uncertainty wording.

## Adviser recommendation and guardrails

- 18 Country Explorer cards are recommended **as written**, subject to an explicit founder action.
- Japan (`wikidata:Q17:capital`) is recommended with the V3 wording below; its 1943 administrative qualifier remains preserved.
- Indonesia (`wikidata:Q252:capital`) is a dated learning card only. Its status was checked on 2026-11-10 and must be rechecked immediately before any publication. It is explicitly ineligible for competitive capital questions.
- All 15 city and 15 feature cards are recommended with their V3 evidence-backed editorial copy below. None is activated by this recommendation.
- No underlying source record is excluded. All 50 OpenTDB records remain frozen and absent from this release overlay.

## Exact proposed Country Explorer content

| Proposal ID | Prompt | Answer | Player-facing display |
| --- | --- | --- | --- |
| `wikidata:Q79:capital` | Country Explorer: What is Egypt's current capital? | Cairo | Egypt's current capital is Cairo. |
| `wikidata:Q114:capital` | Country Explorer: What is Kenya's capital? | Nairobi | Kenya's capital is Nairobi. |
| `wikidata:Q1028:capital` | Country Explorer: What is Morocco's capital? | Rabat | Morocco's capital is Rabat. |
| `wikidata:Q1033:capital` | Country Explorer: What is Nigeria's current federal capital? | Abuja | Nigeria's current federal capital is Abuja. |
| `wikidata:Q414:capital` | Country Explorer: What is Argentina's capital? | Buenos Aires | Argentina's capital is Buenos Aires. |
| `wikidata:Q155:capital` | Country Explorer: What is Brazil's current capital? | Brasília | Brazil's current capital is Brasília. |
| `wikidata:Q16:capital` | Country Explorer: What is Canada's capital? | Ottawa | Canada's capital is Ottawa. |
| `wikidata:Q96:capital` | Country Explorer: What is Mexico's capital? | Mexico City | Mexico's capital is Mexico City. |
| `wikidata:Q30:capital` | Country Explorer: What is the United States' current capital? | Washington, D.C. | The United States' current capital is Washington, D.C. |
| `wikidata:Q668:capital` | Country Explorer: What is India's capital? | New Delhi | India's capital is New Delhi. |
| `wikidata:Q233:capital` | Country Explorer: What is Malta's capital? | Valletta | Malta's capital is Valletta. |
| `wikidata:Q20:capital` | Country Explorer: What is Norway's capital? | Oslo | Norway's capital is Oslo. |
| `wikidata:Q664:capital` | Country Explorer: What is New Zealand's capital? | Wellington | New Zealand's capital is Wellington. |
| `wikidata:Q258:capital-roles` | Country Explorer: How are South Africa's national capital roles described? | Pretoria is administrative, Cape Town legislative, and Bloemfontein judicial. | South Africa uses administrative, legislative, and judicial capital roles: Pretoria, Cape Town, and Bloemfontein. The Constitutional Court is in Johannesburg; that location does not replace the listed judicial-capital role. |
| `wikidata:Q252:capital` | Country Explorer: As of 2026-11-10, which city remains Indonesia's national capital while a relocation decree is pending? | Jakarta | As of 2026-11-10, Jakarta remains Indonesia's national capital pending a Presidential Decree for relocation to Nusantara. This dated learning card is not a competitive capital question. |
| `wikidata:Q17:capital` | Country Explorer: What city is Japan's capital today? | Tokyo | Tokyo is Japan's capital today. The retained 1943 source qualifier refers to the Tokyo Metropolis administrative system, not to Tokyo becoming the capital. |
| `wikidata:Q869:capital` | Country Explorer: When was Bangkok established as Thailand's capital in the Rattanakosin period? | 1782 | Bangkok was established as Thailand's capital in 1782; Thonburi was the earlier capital from 1767 to 1782. |
| `wikidata:Q183:capital` | Country Explorer: What distinction matters in Berlin's post-reunification capital history? | Berlin was capital in 1990; the federal parliamentary and government move was completed later. | Berlin was the capital of reunified Germany in 1990. Parliament and government functions moved from Bonn over a later process, with the Bundestag sitting in the Reichstag in 1999. |
| `wikidata:Q45:capital` | Country Explorer: What is Portugal's current capital? | Lisbon | Portugal's current capital is Lisbon. |
| `wikidata:Q408:capital` | Country Explorer: Which dates distinguish Canberra's naming and Parliament's move? | Canberra was named in 1913; Parliament moved there in 1927. | Canberra was named in 1913. Federal Parliament moved from Melbourne to Canberra in 1927; these are different milestones. |

The 18 recommended-as-written IDs are all country IDs above except `wikidata:Q17:capital` and `wikidata:Q252:capital`. Frozen Wikidata claim provenance and retrieval metadata remain in V2 and the normalized snapshot.

## Exact proposed City Challenge content

Every card retains its GeoNames `P` feature class, source ID, frozen source evidence, and ISO mapping. The linked independent source establishes the city-to-country relationship; ISO is no longer the sole evidence. The optional easy form is a non-activated alternative format.

| Proposal ID | Prompt | Answer | Optional easy form | Independent evidence |
| --- | --- | --- | --- | --- |
| `geonames:360630:city` | Cairo, on the eastern bank of the Nile, is the capital of which country? | Egypt | Cairo is in which country? | [Cairo Governorate](https://cairo.gov.eg/en/about-governorate/cairo-in-lines/) |
| `geonames:184745:city` | Nairobi sits in the south-central region of which country? | Kenya | Nairobi is in which country? | [Kenya MFA](https://mfa.go.ke/kenya) |
| `geonames:2332459:city` | Lagos is described as an economic powerhouse of which country? | Nigeria | Lagos is in which country? | [Nigeria Investment Promotion Commission](https://nipc.gov.ng/nigeria/lagos) |
| `geonames:6094817:city` | Ottawa lies on the Ottawa River and is the national capital of which country? | Canada | Ottawa is in which country? | [Government of Canada](https://www.canada.ca/en/immigration-refugees-citizenship/services/settle-canada/land-climate.html) |
| `geonames:3530597:city` | Mexico City began as Tenochtitlan in 1325. It is the capital of which country? | Mexico | Mexico City is in which country? | [Mexico City](https://mexicocity.cdmx.gob.mx/e/about/about-mexico-city/?lang=en) |
| `geonames:3435910:city` | Buenos Aires stands on the Río de la Plata and is the federal capital of which country? | Argentina | Buenos Aires is in which country? | [Buenos Aires City](https://buenosaires.gob.ar/gcaba_historico/laciudad/ciudad) |
| `geonames:3469058:city` | Brasília was inaugurated in 1960 as a planned capital of which country? | Brazil | Brasília is in which country? | [Government of Brazil](https://www.gov.br/g20/en/about-the-g20/host-cities/brasilia-df) |
| `geonames:1261481:city` | New Delhi is listed as the capital in an Indian government business guide. Which country is it in? | India | New Delhi is in which country? | [India Ministry of External Affairs](https://mea.gov.in/Uploads/PublicationDocs/22931_22899_India_in_Business.pdf) |
| `geonames:1850147:city` | Tokyo is both the capital and largest city of which country? | Japan | Tokyo is in which country? | [Tokyo Metropolitan Government](https://www.english.metro.tokyo.lg.jp/documents/d/english/tokyo-city-profile-and-government_fy2025-edition) |
| `geonames:1609350:city` | The Chao Phraya River runs through Bangkok, the capital of which country? | Thailand | Bangkok is in which country? | [Thailand government](https://thailand.go.th/page/capital-city) |
| `geonames:1642911:city` | Jakarta's northern coast includes the mouths of 13 rivers. Which country is Jakarta in? | Indonesia | Jakarta is in which country? | [Jakarta official site](https://www.jakarta.go.id/index.php/tentang-jakarta) |
| `geonames:2950159:city` | Berlin is both a federal state and the capital of which country? | Germany | Berlin is in which country? | [Berlin constitution](https://www.berlin.de/rbmskzl/en/the-governing-mayor/the-constitution-of-berlin/) |
| `geonames:2267057:city` | Lisbon sits on the Tagus estuary along the Atlantic coast. It is the capital of which country? | Portugal | Lisbon is in which country? | [Visit Lisboa](https://www.visitlisboa.com/en/traveller-information) |
| `geonames:2172517:city` | Canberra was selected as a compromise site for a new national capital in 1908. Which country is it in? | Australia | Canberra is in which country? | [ACT Legislative Assembly](https://www.parliament.act.gov.au/visit-and-learn/learn/resources/fs/establishing-the-nations-capital) |
| `geonames:2179537:city` | Wellington has been New Zealand's capital since 1865. Which country is it in? | New Zealand | Wellington is in which country? | [Wellington City Council](https://wellington.govt.nz/-/media/your-council/plans-policies-and-bylaws/plans-and-policies/a-to-z/economicwellbeing/economicwellbeingstrategy-pdf-version-j014844.pdf) |

## Exact proposed Feature Learning content

Every card retains its GeoNames class/code, raw identity/provenance, alternative-name metadata, and the existing territorial caveat. The learning fact is a separate independently supported addition; it does not replace a frozen GeoNames claim.

| Proposal ID | Display and learning fact | Caution | Independent evidence |
| --- | --- | --- | --- |
| `geonames:1283416:feature` | GeoNames classifies Mount Everest as a mountain (T/MT). UNESCO describes Mount Everest, at 8,848 metres, as the world's highest mountain. | No country, border, ownership, or scoring claim. | [UNESCO](https://whc.unesco.org/en/list/120/) |
| `geonames:157452:feature` | GeoNames classifies Mount Kilimanjaro as a mountain (T/MT). UNESCO identifies Kilimanjaro as one of the world's largest volcanoes. | No country inference. | [UNESCO](https://whc.unesco.org/pg.cfm?cid=31&id_site=403) |
| `geonames:1864094:feature` | GeoNames classifies Mount Fuji as a volcano (T/VLC). UNESCO describes Fujisan as a solitary stratovolcano, often snow-capped. | No unique-identification claim. | [UNESCO](https://whc.unesco.org/en/list/1418) |
| `geonames:3181986:feature` | GeoNames classifies Mont Blanc as a mountain (T/MT). The Mont Blanc massif lies between Chamonix and Courmayeur; the local official source describes Mont Blanc as the Alps' highest point. | No single-country summit-ownership conclusion. | [Chamonix](https://en.chamonix.com/la-vallee/patrimoine-culture/patrimoine-naturel-de-la-vallee-de-chamonix-mont-blanc/mont-blanc) |
| `geonames:3866949:feature` | GeoNames classifies Aconcagua as a mountain (T/MT). Argentina's National Geographic Institute lists Aconcagua at 6,961 metres. | No sovereignty claim. | [IGN Argentina](https://www.ign.gob.ar/NuestrasActividades/Geografia/DatosArgentina/MaximasAlturas) |
| `geonames:2212709:feature` | GeoNames classifies the Sahara as a desert (T/DSRT). NASA describes the Sahara as a near-uninterrupted band of sand and scrub across northern Africa. | No territorial-scope claim. | [NASA](https://assets.science.nasa.gov/content/dam/science/esd/earth-observer/2015/Mar_Apr_2015_color_508.pdf) |
| `geonames:3407729:feature` | GeoNames classifies this record as a stream (H/STM). USGS explains that measured river length depends on choices about the source and mouth; its reference list gives the Amazon as 4,000 miles. | Frozen raw name “Amazone River” remains; no single definitive length. | [USGS](https://www.usgs.gov/water-science-school/science/rivers-world-worlds-longest-rivers) |
| `geonames:2031269:feature` | GeoNames classifies the Gobi Desert as a desert (T/DSRT). UNEP notes that much of the Gobi is rocky, compact terrain rather than shifting sand dunes. | No territorial claim. | [UNEP](https://www.unep.org/interactive/explore-ecosystems/desert/en/index.php) |
| `geonames:791630:feature` | GeoNames classifies the Danube River record as a stream (H/STM). The Danube basin is the world's most international river basin, extending through the territory of 19 countries. | Not a border or sovereignty game answer. | [ICPDR](https://www.icpdr.org/danube-basin/danube-river-basin) |
| `geonames:2164628:feature` | GeoNames classifies the Great Barrier Reef record as a reef (H/RF). The Great Barrier Reef Marine Park Authority describes the ecosystem as containing more than 2,900 individual reefs. | Classification and ecosystem fact only. | [GBRMPA](https://www.gbrmpa.gov.au/learn/biodiversity) |
| `geonames:7645281:feature` | GeoNames classifies Uluru as a rock (T/RK). Parks Australia describes Uluru as arkose sandstone rising about 340 metres above the surrounding plain. | Alternative names remain preserved. | [Parks Australia](https://parksaustralia.gov.au/uluru/pub/uluru-kata-tjuta-media-handbook.pdf) |
| `geonames:879432:feature` | GeoNames classifies Victoria Falls as falls (H/FLLS). UNESCO describes eight steep-sided gorges associated with Mosi-oa-Tunya / Victoria Falls. | Not framed as belonging to one country. | [UNESCO](https://whc.unesco.org/en/list/509) |
| `geonames:148996:feature` | GeoNames classifies this record as a lake (H/LK). The Lake Victoria Basin Commission identifies Lake Victoria as Africa's largest freshwater lake. | Frozen raw name “Victoria” remains; no national-ownership claim. | [LVBC](https://www.lvbcom.org/about-us/) |
| `geonames:5296392:feature` | GeoNames classifies the Grand Canyon record as a valley (T/VAL). The National Park Service says the Colorado River began carving the Grand Canyon about five to six million years ago. | No ownership claim. | [National Park Service](https://www.nps.gov/grca/learn/nature/grca-geology.htm) |
| `geonames:351036:feature` | GeoNames classifies the Nile record as a stream (H/STM). The Nile Basin Initiative describes the Nile as flowing northward and draining into the Mediterranean Sea. | No country-ownership or contested-length question. | [Nile Basin Initiative](https://nilebasin.org/en/media-center/maps/major-subbasins) |

## Licensing, attribution, and remaining founder actions

- Wikidata source records retain the existing CC0 attribution/provenance notice in V2.
- All GeoNames-derived cards retain the release manifest’s required **GeoNames, CC BY 4.0** attribution notice and source/retrieval metadata. The additional external evidence links are verification references, not a replacement for GeoNames attribution. Source-specific reuse terms for any future copied material must be checked before publication; the V3 player text is original paraphrase.
- OpenTDB remains frozen, candidate-only, and excluded pending its separate attribution, redistribution, and CC BY-SA legal review.
- Required founder action before any promotion: approve each exact player-facing claim/question (or an explicitly enumerated, unambiguous bulk set), then pass existing CP05 and release-eligibility gates. No approval is recorded by this packet.
- Indonesia requires a current legal-status recheck immediately before publication. Japan's historical qualifier must remain associated with its source evidence. No other V3 item is blocked by missing factual evidence.

## Verification completed

- Candidate overlay integrity: 50 stable V2 identities, all pending approval and production-ineligible; 15 city answer sets are unique and include the answer; 15 features carry independent learning facts; no OpenTDB item appears.
- Preview QA: development preview, keyboard tabs, visible focus, desktop/mobile layouts, 200% text scaling, reduced motion, and zero-XP behavior.
- Production isolation: release prep remains absent from build assets and service-worker precache; production query cannot mount the preview.
- No source snapshot, normalized record, gameplay pool, CP04, CP05, CP10, Firebase, rewards, Daily Challenge, or PWA behavior was changed.

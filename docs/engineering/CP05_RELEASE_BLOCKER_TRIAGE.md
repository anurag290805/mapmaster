# CP05 release-blocker triage — 2026-11-04

**Decision:** retain the CP05 public-beta guard. This record adds replacement
source evidence; it does not clear any shipped asset, approve a boundary view,
or authorize a replacement.

## Evidence boundary

The ten shipped SVGs below have no embedded source, copyright, license,
SimpleMaps, amCharts, Natural Earth, OpenStreetMap, or Creative Commons marker.
Their SHA-256 values remain pinned in `CP05_MAP_INVENTORY.json`. Therefore no
current public source can establish the provenance or redistribution right of a
specific inherited file. The separate static `js/data.js` has no source or
license declaration; its labels, scope memberships, flags, and capital data
remain unproven for release.

Natural Earth's official terms state that its map data is public domain and
may be modified and commercially redistributed. Its 1:10m catalog provides
Admin-0 and Admin-1 layers, but uses a de-facto default and optional national
points of view. The existing feasibility record pins Natural Earth 5.1.1
archives and checksums. [Terms](https://www.naturalearthdata.com/about/terms-of-use/)
and [10m catalog](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/)
were rechecked on 2026-11-04.

## Founder geographic-policy resolutions

- **Australia — RESOLVED (2026-11-04):** MapMaster assigns Macquarie Island to
  **Tasmania** for gameplay, following Australian administrative jurisdiction
  rather than the ABS statistical `Other Territories` classification. This
  preserves the existing Tasmania question mapping and candidate geometry. It
  does not approve the candidate, inherited SVG, or a public release.

`geoBoundaries` is an additional candidate, not a blanket license. Its API
requires attribution for use and supplies the original source, represented
year, license and source URL per layer. A source layer is usable only after
those exact fields, its archive checksum, required attribution, identity
mapping, and geographic fit are recorded. [API and license metadata](https://www.geoboundaries.org/api.html)
were rechecked on 2026-11-04.

## Restricted-asset matrix

| Shipped asset   | Current provenance / redistribution right | Geographic status                                                                                                                                 | Minimum replacement candidate                                                                                                                                                                                                                         | Founder decision                                                         | Required action / remaining blocker                                                                                                                                          |
| --------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `australia.svg` | **NONE DOCUMENTED**                       | Existing 8-question scope; Natural Earth Admin-1 has 8 discovery matches, not validation.                                                         | Natural Earth 5.1.1 Admin-1, public domain; alternatively [geoBoundaries `AUS-ADM1-82085004`](https://www.geoboundaries.org/api/current/gbOpen/AUS/ADM1/) (ABS, CC BY 4.0, 9 units).                                                                  | **Resolved:** Macquarie Island belongs to Tasmania for gameplay.         | Keep the current eight-question mapping and geometry; complete independent geometry, labels, and interaction acceptance.                                                     |
| `brazil.svg`    | **NONE DOCUMENTED**                       | Existing 27-question scope; Natural Earth Admin-1 has 27 discovery matches.                                                                       | Natural Earth 5.1.1 Admin-1, public domain. geoBoundaries records a 27-unit CC BY 2.5 candidate but its source URL is not specific enough to replace independent attribution review.                                                                  | None specific.                                                           | Verify administrative identities/effective date and exact path mapping; no replacement is approved yet.                                                                      |
| `canada.svg`    | **NONE DOCUMENTED**                       | Existing 13-question scope; Natural Earth Admin-1 has 13 discovery matches.                                                                       | Natural Earth 5.1.1 Admin-1, public domain; [geoBoundaries `CAN-ADM1-82249235`](https://www.geoboundaries.org/api/current/gbOpen/CAN/ADM1/) records Statistics Canada, Open Government Canada 2.0, 13 units.                                          | None specific.                                                           | Pin an exact input and validate all province/territory IDs, geometry and attribution before use.                                                                             |
| `china.svg`     | **NONE DOCUMENTED**                       | Existing 33-question scope; Natural Earth Admin-1 has only 26 discovery matches. China is on the CP05 sensitive-boundary watchlist.               | [geoBoundaries `CHN-ADM1-43563684`](https://www.geoboundaries.org/api/current/gbOpen/CHN/ADM1/) reports 34 units and public-domain metadata, but only a generic Wikimedia source locator; it is not independent provenance for a release replacement. | **#5** (world view/boundary policy) applies to the product presentation. | Obtain an exact, auditable source and founder-approved territorial presentation; map all 33 configured targets without silently changing scope.                              |
| `germany.svg`   | **NONE DOCUMENTED**                       | Existing 16-question scope; Natural Earth Admin-1 has 16 discovery matches.                                                                       | Natural Earth 5.1.1 Admin-1, public domain; [geoBoundaries `DEU-ADM1-10402087`](https://www.geoboundaries.org/api/current/gbOpen/DEU/ADM1/) records BKG Data licence Germany Attribution 2.0, 16 units.                                               | None specific.                                                           | Pin input, retain any required attribution, and independently validate IDs, labels and geometry.                                                                             |
| `japan.svg`     | **NONE DOCUMENTED**                       | Existing 47-question scope; Natural Earth Admin-1 has 47 discovery matches.                                                                       | Natural Earth 5.1.1 Admin-1, public domain.                                                                                                                                                                                                           | None specific.                                                           | Pin input and validate all prefecture IDs, labels, multipart geometry and interaction; no current geoBoundaries API response was available to add a second source.           |
| `spain.svg`     | **NONE DOCUMENTED**                       | Existing 17-question scope; Natural Earth Admin-1 has only 8 discovery matches.                                                                   | [geoBoundaries `ESP-ADM1-25490228`](https://www.geoboundaries.org/api/current/gbOpen/ESP/ADM1/) reports Instituto Geográfico Nacional, CC BY 4.0, 19 units.                                                                                           | None specific.                                                           | Verify the 17 configured autonomous-community mappings and deliberate treatment of the two additional units; retain required attribution.                                    |
| `uae.svg`       | **NONE DOCUMENTED**                       | Existing 7-question scope; Natural Earth Admin-1 has only 4 discovery matches.                                                                    | [geoBoundaries `ARE-ADM1-86790563`](https://www.geoboundaries.org/api/current/gbOpen/ARE/ADM1/) reports 7 units from OpenStreetMap/Wambacher under ODbL 1.0.                                                                                          | None specific; geographic presentation still needs review.               | Confirm exact source/version and ODbL attribution/derivative obligations before producing an SVG; verify all emirate mappings.                                               |
| `usa.svg`       | **NONE DOCUMENTED**                       | Existing 50-state scope; Natural Earth Admin-1 has 50 discovery matches.                                                                          | Natural Earth 5.1.1 Admin-1, public domain; [geoBoundaries `USA-ADM1-66186276`](https://www.geoboundaries.org/api/current/gbOpen/USA/ADM1/) records Census public-domain data but contains 56 units.                                                  | None specific.                                                           | Pin input and prove the deliberate 50-state subset, including treatment of territories and District of Columbia.                                                             |
| `world.svg`     | **NONE DOCUMENTED**                       | 194 targets: 0 verified, 165 automated-only, 7 ambiguous, 22 policy-dependent. Egypt diagnostic repair and small-island reachability remain open. | Natural Earth 5.1.1 Admin-0, public domain, 194 discovery candidates; already isolated as a development-only candidate.                                                                                                                               | **#5** (boundary view) and **#6** (Egypt repair).                        | Complete all feature review, policy, tiny-target accessibility, device performance and CP04 integration before any replacement; do not use the candidate as a release asset. |

The geoBoundaries identifiers and metadata above are evidence snapshots, not
licensing opinions. They are independently retrievable through the documented
API endpoints; the exact input file must still be checksum-pinned before any
conversion.

## `js/data.js` release issues

- No dataset source, version, license, or factual-review record covers its map
  labels, aliases, country memberships, flags, capitals, administrative units,
  or India union-territory bonuses.
- It contains scope-specific naming that must not be normalized by guesswork:
  World has `Cabo Verde` and ambiguous `Congo`, while Africa has `Cape Verde`,
  `Democratic Republic of Congo`, and `Republic of Congo`.
- It includes policy-sensitive entries and capital answers, including
  Palestine, Taiwan, Israel/Jerusalem, Jammu and Kashmir, and Ladakh. A source
  identifier alone cannot select a product position for them.
- Existing CP05 discovery shows direct Natural Earth substitution is incomplete
  for China (26/33), Spain (8/17), and UAE (4/7), and therefore cannot be used
  to "correct" the data without changing gameplay.

No `data.js` correction is authorized from this evidence. A release-ready data
registry must preserve an exact source/version/license/effective date for each
record, separate aliases from canonical identities, and receive founder policy
approval before it changes a question or answer.

## Minimum viable replacement sequence

1. **Do not trace by visual similarity.** It cannot prove the origin of a
   shipped SVG. Keep all inherited assets quarantined.
2. **Build source-pinned candidates outside production.** Start with the six
   Natural Earth-covered country scopes (Australia, Brazil, Canada, Germany,
   Japan, USA). Record archive checksum, source feature ID, intended scope,
   path-to-question mapping, and any excluded entity.
3. **Resolve coverage gaps before converting them.** China, Spain, and UAE
   require a specific source whose licence obligations and administrative
   semantics are checked per layer; an unqualified geoBoundaries response is
   not a clearance.
4. **Keep world separate.** Its technically distributable Natural Earth source
   is not a geographically approved MapMaster view. The 22 policy-dependent,
   seven ambiguous, Egypt, accessibility, performance, and integration gates
   remain.
5. **Only then change a shipped asset.** Add a per-asset manifest and focused
   provenance/geometry/reachability tests first; keep `build:public-beta`
   blocked until every asset and `data.js` condition is accepted.

This sequence is the minimum safe path because a universal Natural Earth swap
would immediately lose configured coverage in three country scopes, while a
universal geoBoundaries swap would import distinct attribution and licensing
conditions without resolving the game’s geographic policy.

## 2026-11-04 Admin-1 verified-candidate batch

The approved six-country batch was generated as **non-production candidates**
at `candidate/admin1/`. They are derived directly from the downloaded Natural
Earth 1:10m Admin-1 archive, never from the inherited SVG paths. The generator
accepts only the following exact input:

| Field             | Value                                                                                                                                                                             |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dataset           | Natural Earth Admin 1 – States, Provinces                                                                                                                                         |
| Archive version   | `5.1.1` (`ne_10m_admin_1_states_provinces.VERSION.txt`)                                                                                                                           |
| Original download | `https://naturalearth.s3.amazonaws.com/10m_cultural/ne_10m_admin_1_states_provinces.zip`                                                                                          |
| SHA-256           | `efc59726337323058f9446210adc96673179cd344e053666ee3d28cb58ba2b05`                                                                                                                |
| Terms             | [Natural Earth Terms of Use](https://www.naturalearthdata.com/about/terms-of-use/) — public domain; modification and commercial redistribution permitted; attribution is optional |
| Effective date    | Not stated in the archive metadata or terms; the archive version, checksum and verification date are the reproducible temporal record                                             |
| Verification date | 2026-11-04                                                                                                                                                                        |

`candidate/admin1/manifest.json` contains each gameplay question key, source
component name, `adm1_code`, ISO 3166-2 code, source topology result, multipart
count, SVG checksum and exclusion. It uses an exact diacritic-insensitive match to
Natural Earth's primary `name`, falling back to `name_en` only when no primary
name matches. This avoids treating the District of Columbia's English label
“Washington” as the Washington state.

| Scope     |           Required / matched |                 Candidate geometry | Independent scope cross-check                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Explicit exclusion or blocker                                                                                                                            | Batch result                 |
| --------- | ---------------------------: | ---------------------------------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| Australia | 8 / 8 (10 source components) | `australia.svg`, 100 polygon parts | [ABS ASGS Australia and State/Territory](https://www.abs.gov.au/statistics/standards/australian-statistical-geography-standard-asgs/edition-3-july-2021-june-2026/main-structure-and-greater-capital-city-statistical-areas/australia-and-stateterritory) names the eight configured states/territories and separately defines Other Territories. [NSW](https://www.lhib.nsw.gov.au/sites/default/files/2022-09/LHI-Userguide%20V%20Aug%202014.pdf) identifies Lord Howe Island as part of NSW; [Tasmania](https://parks.tas.gov.au/Documents/Guidelines%20for%20Educational%20Tourist%20Visits%20to%20Macquarie%20Island%20Nature%20Reserve%20and%20World%20Heritage%20Area.pdf) identifies Macquarie Island as part of Tasmania. | Lord Howe and Macquarie are retained in their state targets; only Jervis Bay Territory and Ashmore and Cartier Islands are outside configured questions. | **PARTIAL — candidate only** |
| Brazil    |                      27 / 27 |     `brazil.svg`, 69 polygon parts | [IBGE 2024 Goiás UF archive](https://geoftp.ibge.gov.br/organizacao_do_territorio/malhas_territoriais/malhas_municipais/municipio_2024/UFs/GO/GO_UF_2024.zip) is a valid independent comparison geometry. Its public-download listing is not relied on as an SVG redistribution licence.                                                                                                                                                                                                                                                                                                                                                                                                                                           | Natural Earth `BRA-1294` is repaired only through the source-pinned attestation below; it is not substituted with IBGE geometry.                         | **PARTIAL — candidate only** |
| Canada    |                      13 / 13 |    `canada.svg`, 434 polygon parts | [Statistics Canada Standard Geographical Classification](https://www.statcan.gc.ca/en/subjects-start/standard_geographical_classification) is the authority cross-check for province/territory scope.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | None at the configured 13-unit scope; 434 parts are retained, including islands.                                                                         | **PARTIAL — candidate only** |
| Germany   |                      16 / 16 |    `germany.svg`, 38 polygon parts | [Destatis Länder list and abbreviations](https://www.destatis.de/DE/Methoden/abkuerzung-bundeslaender-DE-EN.html) lists the 16 Länder and their codes.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | None.                                                                                                                                                    | **PARTIAL — candidate only** |
| Japan     |                      47 / 47 |     `japan.svg`, 157 polygon parts | [Statistics Bureau of Japan](https://www.stat.go.jp/english/data/nenkan/1431-02.html) is the recorded national statistical authority for prefectural scope.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | None; islands are retained as multipart geometry.                                                                                                        | **PARTIAL — candidate only** |
| USA       |                      50 / 50 |       `usa.svg`, 403 polygon parts | [U.S. Census geography glossary](https://www.census.gov/programs-surveys/geography/about/glossary.html) distinguishes the 50 states from state-equivalent entities.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | District of Columbia (`USA-3556`, source `US-DC`) is deliberately excluded because `MAPS.usa` asks the 50 states only.                                   | **PARTIAL — candidate only** |

The official references above independently support **scope membership and the
recorded exclusions**, not a claim that their boundary coordinates are identical
to Natural Earth. The generator validates source topology before converting,
retains multipart polygons, produces keyboard-focusable question groups, and
records exact source IDs. A source-valid candidate still needs visual
comparison against the authoritative reference, mobile/touch target-size review,
and CP04 gameplay-adapter review before it can be promoted through the map
registry.

### Brazil `BRA-1294` repair attestation

Natural Earth 5.1.1 has a repeated Goiás ring vertex at source indices 263 and
348 (zero-based), causing `Ring Self-intersection[-47.3024818588507
-16.040054212432]`. No newer Natural Earth Admin-1 release was published.
The candidate generator runs GEOS 3.14.1 `MakeValid` **only** after checking
the exact source WKB SHA-256
`443c7a659614b2527a55f1fc8d255c61951a895eff31727690f95612b82782eb`.
It requires the exact valid Polygon output hash
`b446c1231187a5c4bc944df91aafa02b447e0b74db151476fbe7b9b83050a7c6`,
removes source indices 264–348, adds no coordinates, and permits only the
observed area delta `7.105427357601002e-15` square degrees. Any different
input or output stops generation.

For independent validation only, the downloaded `GO_UF_2024.zip` archive has
SHA-256 `32556057bbbbe00fbe8555a9241544de7e776239ef2c3a4caa47bb6f5286bca6`;
its polygon is valid and has intersection-over-union `0.9740752215706935`
with the repaired Natural Earth polygon. The roughly 0.182° Hausdorff
difference confirms it is an independent dataset, not an identity claim. The
Brazil SVG remains a Natural Earth-derived, public-domain candidate and is not
registered or release-approved.

No candidate is in `svg/`, `js/data.js`, or the service-worker precache. The
production build exclusion and the CP05 public-beta failure remain mandatory.

## Founder decisions still required

1. India ADM1 accountable source and effective date.
2. Jammu & Kashmir/Ladakh presentation.
3. India CC BY 2.5 attribution and redistribution chain.
4. India 28-state / eight-Union-Territory gameplay scope.
5. Natural Earth de-facto view and alternate-view policy for the 22 sensitive
   world targets.
6. Egypt `make_valid` geometry repair as anything beyond a diagnostic.

The original CP05 guard and all existing gameplay remain unchanged.

### Six-map geographic review record

The source-pinned Admin-1 candidates now have a separate, review-only
[geographic acceptance record](CP05_SIX_MAP_GEOGRAPHIC_ACCEPTANCE.md) and
[local visual-review package](../../candidate/admin1/review/README.md). Those
artefacts record the national-authority scope checks, Brazil Goiás comparison,
and mandatory tiny/island/multipart review targets. They do not promote an
asset or relax this fail-closed gate.

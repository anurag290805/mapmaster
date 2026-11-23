# CP05 geographic foundation recovery — compatibility gate

**Decision: do not migrate assets yet.** The available source data are promising, but the checked compatibility gate has not established unique geographic identities, compatible administrative levels, approved boundary policy, or small-target reachability. A matching name below is a *candidate for review*, not validated geographic coverage. No canonical geographic registry has been built, and none of the existing SVGs or game rules were replaced in this recovery pass.

## Requirements and method

`CP05_GEO_REQUIREMENTS.json` snapshots 1,174 configured questions across all 32 map scopes and eight India typing-bonus union territories. It records the current mode declarations, data availability, configured scope, source display names and existing typing aliases. The scope/index keys identify records in this snapshot only; they are **not** geographic IDs. All canonical IDs are null pending review. Configured memberships and broad classifications are game requirements, not verified geography. India contains 28 locate questions and eight typing bonuses; the latter are not currently locate questions. The specification does not claim an authoritative treatment of disputes, cross-continent countries, overseas territories, multipart features or small-target interaction. Those policies remain open.

`CP05_GEO_FEASIBILITY.json` records every question's candidate source IDs and every examined layer's checksum, feature count, duplicate IDs and geometry check. `tools/audit-geography-candidates.py` uses case-, accent- and punctuation-insensitive equality across selected source name fields for candidate discovery; it uses a scope's ISO country code to narrow subdivision candidates. It never approves a candidate. This comparison is incomplete by design: missing candidates are not proof of absent geometry and multiple candidates require disambiguation. It does not independently establish whether boundaries, topology after projection, source classification, feature recency or hit areas are correct. No country or region has been certified directly supported or verified reconciled.

The source inspection used `pyshp 3.1.6` and `shapely 2.2.0` in a temporary directory, not application dependencies. To reproduce, obtain the exact archives at the source URLs and hashes recorded in the JSON, place them in a local directory, install those inspection libraries outside the application, and run `PYTHONPATH=<temporary-package-directory> python3 tools/audit-geography-candidates.py <archive-directory>`. The Natural Earth S3 URLs are mutable: accept the archive only if both its embedded version and SHA-256 match the report. geoBoundaries uses the recorded repository revision and SHA-256. Source files were downloaded for inspection to `/tmp/mapmaster-geodata`; they are not bundled or required by the app.

## Sources and constraints

- [Natural Earth terms](https://www.naturalearthdata.com/about/terms-of-use/) describe its vector data as public domain and state that attribution is not required. Its [10m cultural catalog](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/) describes default de facto boundaries and optional points of view. The six downloaded Admin-0 countries/map-units archives and the 10m Admin-1 archive each contain version **5.1.1**. The JSON records actual SHA-256 values, file sizes, feature counts, NE_ID or adm1_code candidates and topology results. There is no runtime API dependency.
- [geoBoundaries India ADM1 metadata](https://www.geoboundaries.org/api/current/gbOpen/IND/ADM1/) identifies boundary `IND-ADM1-1811400`, original source DataMeet India community/Election Commission of India, reported original license **CC BY 2.5 India**, and represented year **2011**. [geoBoundaries API documentation](https://www.geoboundaries.org/api.html) describes gbOpen as CC BY 4.0 compatible and requires attribution. The inspected simplified file at revision `9469f09` has 36 features, SHA-256 `4c63fe43294a391e8f2de4e9f86f3edb60f8688275b9fee90c61fb2aa0c26061`, and no Shapely-invalid features. It contains names for Ladakh and the merged Dadra and Nagar Haveli and Daman and Diu despite the metadata's 2011 represented year. That inconsistency must be resolved with source history and boundary evidence before claiming a current India layer. License compliance and precise attribution must be reviewed before distribution.
- Natural Earth Admin-0 at 1:10m: 258 country features, 298 map units, compressed archives 4,930,492 and 5,003,719 bytes. Each contains one Shapely-invalid feature, Egypt (`NE_ID` 1159320575; ring self-intersection). 1:50m has 242 country features and 265 map units, 799,734 and 816,908 bytes, with no invalid features in this check. 1:110m has 177 countries and 183 map units, 214,976 and 218,785 bytes, with no invalid features in this check. These archive sizes are not production SVG or transfer sizes; conversion and runtime performance have not been measured. A valid feature is not proof of accurate geography or usable hit size.
- The 10m Admin-1 archive contains 4,596 features and is 14,909,524 bytes compressed; one geometry is Shapely-invalid, Goiás (`BRA-1294`, ring self-intersection). Its `Himachal Pradesh` record has `type_en` set to `Union Territory`, conflicting with the game's state list and [Government of India state listing](https://knowindia.india.gov.in/assets/doc/statewiselist2025_iday.pdf). Source attributes are not an authority to silently change classifications.

The 10m and 50m country layers produce at least one discovery candidate for all 194 world labels; no association has been independently validated. The 110m country layer has no discovery candidate for 29 labels, including Andorra, Kiribati, Nauru and Vatican City; these need separate geometry or a higher-resolution layer. Candidate absence does not establish geographic absence. In the 10m subdivision layer, Washington, Buenos Aires and México each produce two candidates with different source IDs; a first-match rule would be unsafe. France's 101 source records are departments and Italy's 110 are provinces, while their game scopes use regions. A direct substitution would materially change those question scopes. India's 28 state questions and eight bonus names each yield a normalized-name candidate in the 36-feature gbOpen sample, but names and metadata alone do not validate identities, boundaries or the reported date.

## Per-scope discovery matrix

Counts are candidate name matches in Natural Earth 10m Admin-0 countries for world/continents or Admin-1 for country scopes. They are not validated coverage. Every listed question is either pending identity/policy review or requires separately validated subdivision data. Detailed candidates and unmatched names are in the JSON.

| Scope | Questions | With a candidate | Multiple candidates | Gate |
|---|---:|---:|---:|---|
| india | 28 | 28 | 0 | Separate subdivision validation |
| usa | 50 | 50 | 1 | Separate subdivision validation |
| canada | 13 | 13 | 0 | Separate subdivision validation |
| australia | 8 | 8 | 0 | Separate subdivision validation |
| japan | 47 | 47 | 0 | Separate subdivision validation |
| germany | 16 | 16 | 0 | Separate subdivision validation |
| china | 33 | 26 | 0 | Separate subdivision validation |
| brazil | 27 | 27 | 0 | Separate subdivision validation |
| spain | 17 | 8 | 0 | Separate subdivision validation |
| uae | 7 | 4 | 0 | Separate subdivision validation |
| argentina | 24 | 24 | 1 | Separate subdivision validation |
| france | 13 | 0 | 0 | Separate subdivision validation |
| indonesia | 34 | 33 | 0 | Separate subdivision validation |
| italy | 20 | 1 | 0 | Separate subdivision validation |
| mexico | 32 | 31 | 1 | Separate subdivision validation |
| nigeria | 37 | 37 | 0 | Separate subdivision validation |
| pakistan | 7 | 7 | 0 | Separate subdivision validation |
| russia | 83 | 83 | 0 | Separate subdivision validation |
| southKorea | 17 | 17 | 0 | Separate subdivision validation |
| turkey | 81 | 81 | 0 | Separate subdivision validation |
| egypt | 27 | 27 | 0 | Separate subdivision validation |
| southAfrica | 9 | 9 | 0 | Separate subdivision validation |
| thailand | 78 | 77 | 0 | Separate subdivision validation |
| vietnam | 63 | 63 | 0 | Separate subdivision validation |
| greece | 14 | 14 | 0 | Separate subdivision validation |
| europe | 42 | 42 | 0 | Identity and policy review |
| northAmerica | 23 | 23 | 0 | Identity and policy review |
| southAmerica | 12 | 12 | 0 | Identity and policy review |
| africa | 54 | 51 | 0 | Identity and policy review |
| asia | 50 | 50 | 0 | Identity and policy review |
| oceania | 14 | 14 | 0 | Identity and policy review |
| world | 194 | 194 | 0 | Identity and policy review |

## Strongest next path

Use 1:50m or 1:10m Natural Earth Admin-0 as a candidate world foundation, after source-ID reconciliation, explicit boundary/territory policy, geometry repair or alternate sourcing for invalid features, and real interaction checks for small and multipart targets. A 1:110m-only world would leave at least 29 labels without even a discovery candidate and cannot be substituted directly. For India, trace the gbOpen sample's dates and original license and verify each state/UT against an authoritative compatible source. France and Italy need validated regional boundaries or documented aggregation of the correct lower-level features, with coverage and licensing checked. Other subdivisions require a scope-by-scope audit. No resulting asset should replace the existing maps until these checks establish equivalent gameplay coverage.

The game lists `Congo` in its world scope, while Africa separately lists `Democratic Republic of Congo` and `Republic of Congo`; the world list does not explicitly include either full name. Natural Earth's `Congo` candidate uses ISO `COG`, but the game's intended identity and treatment of the other entity require explicit review. World also uses `Cabo Verde` while Africa uses `Cape Verde`. These cross-scope records must not be merged by a guessed alias. Other inconsistent or historic names remain in the source snapshot and require review rather than automatic correction.

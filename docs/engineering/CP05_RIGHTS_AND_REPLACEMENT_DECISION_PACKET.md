# CP05 rights and replacement decision packet

**Recorded:** 2026-11-10  
**Status:** candidate sources inspected; no replacement is approved, registered,
or eligible for public distribution.

## Decision boundary

The ten inherited assets below have no documentary chain of title,
redistribution permission, or required-attribution record in the repository.
An upstream source that permits reuse is a *replacement candidate*; it does
not retrospectively clear an inherited file or settle product boundary policy.
`npm run build:public-beta` intentionally remains blocked for all ten.

Candidate files stay under `candidate/`, absent from `svg/`, production routes,
the service-worker precache, and gameplay registration. Every candidate remains
`live_approved: false`.

## Per-asset decision table

| Inherited asset | Exact inherited defect | Pinned replacement evidence | Coverage / identity evidence | Licence and attribution status | Release decision |
| --- | --- | --- | --- | --- | --- |
| `australia.svg` | No creator, licence, acquisition record, or redistribution terms. | `candidate/admin1/australia.svg`; Natural Earth Admin-1 5.1.1, archive SHA-256 `efc597…b05`. | 8/8 configured entities; 10 source components and 100 rendered parts. Lord Howe is NSW; Macquarie is deliberately Tasmania. | Natural Earth states its data are public domain; attribution optional. | **Candidate technically prepared; hold.** Manual small-island, keyboard/touch and geometry review still required. |
| `brazil.svg` | Same missing provenance and terms. | `candidate/admin1/brazil.svg`; same pinned Natural Earth archive. | 27/27 states, 69 rendered parts. `BRA-1294` repair is checksum-linked and diagnostic only. | Natural Earth public domain; no mandatory attribution. | **Candidate technically prepared; hold.** Do not treat deterministic topology repair as geographic approval. |
| `canada.svg` | Same missing provenance and terms. | `candidate/admin1/canada.svg`; Natural Earth 5.1.1. | 13/13 province/territory targets; 434 rendered parts. | Natural Earth public domain; no mandatory attribution. | **Candidate technically prepared; hold.** Complete visual, reachability and interaction review. |
| `china.svg` | Same missing provenance and terms. | Frozen `candidate/amcharts/source/chinaHigh.svg`, SHA-256 `aa6295…4388`. | 33/33 configured paths; `CN-TW` is explicitly noninteractive context, not an inferred policy. | amCharts snapshot records CC BY 4.0 and required `Map by amCharts` credit. | **Candidate source eligible only; hold.** Founder boundary presentation and feature-level review remain mandatory. |
| `germany.svg` | Same missing provenance and terms. | `candidate/admin1/germany.svg`; Natural Earth 5.1.1. | 16/16 Länder; 38 rendered parts. | Natural Earth public domain; no mandatory attribution. | **Candidate technically prepared; hold.** Complete visual/reachability/interaction review. |
| `japan.svg` | Same missing provenance and terms. | `candidate/admin1/japan.svg`; Natural Earth 5.1.1. | 47/47 prefectures; 157 rendered parts, including multipart islands. | Natural Earth public domain; no mandatory attribution. | **Candidate technically prepared; hold.** Complete multipart/island and interaction review. |
| `spain.svg` | Same missing provenance and terms. | Frozen `candidate/amcharts/source/spainHigh.svg`, SHA-256 `6630bc…d129`. | 17/17 explicit source-ID/name mappings; aliases are recorded rather than inferred. | CC BY 4.0 candidate; persistent amCharts credit is required. | **Candidate source eligible only; hold.** Review islands, target sizes, adapters and presentation before any promotion. |
| `uae.svg` | Same missing provenance and terms. | Frozen `candidate/amcharts/source/uaeHigh.svg`, SHA-256 `6bd0ee…22a3`. | 7/7 emirates; ten paths, with `OM-MU`, `AE-NZ1`, `AE-NZ2` explicit noninteractive context. | CC BY 4.0 candidate; persistent amCharts credit is required. | **Candidate source eligible only; hold.** Do not delete, score, or silently classify context paths; feature/policy review remains. |
| `usa.svg` | Same missing provenance and terms. | `candidate/admin1/usa.svg`; Natural Earth 5.1.1. | 50/50 states; 403 rendered parts. DC is deliberately excluded. | Natural Earth public domain; no mandatory attribution. | **Candidate technically prepared; hold.** Complete small-area, touch and keyboard validation. |
| `world.svg` | Same missing provenance and terms. | `candidate/world.svg`; Natural Earth Admin-0 5.1.1 archive SHA-256 `ce1ac7…f6`. | 194 canonical targets assessed; 22 sensitive targets remain policy-dependent and Egypt retains a diagnostic-only repair. | Natural Earth public domain; no mandatory attribution. | **Candidate technically prepared; hold.** A data licence does not select a sovereignty/boundary presentation. |

`candidate/admin1/manifest.json` pins source IDs, ISO codes, component counts,
multipart counts, rendered SVG hashes, exclusions and the no-simplification
rendering method. `candidate/amcharts/manifest.json` pins original source URLs,
hashes, explicit aliases and noninteractive context. These are evidence records,
not production registrations.

## Independent checks completed

1. Natural Earth Admin-1 source features and rendered candidate SVGs are
   checksum-pinned. Geometry validity, duplicate IDs, selected feature counts,
   multipart counts, exclusions and source-to-question mappings are recorded.
2. National/statistical references in `CP05_SIX_MAP_GEOGRAPHIC_ACCEPTANCE.md`
   independently check configured administrative *membership*. They are not
   coordinate-level equivalence claims.
3. Candidate browser checks cover pointer ownership, transformed-SVG touch hit
   testing, keyboard focus and fallback paths in development only. A visual
   point now resolves with `elementFromPoint` before the event target, avoiding
   transformed SVG touch target disagreement while retaining the canonical
   question/answer guard.
4. Production and subpath browser suites intentionally skip candidate-only
   routes. Normal builds exclude `candidate/`; public beta fails closed while
   inherited assets remain unresolved.

## Authoritative source statements

- [Natural Earth terms of use](https://www.naturalearthdata.com/about/terms-of-use/)
  state that its data are public domain and may be modified and redistributed,
  including commercially. That establishes source eligibility for pinned
  candidates, not gameplay or policy approval.
- [amCharts SVG map downloads](https://www.amcharts.com/svg-maps/download/)
  describe free individual SVG downloads under CC BY 4.0 when the amCharts
  credit is retained. The three pinned candidates therefore require visible,
  durable attribution before any future release.
- [geoBoundaries API documentation](https://www.geoboundaries.org/api.html)
  confirms that source-specific metadata must be inspected. It is retained as
  comparison/research evidence only, not blanket replacement clearance.

## Founder decisions that engineering cannot make

1. Select the accountable India ADM1 source, effective date and attribution
   chain; decide Jammu & Kashmir/Ladakh presentation and the deliberate
   28-state/eight-Union-Territory game scope.
2. Select a public world-map policy for the 22 sensitive Natural Earth targets
   and any alternate-view handling without changing canonical scoring IDs.
3. Decide whether Egypt's deterministic `make_valid` output can progress past
   diagnostic status after independent feature and border review.
4. For China, Spain and UAE, approve precise product presentation only after
   reviewing pinned path/context records and accepting the amCharts CC BY 4.0
   credit. China and UAE context cannot silently answer sovereignty questions.
5. Authorize a future migration only after independent visual, physical-device,
   assistive-technology, target-size and CP04 scoring evidence is accepted.

## Non-negotiable release conditions

Before public beta: retain exact source/derivative notices, independently
accept each replacement's geometry and interaction evidence, resolve the policy
items above, establish `js/data.js` provenance, and obtain explicit founder
release authorization. Until then, preserve the fail-closed build gate.

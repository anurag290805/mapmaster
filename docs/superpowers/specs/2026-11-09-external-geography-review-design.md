# External Geography Review Corpus — Design

## Intent

Add a reproducible, locally stored, **review-only** corpus from Wikidata,
GeoNames and Open Trivia DB. It will support future content curation without
changing MapMaster gameplay, CP04 scoring, CP05 map safeguards, Firebase,
cloud saves, or the offline app shell.

## Non-negotiable boundaries

- No browser/runtime API requests. Network access is limited to explicit,
  developer-run snapshot commands; the application imports none of the new
  files.
- All resulting records live under `candidate/content-review/`, a directory
  Vite neither copies nor precaches. Their manifest status is
  `candidate_not_live`; every record starts `pending_review` or `rejected`.
- The adapters never write `data.js`, gameplay pools, daily challenges,
  navigation, Firebase records, maps, or CP05 manifests.
- A build-isolation test proves the directory is absent from `dist`, service
  worker precache, and all application imports. Existing CP05 release gates
  remain authoritative and closed.

## Corpus and deterministic selection

### Wikidata — 20 country learning records

The source query is versioned and binds exact QIDs, never name-search results.
The v1 country roster is stratified across UN M49 regions and intentionally
excludes territory/dispute selections: Egypt, Kenya, Morocco, Nigeria, South
Africa; Argentina, Brazil, Canada, Mexico, United States; India, Indonesia,
Japan, Thailand; Germany, Malta, Norway, Portugal; Australia and New Zealand.

For each country the adapter requests and preserves the source QID, capital
(P36), official language (P37), currency (P38), continent (P30), area (P2046)
and highest point (P610), including entity QIDs, value units and source labels.
It preserves every returned value, rather than silently choosing one. A record
is `pending_review` when a required core value is absent, a value has multiple
valid candidates, labels conflict, or a fact needs geopolitical interpretation.
The country roster itself is a selection manifest so expansion is additive and
reviewable.

### GeoNames — 30 coordinate records

The selection manifest declares 15 named cities and 15 named natural features,
with one exact `geonameId` per record and representation across Africa,
Americas, Asia, Europe and Oceania. The adapter fetches only GeoNames detail
records by ID, retaining the original ID, feature class/code, country code,
latitude, longitude, returned names, request URL and raw response. It rejects
missing IDs, non-finite/out-of-range coordinates, mismatched expected feature
class/code or duplicate `geonameId`; exact-name or country mismatches remain
pending review rather than being normalized away.

### Open Trivia DB — 50 geography questions

The fetch manifest requests category `22` in five batches of ten questions,
with RFC 3986 encoding and at least five seconds between requests. It records
the exact request URL, response code, batch timestamp and raw response. OTDB
does not expose question IDs, so each output record explicitly says
`source_id: null` and carries a deterministic `source_fingerprint` (SHA-256 of
the canonical decoded source fields) instead of falsely presenting an internal
ID as a source ID. Duplicate fingerprints, malformed choices, duplicate answer
options, non-geography category results, and uncertain factual/geopolitical
wording are rejected or marked `pending_review`. None is promoted to a question
pool.

## Layout and provenance

```
candidate/content-review/
  README.md                         # human review, non-shipping warning
  manifest.json                     # schema, status, counts, attribution
  selections/                       # versioned deterministic input scopes
  raw/                              # exact API response snapshots
  normalized/                       # source-preserving review records
  reports/validation-report.json    # accepted/rejected/pending ledger
tools/content-review/
  shared.mjs                        # schema/hash/write helpers
  wikidata.mjs                      # SPARQL adapter
  geonames.mjs                      # ID-detail adapter
  opentdb.mjs                       # batched trivia adapter
  validate.mjs                      # offline validator/report generator
```

Raw snapshots and normalized records have retrieval timestamps in ISO 8601 UTC,
source URL, retrieval command/version, SHA-256 checksum, licensing,
attribution instructions and a review status. The normalized layer references
the raw-record index or raw-file checksum; it never becomes a substitute for
the original response. The README and manifest display required credits:
GeoNames CC BY 4.0 with a GeoNames link; Open Trivia DB CC BY-SA 4.0 with its
link and a non-promotion warning; and Wikidata structured data CC0 with source
link. Source terms are evidence, not a legal clearance.

## Validation and review outcome

Validation is offline and deterministic. It checks manifest/schema version,
source constraints, checksums, IDs, duplicate keys/fingerprints, coordinate
bounds, fact property/value provenance, trivia answer/choice integrity,
category, status and attribution fields. It writes a stable report with
`accepted`, `rejected`, and `pending_review` counts and per-record reasons.
Only syntactically valid, non-ambiguous source records may be `accepted` for
the review corpus; **accepted never means approved for gameplay**.

Potentially policy-sensitive or source-ambiguous facts are kept intact with a
reason code, including disputed territorial framing, contested capitals,
multiple official languages/currencies, multi-continent claims, aliases and
historical/qualified values. No adapter resolves these by inference.

## Tests

Fixture-driven unit tests cover all three adapters without network access,
source-ID/fingerprint preservation, deterministic selection, decoding,
duplicate rejection, ambiguity flags and provenance requirements. A candidate
isolation test checks that application code cannot import the corpus, Vite does
not copy it, and the generated service worker cannot precache it. Focused
legacy and Vitest tests plus a production build provide the acceptance evidence.

## Alternatives considered

1. Runtime calls from game screens: rejected because they would break offline
   use, alter deterministic gameplay and violate CP05/CP10 boundaries.
2. Add records straight to `data.js` or CP07 learning UI: rejected because
   source validation and factual/geopolitical review have not happened.
3. Download entire sources: rejected because it obscures the initial scope,
   makes provenance/review burdens unbounded and is unnecessary for a
   candidate-only pilot.

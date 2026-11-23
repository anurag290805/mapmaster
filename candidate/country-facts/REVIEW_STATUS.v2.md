# Country Fact Library — Independent Verification Status v2

This status file supplements, and does not modify, `REVIEW_STATUS.md` or the
frozen Wikidata source snapshot.

## Evidence result — 2026-11-10

- 194 canonical MapMaster identities remain represented.
- 192 have a locally frozen independent CIA World Factbook country-profile
  highest-point field; Gambia and Palestine do not have a single corresponding
  profile in that source corpus.
- 145 facts have direct name-level corroboration under the deliberately
  conservative non-generic-token check.
- 47 facts need a feature-identity or conflicting-claim review. A spelling,
  translation, nearby location, or related landform has not been silently
  treated as the same feature.
- 2 facts need an alternative authoritative source: Gambia and Palestine.
- 123 records are ready for founder consideration only; 71 remain in
  `NEEDS_REVIEW` after combining source-identity, existing policy, and
  editorial concerns.
- 0 / 194 are founder approved, gameplay approved, or production eligible.

## Candidate and release boundary

`independent-review.v1.mjs`, the Factbook snapshot, and all review reports are
development-only candidate assets. They remain outside production imports,
service-worker precache, rewards, Daily Challenges, Firebase, and cloud saves.
Technical validation and source corroboration do not confer founder approval or
release eligibility.

## Resumption

`reviews/REVIEW_CURSOR.json` records the reproducible next research set. The
complete per-record evidence, source hashes, final proposed text, qualifications,
and state separation are in `reviews/INDEPENDENT_EVIDENCE_LEDGER.v1.md` and
`independent-review.v1.mjs`.

# External Geography Review Corpus

This directory is a **development-only, candidate-not-live** evidence corpus.
It is not imported by application code, copied to `dist`, cached by the service
worker, or eligible for gameplay, daily challenges, CP04 scoring, Firebase or
cloud saves. `technical_validation: accepted` only means an adapter and the
offline validator accepted the source shape; it never grants human content or
gameplay approval.

The versioned files in `selections/` are the deterministic input scope. `raw/`
contains unmodified API responses. `normalized/` retains source IDs,
qualifiers/multiple claims, source checksums and review flags. `reports/` is a
generated validation ledger. Re-run only explicit local scripts under
`tools/content-review/`.

Production browser code never fetches or imports this corpus. For editorial
review only, the local Vite server exposes an opt-in preview at
`http://127.0.0.1:4174/?externalGeoPreview=1`; its isolated module reads only
the frozen normalized snapshots, visibly labels all content experimental, and
is absent from production builds, service-worker precache, normal navigation,
CP04 scoring, CP05 map gameplay, CP10 Daily Challenges, Firebase, and cloud
saves. See `PROMOTION_PROCESS.md` for the separate human-approval path.

Run `node tools/content-review/validate.mjs` to regenerate the offline report.
The validator verifies source-response hashes, source-ID/fingerprint uniqueness,
technical validation and the mandatory human/gameplay blocks; it never calls a
network service.

## Attribution and source terms

- Wikidata structured data: [CC0](https://www.wikidata.org/wiki/Wikidata:Licensing).
  Preserve QIDs, query and retrieval evidence even though attribution is not
  legally required for the structured data.
- GeoNames: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Credit
  [GeoNames](https://www.geonames.org/) when a reviewed record is ever used.
- Open Trivia DB: [CC BY-SA 4.0](https://opentdb.com/api_config.php). Preserve
  the source/license notice and obtain legal/content review before any use.

These source statements are provenance evidence, not legal or geographic-policy
clearance. Records with multiple claims, qualifiers, aliases, contested framing
or uncertain facts stay pending human review; adapters must not select a single
interpretation silently.

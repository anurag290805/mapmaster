# Candidate-to-production promotion process

This process is intentionally manual and fail-closed. It does not alter raw source evidence.

1. Select one stable record identity from the factual ledger; never select by display label alone.
2. Confirm it is `READY_FOR_HUMAN_APPROVAL`, not `NEEDS_REVIEW` or `REJECTED`, and resolve any linked policy-register decision explicitly.
3. Obtain recorded founder/human factual approval and source-specific attribution/licensing approval. This is a separate decision from technical validation.
4. Create a new, reviewed production-content record outside `candidate/content-review/`, preserving a link to the raw checksum, source ID/fingerprint, qualifiers, retrieval date, factual decision and attribution notice. Do not copy or rewrite the raw snapshot.
5. Add a test proving the approved record is in the intended production pool only, not CP10 unless separately approved, and that candidate files remain absent from the build/service worker.
6. Run CP04 scoring regression, CP05 release-gate checks, CP10 deterministic-daily isolation, accessibility checks, and production-build isolation before an authorized release process.

Until all six steps are documented, `candidate/content-review/` remains development-only and cannot be imported by gameplay.

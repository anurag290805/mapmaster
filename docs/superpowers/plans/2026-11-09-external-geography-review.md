# External Geography Review Corpus Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a reproducible, frozen and development-only review corpus from
Wikidata, GeoNames and Open Trivia DB without changing live application behavior.

**Architecture:** Versioned selection manifests feed source-specific, command-line
adapters. Each adapter saves raw source evidence and source-preserving normalized
records below `candidate/content-review/`. A pure offline validator generates a
classification report while preserving technical validity separately from human
and geographic-policy approval. No browser module imports this corpus.

**Tech Stack:** Node.js ESM, built-in `node:test`, JSON snapshots, Vite.

**Spec:** `docs/superpowers/specs/2026-11-09-external-geography-review-design.md`

## Global Constraints

- Do not modify `data.js`, game modes, CP04 scoring, map adapters, daily
  challenges, Firebase/cloud code, service-worker behavior, or CP05 assets.
- Network calls occur only through explicit CLI snapshot commands; tests use
  checked-in fixtures and never contact an API.
- `candidate/content-review/` must stay out of `dist`, precache lists and
  application imports. Its records never gain a gameplay-approved state.
- Preserve raw fields, source IDs, qualifiers, multiple values, aliases and
  policy uncertainties. Technical validation and human content approval are
  distinct state fields.
- Do not commit, push, deploy, pay for services, reset, or remove unrelated files.

## Review Focus

- A valid record cannot be mistaken for a human-approved or gameplay-approved one.
- No source detail is silently collapsed when source claims conflict or have qualifiers.
- Deterministic inputs generate byte-stable normalized ordering/reporting.
- Missing/malformed source fields, duplicates, wrong coordinates, off-category
  trivia and insufficient batches are visible rather than patched by inference.
- A regular production build and generated service worker contain no corpus data.

### Task 1: Shared contract, deterministic scopes and isolation test

**Files:** Create `tools/content-review/shared.mjs`,
`candidate/content-review/selections/*.json`,
`candidate/content-review/README.md`, `candidate/content-review/manifest.json`;
create `tests/content-review-isolation.test.cjs`; modify no app files.

- [ ] Write failing tests that load the public shared contract and prove a
  technical pass remains `pending_review`/not gameplay-approved; test that a
  regular Vite build and generated service worker exclude the corpus.
- [ ] Run `node --test tests/content-review-isolation.test.cjs` and observe the
  missing-module/corpus failure.
- [ ] Implement source constants, stable canonical JSON/checksum helpers,
  status guards and selection manifests: 20 pinned Wikidata country QIDs; 15
  GeoNames cities and 15 features with exact expected IDs/classes; five OpenTDB
  batches of ten. Add the candidate-only manifest/README and attribution.
- [ ] Run `node --test tests/content-review-isolation.test.cjs` and verify it passes.

### Task 2: Wikidata adapter and frozen country snapshot

**Files:** Create `tools/content-review/wikidata.mjs`, raw/normalized Wikidata
snapshots and fixture; create `tests/content-review-wikidata.test.cjs`.

- [ ] Write failing fixture tests for deterministic SPARQL construction,
  exact-QID filtering, raw provenance/checksum, multiple claims/qualifiers and
  separate technical/human approval states.
- [ ] Run `node --test tests/content-review-wikidata.test.cjs` and observe the
  missing-adapter failure.
- [ ] Implement the reusable adapter and run it explicitly against the approved
  20-country query to save raw and normalized candidate records. Preserve every
  claim binding/qualifier and flag absent or multi-valued core facts for review.
- [ ] Run the focused test and offline validator; record the report outcome.

### Task 3: GeoNames adapter and frozen coordinate snapshot

**Files:** Create `tools/content-review/geonames.mjs`, raw/normalized GeoNames
snapshots and fixture; create `tests/content-review-geonames.test.cjs`.

- [ ] Write failing fixture tests for exact-ID request construction, source ID
  preservation, coordinate and feature-class validation, duplicate rejection
  and review handling of name/country mismatches.
- [ ] Run `node --test tests/content-review-geonames.test.cjs` and observe the
  missing-adapter failure.
- [ ] Implement the reusable ID-detail adapter and run it with the existing
  GeoNames username only as a local environment/CLI argument. Save 30 raw and
  normalized candidate records with CC BY attribution.
- [ ] Run the focused test and offline validator; record the report outcome.

### Task 4: Open Trivia DB adapter and frozen geography snapshot

**Files:** Create `tools/content-review/opentdb.mjs`, raw/normalized OpenTDB
snapshots and fixture; create `tests/content-review-opentdb.test.cjs`.

- [ ] Write failing fixture tests for five deterministic requests, decoded
  answer/choice preservation, source-fingerprint derivation, duplicate and
  malformed-option rejection, and source-ID-null truthfulness.
- [ ] Run `node --test tests/content-review-opentdb.test.cjs` and observe the
  missing-adapter failure.
- [ ] Implement the explicit batch-only adapter, respecting a five-second
  minimum delay and category 22. Fetch/save 50 raw results and normalized
  review records; do not expose them to game pools.
- [ ] Run the focused test and offline validator; record the report outcome.

### Task 5: Offline validator, report and regression verification

**Files:** Create `tools/content-review/validate.mjs`,
`candidate/content-review/reports/validation-report.json`,
`tests/content-review-validator.test.cjs`; update corpus manifest/README and
provenance documentation only as needed.

- [ ] Write failing tests for deterministic report ordering/counts, checksum
  integrity, accepted/rejected/pending classification and a guard that no
  technical validation outcome grants human/gameplay approval.
- [ ] Run `node --test tests/content-review-validator.test.cjs` and observe the
  missing-validator failure.
- [ ] Implement a no-network validator and generate the report from the frozen
  snapshots. Document precise attribution, retrieval evidence and blockers.
- [ ] Run all five content-review test files, applicable CP05/CP10 tests,
  `npm run build`, `git diff --check`, and a direct dist/service-worker scan.
  Report existing unrelated test failures separately; do not alter them.

## Acceptance Evidence

The final report must list source record totals and technical
accepted/rejected/pending counts, with human approval remaining `pending_review`
for every record. It must name the test commands and build-isolation evidence,
list changed files, and state remaining factual/geopolitical/licensing blockers.

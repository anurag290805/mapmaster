# External Geography Corpus — Founder Approval Packet

**Status: decision aid only.** This packet does not grant founder approval, human-content approval, legal clearance, gameplay eligibility, or release permission. Every one of the 100 records remains technically accepted but `human_content_approval: pending_review`, `gameplay_approval: not_approved`, and `candidate_not_live`.

## Current policy application — 2026-11-10

The founder directions are now recorded in [the policy register](./POLICY_DECISION_REGISTER.md) and applied record-by-record in [the re-evaluation](./FOUNDER_POLICY_REEVALUATION.md). This supersedes the preliminary 66/29 factual-review counts retained below as an audit trail: **88** records are now `READY_FOR_HUMAN_APPROVAL`, **7** remain `NEEDS_REVIEW`, and **5** remain `REJECTED`. This is still neither human/founder record approval nor production eligibility. The current ready shortlist prioritizes the 20 Wikidata and 30 GeoNames records; all OpenTDB records remain candidate-only pending CC BY-SA legal review.

## 1. Preliminary evidence-backed records ready for founder review — 66

`READY_FOR_HUMAN_APPROVAL` means an analyst found the retained frozen claim/question independently supportable. Full record-specific evidence links, qualifiers, source IDs, checksums, retrieval dates, and source URLs are in [the factual ledger](./FACTUAL_REVIEW_LEDGER.md) and [completion evidence](./BATCH_5_COMPLETION_EVIDENCE.md); it is not a promotion state.

| Source | Ready stable identities | Evidence location |
|---|---|---|
| Wikidata (3) | `Q16`, `Q114`, `Q869` | Batches 1 and 5 |
| GeoNames (26) | `148996`, `3407729`, `360630`, `184745`, `2332459`, `6094817`, `3530597`, `3435910`, `3469058`, `1261481`, `1850147`, `1609350`, `2950159`, `2267057`, `2172517`, `2179537`, `157452`, `1864094`, `3866949`, `2212709`, `2031269`, `791630`, `2164628`, `7645281`, `5296392`, `351036` | Batches 1–5 |
| Open Trivia DB (37) | `074ee5bac631`, `38408244df0e`, `3daeeea6ba85`, `6e577637cc49`, `7f49e9125098`, `8157b5b67274`, `496f7ce8aa31`, `5fdf126d668c`, `0366e69584bb`, `04264ee2611b`, `07f6e991aa56`, `177950f38943`, `8e6eaebba9eb`, `32aa847343d1`, `bb190a403183`, `a5f244002224`, `1f0042cb2ae2`, `9fb8d710acf8`, `9390d2dd0e38`, `4a01f9659384`, `488873f50286`, `74c392b50894`, `bde7d3405837`, `e4089cfd05ea`, `d28781994727`, `6e0ea11fc4ce`, `e0defdd0293e`, `b2f925b0e6ac`, `a7d9be7783e0`, `c50865d2d035`, `b5d384bd8e8d`, `87db3549364e`, `45b4fa09cdaa`, `47aa685c4097`, `fd394fc531f6`, `9ed983a38415`, `ea554c1de64a` | Batches 1–5 |

The displayed OpenTDB identifiers are fingerprint prefixes only; the complete immutable fingerprints are in the normalized snapshot and review cursor.

## 2. Preliminary founder-decision register — 29

Each record is assigned one primary decision category below to keep this register non-duplicative. Some also have secondary links to the grouped evidence in [the policy register](./POLICY_DECISION_REGISTER.md).

| # | Decision and records | Neutral recommended option | Implication |
|---:|---|---|---|
| 1 | **Current versus historical facts (13):** `Q17`, `Q30`, `Q45`, `Q79`, `Q155`, `Q183`, `Q233`, `Q252`, `Q408`, `Q414`, `Q664`, `Q1033`, `86742f0baee` | Allow only explicitly dated current/historical presentation; otherwise exclude the mixed record. | Retains every source claim and qualifier; prohibits a timeless capital/currency/area answer. |
| 2 | **Territorial, continental, and transboundary scope (8):** `Q20`, `Q96`, `Q668`, `Q1028`, `1283416`, `3181986`, `879432`, `86d8fcf8d222` | Use a documented sovereign-state baseline and exclude scope-sensitive facts until a taxonomy is approved. | Coordinates and source country codes cannot become country, continent, border, or sovereignty assertions. |
| 3 | **Capital and political-entity definitions (6):** `Q258`, `1642911`, `0538db6a74c2`, `3fe4eda24297`, `a5ca2537a09e`, `d4e8a3eed4ca` | Permit a prompt only when it names a governmental function/entity or has one unambiguous contemporary definition. | Avoids false singular-capital and undefined country/microstate/entity claims. |
| 4 | **Territorial-control wording (1):** `600c0c8e58da` | Exclude possession/control verbs unless a separately approved neutral administrative formulation is supported. | The frozen wording stays preserved; no silent rewrite becomes public copy. |
| 5 | **Undefined/volatile editorial wording (1):** `233a529a2731` | Exclude the source prompt unless a separately approved, sourced adaptation is created outside the raw snapshot. | “Huge population” has no stable threshold; a factual association alone cannot validate the question. |

## 3. Confirmed exclusions — 5

The following OpenTDB records are rejected and remain retained only in immutable source evidence/audit material: `c27ced3e6492` (wrong largest-Japanese-island answer), `2949f414ac26` (false absolute Europe/deserts claim), `b1ea9b0ffdc1` (misleading Kashmir territorial wording), `5cdb95791498` (duplicate semantic content), and `805357186fe0` (wrong population answer). Evidence and source-preservation rationale are in [completion evidence](./BATCH_5_COMPLETION_EVIDENCE.md).

## 4. Licensing and attribution gate

- **Wikidata:** structured data is CC0; retain QID/retrieval/query provenance. A voluntary source acknowledgement is recommended. This does not clear rights in text, media, trademarks, or third-party material not included here.
- **GeoNames:** CC BY 4.0. Any future use needs “GeoNames, CC BY 4.0,” `https://www.geonames.org/`, source IDs, a license link, and transformation/modification notice.
- **Open Trivia DB:** recorded as CC BY-SA 4.0. Before any public distribution, obtain legal review of attribution, modification notice, ShareAlike duties for edited questions, and whether a mixed-license compiled gameplay pool is Adapted Material. This is unresolved and blocks any OpenTDB promotion.

See [the licensing audit](./LICENSES_AND_ATTRIBUTION.md) for source evidence and draft notices. No factual classification is legal clearance.

## 5. Engineering and isolation evidence

| Check | Result |
|---|---|
| CP05 Python prerequisite | Repaired test-only interpreter selection; ignored `.cp05-python/` holds Python 3.13, `pyshp 3.1.6`, and `shapely 2.2.0`. Run `npm run setup:cp05-python` on a clean machine. CP05 comparison logic, source inputs, thresholds, and release gates are unchanged. |
| CP05 SVG type safety | Correct `SVGGeometryElement` and `SVGSVGElement` runtime narrowing replaces the invalid `ownerSVGElement` cast. |
| Full tests | `npm test`: **89 legacy + 34 unit passed**. |
| Type/lint/format | `npm run typecheck`, `npm run lint`, `npm run format:check`: passed. |
| Focused corpus/isolation | 18 focused tests passed; offline validator: 100/100 source-integrity valid and technically accepted, 100 human-pending, 100 gameplay-blocked. |
| Preview browser QA | Playwright: 4 passed, 5 expected project skips. Desktop and 390px mobile captures covered Country Explorer, Trivia, and Cities/Features; keyboard arrow/Home/End tab navigation, visible focus, interaction, no horizontal overflow at simulated 200% text, and reduced motion were verified. |
| Production build/isolation | `npm run build` passed. No candidate corpus or preview module was emitted, no candidate/previews appeared in service-worker precache, and production plus subpath routes rejected `externalGeoPreview=1`. Preview results explicitly award 0 XP and forbid progression, Daily Challenge, cloud sync, Firebase, CP04, and CP05 participation. |

Build warnings remain: legacy classic scripts are intentionally not bundled and the main JavaScript chunk is 577.33 kB minified. They are pre-existing build warnings, not test failures, and require separate performance/architecture work if release criteria require resolution.

## 6. Approval boundary and remaining release blockers

Engineering hardening is complete for this corpus review path. The five policy directions are applied, but individual record approval is **not** complete: decide each factual-ready record individually and obtain required human factual and license/attribution approval. Production eligibility is **none of 100** until the manual promotion process, CP04 regression, CP05 release gate, CP10 daily isolation, accessibility checks, and authorized release process are all completed. Existing CP05 geographic and licensing gates remain independent blockers.

# External Geography Corpus — Factual Review Ledger

Status meanings: `NOT_REVIEWED` has no factual decision; `READY_FOR_HUMAN_APPROVAL` is independently supported but is **not** human sign-off or gameplay approval; `NEEDS_REVIEW` needs a founder/human decision; `REJECTED` is unsuitable. Every entry remains `candidate_not_live`, technically accepted, `human_content_approval: pending_review`, and `gameplay_approval: not_approved`.

Snapshot references are immutable source evidence: `raw/wikidata.v1.json`, `raw/geonames.v1.json`, and `raw/opentdb-geography.v1.json`; corresponding normalized files carry the source hashes and flags validated by `validation-report.json`.

## Wikidata — source IDs / current review status

| ID | Subject | Existing flags | Review |
|---|---|---|---|
| Q16 | Canada | multiple_claims:P37 | READY_FOR_HUMAN_APPROVAL — Batch 1 |
| Q17 | Japan | P36,P2046 | NEEDS_REVIEW — Batch 2 |
| Q20 | Norway | P37,P30,P2046 | NEEDS_REVIEW — Batch 2 |
| Q30 | United States | P36,P37,P30,P610 | NEEDS_REVIEW — Batch 3 |
| Q45 | Portugal | P36,P37,P38 | NEEDS_REVIEW — Batch 4 |
| Q79 | Egypt | P36,P30 | NOT_REVIEWED |
| Q96 | Mexico | P37,P2046 | NOT_REVIEWED |
| Q114 | Kenya | P37 | READY_FOR_HUMAN_APPROVAL — Batch 1 |
| Q155 | Brazil | P36,P37,P38 | NEEDS_REVIEW — Batch 1 |
| Q183 | Germany | P36,P38,P2046 | NEEDS_REVIEW — Batch 2 |
| Q233 | Malta | P37,P38 | NEEDS_REVIEW — Batch 2 |
| Q252 | Indonesia | P36,P30 | NEEDS_REVIEW — Batch 3 |
| Q258 | South Africa | P36,P37 | NEEDS_REVIEW — Batch 3 |
| Q414 | Argentina | P38 | NEEDS_REVIEW — Batch 4 |
| Q408 | Australia | P36,P37,P38,P30,P2046,P610 | NEEDS_REVIEW — Batch 3 |
| Q664 | New Zealand | P36,P37,P38,P30 | NEEDS_REVIEW — Batch 4 |
| Q668 | India | P37,P610 | NEEDS_REVIEW — Batch 4 |
| Q869 | Thailand | none | NOT_REVIEWED |
| Q1028 | Morocco | P37,P2046 | NEEDS_REVIEW — Batch 1 |
| Q1033 | Nigeria | P36 | NEEDS_REVIEW — Batch 1 |

## GeoNames — source IDs / current review status

`2267057 Lisbon`, `2172517 Canberra`, `2179537 Wellington`, `1283416 Mount Everest`, `157452 Mount Kilimanjaro`, `1864094 Mount Fuji`, `3181986 Mont Blanc`, `3866949 Aconcagua`, `2212709 Sahara`, `2031269 Gobi Desert`, `791630 Danube River`, `2164628 Great Barrier Reef`, `7645281 Uluru`, `879432 Victoria Falls`, `5296392 Grand Canyon`, and `351036 Nile` are `NOT_REVIEWED` (no existing flags).

| ID | Subject | Existing flag | Review |
|---:|---|---|---|
| 148996 | Lake Victoria | source_name_mismatch (`Victoria`) | READY_FOR_HUMAN_APPROVAL — Batch 1 |
| 3407729 | Amazon River | source_name_mismatch (`Amazone River`) | READY_FOR_HUMAN_APPROVAL — Batch 1 |
| 360630 | Cairo | none | READY_FOR_HUMAN_APPROVAL — Batch 2 |
| 184745 | Nairobi | none | READY_FOR_HUMAN_APPROVAL — Batch 2 |
| 2332459 | Lagos | none | READY_FOR_HUMAN_APPROVAL — Batch 2 |
| 6094817 | Ottawa | none | READY_FOR_HUMAN_APPROVAL — Batch 2 |
| 3530597 | Mexico City | none | READY_FOR_HUMAN_APPROVAL — Batch 3 |
| 3435910 | Buenos Aires | none | READY_FOR_HUMAN_APPROVAL — Batch 3 |
| 3469058 | Brasília | none | READY_FOR_HUMAN_APPROVAL — Batch 3 |
| 1261481 | New Delhi | none | READY_FOR_HUMAN_APPROVAL — Batch 3 |
| 1850147 | Tokyo | none | READY_FOR_HUMAN_APPROVAL — Batch 4 |
| 1609350 | Bangkok | none | READY_FOR_HUMAN_APPROVAL — Batch 4 |
| 1642911 | Jakarta | none | NEEDS_REVIEW — Batch 4 |
| 2950159 | Berlin | none | READY_FOR_HUMAN_APPROVAL — Batch 4 |

## Open Trivia DB — source fingerprint prefix / current review status

| Fingerprint | Prompt shorthand | Flag | Review |
|---|---|---|---|
| 0538db6a74c2 | Kuala Lumpur capital | policy | NEEDS_REVIEW — Batch 1 |
| 074ee5bac631 | Portuguese official language in Africa | policy | READY_FOR_HUMAN_APPROVAL — Batch 1 |
| 38408244df0e | Luxembourg land borders | policy | READY_FOR_HUMAN_APPROVAL — Batch 1 |
| 3daeeea6ba85 | Spain–France range | policy | READY_FOR_HUMAN_APPROVAL — Batch 1 |
| 3fe4eda24297 | smallest country | policy | NEEDS_REVIEW — Batch 1 |
| 600c0c8e58da | Andaman and Nicobar administration | policy | NEEDS_REVIEW — Batch 2 |
| 6e577637cc49 | Tokyo capital | policy | READY_FOR_HUMAN_APPROVAL — Batch 2 |
| 7f49e9125098 | lion-and-sword flag | policy | READY_FOR_HUMAN_APPROVAL — Batch 2 |
| 8157b5b67274 | South Africa multiple capitals | policy | READY_FOR_HUMAN_APPROVAL — Batch 2 |
| 496f7ce8aa31 | Maluku/Spice Islands | policy | READY_FOR_HUMAN_APPROVAL — Batch 3 |
| 5fdf126d668c | British Columbia capital | policy | READY_FOR_HUMAN_APPROVAL — Batch 3 |
| 86742f0baee | Portugal and Roman Empire | policy | NEEDS_REVIEW — Batch 3 |
| 86d8fcf8d222 | South American sovereign-country count | policy | NEEDS_REVIEW — Batch 3 |
| 0366e69584bb | Saudi Arabia city exclusion | none | READY_FOR_HUMAN_APPROVAL — Batch 4 |
| 04264ee2611b | Finno-Ugric classification | none | READY_FOR_HUMAN_APPROVAL — Batch 4 |
| 07f6e991aa56 | US state initial count | none | READY_FOR_HUMAN_APPROVAL — Batch 4 |
| 177950f38943 | Tajikistan flag emblem | none | READY_FOR_HUMAN_APPROVAL — Batch 4 |

All remaining OpenTDB records are `NOT_REVIEWED`: `8e6eaebba9eb`, `32aa847343d1`, `bb190a403183`, `a5f244002224`, `1f0042cb2ae2`, `9fb8d710acf8`, `233a529a2731`, `9390d2dd0e38`, `d4e8a3eed4ca`, `4a01f9659384`, `488873f50286`, `74c392b50894`, `a5ca2537a09e`, `bde7d3405837`, `e4089cfd05ea`, `c27ced3e6492`, `2949f414ac26`, `d28781994727`, `6e0ea11fc4ce`, `e0defdd0293e`, `b2f925b0e6ac`, `a7d9be7783e0`, `c50865d2d035`, `b5d384bd8e8d`, `87db3549364e`, `45b4fa09cdaa`, `47aa685c4097`, `b1ea9b0ffdc1`, `5cdb95791498`, `805357186fe0`, `fd394fc531f6`, `9ed983a38415`, `ea554c1de64a`.

The full 64-character fingerprints and all encoded original questions/answers remain in `normalized/opentdb-geography.v1.json`; prefixes are display keys only.

## Completion addendum — authoritative status at 100 reviewed

The earlier `NOT_REVIEWED` labels above are superseded by this addendum and [BATCH_5_COMPLETION_EVIDENCE.md](./BATCH_5_COMPLETION_EVIDENCE.md). No source evidence, normalized record, technical acceptance, human-approval field, or gameplay field was changed while writing this ledger.

| Source | READY_FOR_HUMAN_APPROVAL | NEEDS_REVIEW | REJECTED | NOT_REVIEWED |
|---|---:|---:|---:|---:|
| Wikidata | 3 | 17 | 0 | 0 |
| GeoNames | 26 | 4 | 0 | 0 |
| Open Trivia DB | 37 | 8 | 5 | 0 |
| **Total** | **66** | **29** | **5** | **0** |

### Newly completed stable identities

| Source | READY_FOR_HUMAN_APPROVAL | NEEDS_REVIEW | REJECTED |
|---|---|---|---|
| Wikidata | `Q869` | `Q79`, `Q96` | — |
| GeoNames | `2267057`, `2172517`, `2179537`, `157452`, `1864094`, `3866949`, `2212709`, `2031269`, `791630`, `2164628`, `7645281`, `5296392`, `351036` | `1283416`, `3181986`, `879432` | — |
| Open Trivia DB | `8e6eaebba9eb`, `32aa847343d1`, `bb190a403183`, `a5f244002224`, `1f0042cb2ae2`, `9fb8d710acf8`, `9390d2dd0e38`, `4a01f9659384`, `488873f50286`, `74c392b50894`, `bde7d3405837`, `e4089cfd05ea`, `d28781994727`, `6e0ea11fc4ce`, `e0defdd0293e`, `b2f925b0e6ac`, `a7d9be7783e0`, `c50865d2d035`, `b5d384bd8e8d`, `87db3549364e`, `45b4fa09cdaa`, `47aa685c4097`, `fd394fc531f6`, `9ed983a38415`, `ea554c1de64a` | `233a529a2731`, `d4e8a3eed4ca`, `a5ca2537a09e` | `c27ced3e6492`, `2949f414ac26`, `b1ea9b0ffdc1`, `5cdb95791498`, `805357186fe0` |

The full fingerprint is the identity authority for every OpenTDB display prefix. The cursor contains all full identities and rejects duplicate selection. `READY_FOR_HUMAN_APPROVAL` remains an evidence-based analyst classification, not founder approval, human sign-off, licensing clearance, or gameplay eligibility.

## Founder-policy re-evaluation — authoritative factual status

The 2026-11-10 founder policy directions are recorded in [the policy register](./POLICY_DECISION_REGISTER.md). They are applied only to factual-review interpretation; raw snapshots, normalized records, hashes, source qualifiers, technical validation, human-content approval, gameplay approval, and production eligibility are unchanged. This addendum supersedes the earlier factual-review totals while preserving the Batch 1–5 evidence trail.

| Source | READY_FOR_HUMAN_APPROVAL | NEEDS_REVIEW | REJECTED | NOT_REVIEWED |
|---|---:|---:|---:|---:|
| Wikidata | 20 | 0 | 0 | 0 |
| GeoNames | 30 | 0 | 0 | 0 |
| Open Trivia DB | 38 | 7 | 5 | 0 |
| **Total** | **88** | **7** | **5** | **0** |

The 22 newly resolved factual dispositions are Wikidata `Q17`, `Q20`, `Q30`, `Q45`, `Q79`, `Q96`, `Q155`, `Q183`, `Q233`, `Q252`, `Q258`, `Q408`, `Q414`, `Q664`, `Q668`, `Q1028`, `Q1033`; GeoNames `1283416`, `3181986`, `879432`, `1642911`; and OpenTDB `a5ca2537a09e`. Their permitted presentation is constrained by the adopted policy and the record-level evidence report; factual readiness is not human approval, legal clearance, or gameplay approval.

The seven remaining `NEEDS_REVIEW` records are OpenTDB `0538db6a74c2`, `3fe4eda24297`, `600c0c8e58da`, `86742f0baee`, `86d8fcf8d222`, `233a529a2731`, and `d4e8a3eed4ca`. They remain held for frozen-question ambiguity, prohibited sovereignty/control framing, undefined terminology, or a required editorial/legal disposition—not an unmade founder policy selection. The five rejected OpenTDB records remain rejected.

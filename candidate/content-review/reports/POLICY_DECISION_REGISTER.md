# External Geography Corpus — Policy Decision Register

This register groups unresolved founder decisions found during Batches 1–4. It is a decision aid, not approval. No option changes immutable source snapshots, qualifiers, provenance, technical status, human-content status, gameplay approval, CP04/CP05/CP10 safeguards, or release gates.

## Adopted founder policy directions — 2026-11-10

The founder delegated and approved the following conservative directions. They resolve product-policy interpretation only; they do **not** approve an individual record, clear a license, change a factual-review conclusion without evidence, or grant production/gameplay eligibility.

1. **Temporal facts:** use verified current facts with explicit dates where relevant; retain source-qualified historical facts separately; never substitute history for a current answer.
2. **Territorial and continental scope:** follow existing MapMaster canonical geography policies; exclude unresolved or disputed territorial classifications from scored gameplay; do not change CP05 geometry, boundaries, or release gates.
3. **Capitals and entity definitions:** distinguish constitutional, administrative, and multiple capital roles; permit multiple verified answers where appropriate; exclude ambiguous single-answer questions.
4. **Sovereignty and control:** exclude questions centered on sovereignty, contested control, or politically disputed territorial ownership from competitive gameplay; retain the original source evidence without rewriting history.
5. **Open Trivia DB licensing:** keep all OpenTDB-derived questions candidate-only until attribution, redistribution, and CC BY-SA ShareAlike obligations receive satisfactory legal review; do not activate production content.

The record-level application and the remaining non-policy holds are in [FOUNDER_POLICY_REEVALUATION.md](./FOUNDER_POLICY_REEVALUATION.md). The original alternatives below are retained as the evidence trail for why these directions were needed; they are no longer open founder-policy selections.

## 1. Current versus historical country facts

**Affected records:** Wikidata `Q17`, `Q30`, `Q45`, `Q155`, `Q183`, `Q233`, `Q252`, `Q408`, `Q414`, `Q664`, `Q1033`; GeoNames `1642911`; OpenTDB `86742f0baee…`.

**Factual evidence retained:** source qualifiers distinguish successive capitals for Japan, the United States, Brazil, Germany, Indonesia and Australia; historic/current currencies for Brazil, Germany, Malta and Australia; dated area values for Japan/Germany; and Roman-period evidence for territory that is now Portugal. Current facts are independently supported where cited in the batch evidence, but they do not invalidate older statements.

| Neutral presentation option | Consequence |
|---|---|
| A. Hold any record containing temporal multiplicity until a human selects a fact with an explicit as-of date. | Safest provenance treatment; delays otherwise well-supported current facts. |
| B. Permit only explicitly labelled `current` and `historical` facts, retaining every source claim and qualifier in review evidence. | Enables learning content while requiring UI copy and date rules; prohibits silent replacement. |
| C. Exclude historical/temporal prompts from candidate promotion. | Simplest gameplay boundary; reduces corpus coverage and leaves current facts review-only when their source record is mixed. |

## 2. Territorial and continental scope

**Affected records:** Wikidata `Q20`, `Q30`, `Q1028`, `Q252`, `Q408`, `Q664`, `Q668`; OpenTDB `86d8fcf8d222…`; potentially `496f7ce8aa31…` where informal regional naming is used.

**Factual evidence retained:** Morocco has incompatible area scopes; Norway has Svalbard/Jan Mayen scope material; the United States, Indonesia and Australia retain multiple continental or territorial components; the UN source for the South America question separates 12 sovereign countries from dependent territories. These sources demonstrate that a count, area, continent, or highest-point fact changes with scope.

| Neutral presentation option | Consequence |
|---|---|
| A. Use a documented sovereign-state baseline and exclude territory/dependency-sensitive facts. | Most predictable country facts; omits valid geography involving external territories. |
| B. Show scope in every affected fact (for example, `mainland`, `sovereign state`, or named territory) and retain the raw claim. | More complete and transparent; requires taxonomy, copy review, and CP05-policy compatibility checks. |
| C. Keep all scope-sensitive records candidate-only. | No policy risk in production; leaves a substantial verified corpus unused. |

## 3. Split-capital and political-entity definitions

**Affected records:** Wikidata `Q17`, `Q30`, `Q45`, `Q1033`, `Q155`, `Q183`, `Q252`, `Q258`, `Q408`, `Q664`; GeoNames `1642911`; OpenTDB `0538db6a74c…`, `3fe4eda24297…`, `8157b5b67274…`, `5fdf126d668c…`.

**Factual evidence retained:** source qualifiers identify historical capitals and South Africa’s functional capitals; official material supports the Kuala Lumpur/Putrajaya and South African functional distinctions; the 2026 Jakarta–Nusantara record shows a transition pending a Presidential Decree; Vatican City/Holy See remains an entity-definition question. Victoria is a provincial capital, not evidence for a national-capital rule.

| Neutral presentation option | Consequence |
|---|---|
| A. Permit only prompts naming the governmental function (`legislative`, `administrative`, `federal`, or `provincial`). | Avoids false singular-capital claims; needs controlled terminology. |
| B. Allow conventional “capital” wording only when one unambiguous contemporary capital exists under the product definition. | Smallest ambiguity surface; excludes many familiar questions. |
| C. Maintain a reviewed entity-and-capital taxonomy before any promotion. | Most expressive and auditable; requires founder ownership and implementation work outside this review batch. |

## 4. Territorial control and sovereignty wording

**Affected records:** OpenTDB `600c0c8e58da…`, `496f7ce8aa31…`, `86d8fcf8d222…`; Wikidata `Q1028`, `Q20`, `Q30`, `Q252`, `Q408` where scope is material.

**Factual evidence retained:** India lists Andaman & Nicobar as a Union Territory; Maluku is under Indonesian administration; the South America source distinguishes sovereign states from dependencies. These facts do not by themselves decide whether product copy may say a place is “controlled by,” “belongs to,” or is part of a country.

| Neutral presentation option | Consequence |
|---|---|
| A. Exclude prompts that use sovereignty/control verbs unless wording is approved case by case. | Strongest policy protection; removes some otherwise factual trivia. |
| B. Use neutral administrative wording only after human copy approval (for example, `is an Indonesian province` where sourced). | More precise than possession/control language; requires a governed rewrite process and cannot alter raw evidence. |
| C. Keep all sovereignty-sensitive candidates permanently review-only. | Eliminates release risk; limits corpus expansion. |

## Remaining record action

The five directions above supersede the need to choose among the historical alternatives in sections 1–4. They authorize neither automatic human approval nor gameplay activation; each individual record still needs separate human approval, provenance/attribution compliance, and existing release-gate checks.

## Completion audit — conservative planning defaults (not founder decisions)

These defaults are implementation planning constraints only. They do not change a record’s factual classification, immutable source evidence, technical status, human-content approval, or gameplay approval.

| Category | Adopted policy constraint | Affected completion records | Gameplay/answer-validation consequence | Remaining action |
|---|---|---|---|---|
| A. Current versus historical facts | Display only a source claim explicitly qualified as current/effective as of a stated date; retain historical claims separately. | `Q79`, `Q96`; prior `Q17`, `Q30`, `Q45`, `Q155`, `Q183`, `Q233`, `Q252`, `Q408`, `Q414`, `Q664`, `Q1033`, `1642911`, `86742…`; date-sensitive `32aa…`. | No timeless “capital/currency/area” answer is generated from a mixed record; dated claims need answer-date matching. | Individual human approval and, for frozen ambiguous prompts, editorial exclusion or a separate governed adaptation. |
| B. Territorial and continental scope | Do not infer a unique country, continent, territory, or border from coordinates or a source country code. Include an explicit scope only after approval. | `Q79`, `Q96`, `1283416`, `3181986`, `879432`; prior Morocco, Norway, US, Indonesia, Australia, New Zealand, India, South America count and Maluku records. | Transboundary/disputed features are discoverable in review only; no map-click, country-match, or singular-scope answer is generated. | Individual human approval; hold the South America count prompt as documented in the re-evaluation. |
| C. Capital and political-entity definitions | Permit a capital question only where product terminology specifies entity and governmental function; preserve alternative/current/historical roles. | `Q79`, `Q96`, `a5ca…`, `d4e8…`; prior Japan, Malaysia, Vatican City/Holy See, South Africa, Jakarta/Nusantara and historical capitals. | Undefined “the capital” prompts remain out of playable content; multiple defensible answers need alternatives or exclusion. | Individual human approval; exclude/hold the frozen Kuala Lumpur and Vatican prompts. |
| D. Sovereignty and territorial control wording | Exclude possessive/control wording from competitive gameplay; preserve source wording as evidence. | `b1ea…` is rejected; `1283416`, `3181986`, `879432` remain neutral feature identities; Andaman/Nicobar remains held. | Candidate facts cannot be converted into territorial-control questions; raw wording remains preserved but is never silently rewritten into public copy. | Individual human approval for neutral factual cards; retain the Andaman/Nicobar question outside competitive gameplay. |

### Historical decision register — now resolved by adopted directions

1. **Temporal fact policy:** adopted direction 1: use verified current facts with explicit dates and retain history separately.
2. **Scope policy:** adopted direction 2: follow MapMaster canonical geography policy and exclude unresolved/disputed classifications from scored gameplay.
3. **Capital/entity policy:** adopted direction 3: distinguish roles, allow multiple verified answers, and exclude ambiguous single-answer questions.
4. **Sovereignty/control policy:** adopted direction 4: exclude sovereignty/control-centered competitive questions and preserve original evidence.

The adopted directions resolve 22 prior factual-policy holds and leave seven frozen OpenTDB prompts correctly held for editorial/structural or legal disposition. The five `REJECTED` OpenTDB records require no policy action: they remain quarantined because of a demonstrated factual, duplicate-content, or structural defect.

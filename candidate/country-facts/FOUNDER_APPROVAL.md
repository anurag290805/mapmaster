# Country Fact Library — Founder Approval Checklist

Scope: 194 MapMaster world-map identities. This is a development-only, offline
candidate library. It is separate from candidate/content-review, and none of
its records is imported by gameplay, service-worker precache, Daily Challenges,
rewards, Firebase, or cloud saving.

## How to review

Open preview/index.html through a local static server. It renders the complete
194-row, claim-level checklist with the exact proposed fact, direct
source-claim link, source ID, factual-review state, and disabled approval
control. The disabled controls intentionally cannot change any state.

The machine-readable checklist is COUNTRY_FACT_APPROVAL_MANIFEST in
catalog.v1.mjs. Every row has a stable mapmaster:country ID and deterministic
content hash. The raw source rows and source query are preserved in
snapshots/wikidata-country-terrain.v1.mjs.

## Required founder action

For each row, approve or decline the proposed fact at the claim level only
after confirming its source evidence and qualifier. A bulk approval is safe
only for rows that all remain:

1. technically accepted;
2. source-qualified and pending independent review;
3. free of a qualifier; and
4. independently reviewed by the founder or delegated reviewer.

No selection in the preview performs these actions. Approval must be recorded
through a future, explicit founder-authorized promotion workflow, followed by
CP05 release-gate review. Approval alone must not make a record gameplay or
production eligible.

## Known qualifier groups

| Group | Action before any use |
| --- | --- |
| Cross-border peaks and border-area features | Keep neutral; never frame as sole ownership, a border answer, or sovereignty evidence. |
| Australia, Netherlands, Denmark and other scope-sensitive records | Re-check the exact territorial scope against CP05 before any map-facing use. |
| Palestine and Taiwan | Retain candidate evidence, but exclude from competitive or territorial prompts under current policy. |
| Argentina and United States | Obtain a second authoritative source for the human-readable feature label. |
| Gambia | This is a P206 Atlantic-coast claim, not a P610 highest-point claim; review it as a separate fact type. |
| Maldives and Marshall Islands | Re-check low-elevation and landform terminology before public language is approved. |

## Status at creation

- 194 / 194 canonical identity slots represented.
- 194 / 194 have a frozen source-qualified candidate fact and direct claim URL.
- 0 / 194 founder approved.
- 0 / 194 gameplay approved or production eligible.
- Technical validation and founder approval are intentionally separate.

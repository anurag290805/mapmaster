# CP05 Geographic Recovery Implementation Plan

**Goal:** Establish whether a pinned, redistributable dataset can support the existing gameplay scopes without inventing geography or reducing coverage.

**Architecture:** Preserve the existing game and SVGs. Inventory scope-specific question records and mode requirements, compare pinned source features and geometry against them, and gate any registry or world-map migration on independent identity, policy, coverage and usability evidence.

**Tech stack:** Existing JavaScript/Node application; offline Python source-data audit; Natural Earth and geoBoundaries source files. No runtime API or paid service.

**Spec:** User's CP05 Geographic Foundation Recovery brief, 2026-10-31.

## Global constraints

Existing CP05 branch and uncommitted changes remain in place. No commit, push, merge, reset, rebase, deployment, fabricated geometry, silent coverage reduction or CP06 work. CP04 remains authoritative for scoring/session behavior. ₹0 cost.

## Review focus

- Ambiguous cross-scope labels must never automatically become one entity; identify the collision in the compatibility report.
- India states and union territories must be listed separately and the represented date of the source compared to game requirements.
- Small and multipart countries must retain all pieces and remain selectable; record this as unverified until interaction testing.
- Political boundaries and territory treatment must be explicit; source defaults do not constitute a product policy.
- Missing, duplicate, invalid or unmatched source features must prevent a supported classification.

## Tasks

- [ ] Capture all scope-specific questions, bonus entities, modes, and existing aliases in a machine-readable requirements inventory, preserving uncertainty.
- [ ] Obtain versioned source layers, record source URLs, hashes, licenses, feature counts, geometry validity and candidate identifier matches across resolutions; identify source/version limitations.
- [ ] Produce a per-scope and per-question compatibility matrix distinguishing evidence from verified identity. If the source gate fails, stop migration and document the precise blockers and strongest alternatives.
- [ ] Only after the gate passes, develop a reviewed canonical registry and deterministic world assets with test-first scoring, race and multipart checks; then migrate regional maps and India separately.
- [ ] Only after foundation validation, complete keyboard, viewport, touch and performance work; rerun data audit, check, Brave matrix, and diff check and report all results without overstating coverage.

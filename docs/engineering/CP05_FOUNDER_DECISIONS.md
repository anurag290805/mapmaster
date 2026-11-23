# CP05 founder decisions

**Status: decisions requested; none are made by this document.** This is a concise decision aid derived from `CP05_READINESS.json`, `CP05_WORLD_COVERAGE.json`, `CP05_GEO_FEASIBILITY.json`, and `CP05_WORLD_RELEASE_GATE.md`. The candidate remains development-only and the release gate remains closed.

## Proposed founder direction — 2026-11-10

**Status: proposed, not yet authorized.** The founder has selected preferred
research and validation directions only:

- Prefer Natural Earth public-domain candidates for Australia, Brazil, Canada,
  Germany, Japan, USA and World.
- Prefer individual amCharts CC BY 4.0 source snapshots for China, Spain and
  UAE, conditional on complete visible attribution and licence compliance.
- Preserve the intended India administrative-game scope and canonical country
  identities, while requiring explicit sensitive-boundary, context-shape and
  alternate-presentation review before any release.
- Keep inherited unlicensed SVGs, unreviewed geometry and all candidates
  blocked from public distribution.

This does not approve an individual asset, source geometry, derivative,
attribution treatment, boundary presentation, gameplay registration or
public-beta build. The six decisions below and their recorded evidence remain
required before a release decision.

| # | Founder decision | Recommended safest default | Consequence | Legal/source-verification dependency |
|---:|---|---|---|---|
| 1 | India ADM1 source and effective date | Do not approve the pinned geoBoundaries layer as either the current or historical authority; select an accountable source that states its effective date and boundary semantics. | The pinned `IND-ADM1-1811400` layer reports 2011 yet contains later entities, so all 36 India associations remain policy-dependent. | Obtain the source's authoritative effective-date/revision statement and permission to use its geometry for the intended distribution. |
| 2 | Jammu & Kashmir/Ladakh boundary presentation | Keep the current candidate development-only and preserve canonical IDs/scoring until an explicit product view, including any alternate-view handling, is approved. | This avoids presenting the provisional geometry as a sovereignty decision; it does not change the configured questions. | Founder boundary policy plus review of applicable India mapping, distribution and market requirements. |
| 3 | CC BY 2.5 India attribution and redistribution | Do not redistribute the pinned India-derived layer; if later approved, publish the original-source attribution and the geoBoundaries attribution/provenance notices together. | This keeps the candidate clear of an unverified attribution chain while preserving the reproducible pinned evidence. | Verify the original source's exact licence text, version, attribution wording and redistribution conditions; geoBoundaries metadata reports CC BY 2.5 India. |
| 4 | India gameplay scope | Retain 28 state locate questions and eight Union Territory typing bonuses until a compatible approved source supports a deliberate scope change. | It preserves CP04 gameplay and avoids turning source discovery into a new question-pool decision. | Confirm every selected source entity maps to the intended administrative class, effective date and configured gameplay scope. |
| 5 | Natural Earth view for 22 disputed/sensitive world targets | Retain Natural Earth's documented de facto view only as a development baseline, never as a sovereignty claim or release approval; require an approved policy before public activation. | The 22 targets remain policy-dependent and alternate views must keep canonical identity and scoring stable. | Founder editorial policy, feature-level geographic review, and applicable publication/distribution review. Natural Earth supplies alternate points of view but does not make the product decision. |
| 6 | Egypt deterministic geometry repair | Approve GEOS `make_valid` only as a checksum-linked development diagnostic, not as a geographically approved replacement boundary. | It removes the technical topology hard block while retaining Egypt as policy-dependent; raw source, repair method and zero-overlap evidence remain recorded. | Independent feature/border review of the repaired geometry and confirmation that the chosen released source permits the repair/derivative. |

## Evidence anchors

- The pinned India evidence is `IND-ADM1-1811400`, 36 ADM1 features, reported year 2011, source licence reported as CC BY 2.5 India. Its recorded feature set includes Ladakh and merged Dadra and Nagar Haveli and Daman and Diu, so the reported date is not sufficient approval evidence.
- Natural Earth Admin-0 Countries 10m v5.1.1 is checksum-pinned in the feasibility record. Its [terms](https://www.naturalearthdata.com/about/terms-of-use/) describe the data as public domain; its [10m catalog](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/) describes a de facto baseline and optional points of view.
- Egypt's retained raw geometry has the recorded self-intersection. The deterministic repair is valid, has eight parts, unchanged bounds and representative-point containment, relative planar-area delta `7.831381472478694e-16`, and zero positive-area intersection with the checked world target set. Those are topology diagnostics, not a boundary adjudication.
- The seven cross-scale cases—Kiribati, Maldives, Marshall Islands, Monaco, Seychelles, Tuvalu and Vatican City—remain ambiguous. Independent geoBoundaries metadata also represents the available cases as ADM0 single units, but its years, source chains and licences differ; it is not a basis to replace or merge their Natural Earth geometry.

No decision here changes `VERIFIED`, `AUTOMATED_ONLY`, `AMBIGUOUS`, `POLICY_DEPENDENT`, `BLOCKED`, live eligibility, candidate provenance, palette, or CP04 gameplay.

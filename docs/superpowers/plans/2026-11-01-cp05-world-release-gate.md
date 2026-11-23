# CP05 World Release-Candidate Gate Plan

**Goal:** Determine whether the candidate can safely enter controlled live integration without changing the live map.

**Architecture:** Keep CP04 scoring authoritative; prepare a disabled adapter that only resolves manifest-backed target identities and rejects stale documents. Assess lossless SVG numeric serialization separately from geometry changes. Extend existing candidate-browser tests, preserving prior coverage.

**Constraints:** Existing branch and uncommitted work preserved; no commit, push, merge, reset, rebase, deploy, paid services, live map substitution or silent question reduction. Provisional Natural Earth de facto baseline is not legal or sovereignty approval.

- [ ] Gather per-exception source and policy evidence without auto-approving geometry.
- [ ] Write failing adapter and lossless optimization tests, implement and verify.
- [ ] Compare original/optimized artifacts and representative actual pointer/touch/gesture behavior with repeatable browser measurements.
- [ ] Evaluate CP04 integration seams and explicit gate blockers; do not activate if any gate fails.
- [ ] Run requested audit, full project check, Brave suite, and diff check; document exact status and limitations.

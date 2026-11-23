# CP05 world coverage and integration plan

**Goal:** Establish a reproducible 194-question identity and geometry gate before considering live integration.

**Approach:** Preserve the live adapter and accepted pilot. Reconcile existing canonical codes with the checksum-pinned Natural Earth 10m layer and a separately downloaded official UN M49 identifier reference; record geometry, policy and validation evidence without promoting uncertain records. Build an isolated candidate only when identities and geometry are adequately evidenced, and do not integrate it unless every requested gate passes.

**Constraints:** Existing CP05 branch and uncommitted work; no new workspace, deletion of old SVGs, runtime geography API, paid services, CP06, commit, reset, push, merge, rebase or deployment.

- [ ] Test and generate a 194-record machine-readable world coverage report that detects missing and duplicate identities, unknown policy and invalid or absent geometry.
- [ ] Inspect exception features and official identifiers; preserve and explicitly enumerate unsupported and policy-dependent questions. Record source hashes and licenses.
- [ ] Generate and evaluate an isolated map only after the identity/geometry gate is met; otherwise record concrete blockers without changing live play.
- [ ] If all gates clear, implement and test a reversible world adapter, accessibility, lifecycle and interaction. Otherwise keep the existing map.
- [ ] Run targeted audits, data audit, complete quality check, full Brave matrix and diff check; report exact results and unresolved conditions.

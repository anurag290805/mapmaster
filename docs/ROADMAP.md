# Checkpoint roadmap

These are proposed gates, not permission to implement. Every checkpoint requires evidence, accessible interaction and no unexpected charge exposure. No provider is selected; verify current terms, quotas, billing and operational limits before any hosting or service decision.

| CP / status | Objective and scope | Deliverables | Dependencies | Acceptance criteria |
|---|---|---|---|---|
| 01 — Development-accepted | Audit baseline and define game | Audit, inventory, issues, specification, checks | Available source | Founder reviews evidence; browser, mapping and provenance gaps resolved or explicitly accepted |
| 02 — Development-accepted | Brand and design system | Tokens, type, accessible components and responsive/motion states | CP01 review | WCAG 2.2 AA target assessed, working existing flows and theme preserved; no new features |
| 03 — Development-accepted | Home, navigation and onboarding | Usable information architecture and truthful onboarding | CP02 | Existing modes reachable, no dead promises, legacy theme preserved; browser and keyboard tests |
| 03.5 — In progress, not accepted | Engineering foundation | Vite, TypeScript, local tests and release documentation | CP03 | Reproducible build and compatibility evidence, known defects disclosed |
| 04 — Not started | Core gameplay overhaul | Correct answer/session engine, results, tests | CP01, CP03 | Reproducible correctness, edge cases, timer and restart integration pass |
| 05 — Not started | World map upgrade | Accessible map adapter, one-to-many IDs and fallback | CP04 | Validated map coverage, keyboard/touch and load-failure behavior |
| 06 — Not started | Expanded modes | Curated, fully tested modes | CP04/05 and source data | Each mode has complete pool, clear rules and accessible alternative |
| 07 — Not started | Geography and learning | Sourced versioned entities, aliases, policy and explanations | CP01, coordinated with CP05/06 | Provenance, rights, disputed classifications and completeness reviewed |
| 08 — Not started | Progression and achievements | Guest save, migrations, meaningful progress | CP04/07 | Old theme intact; migrations, storage failure and progress tests |
| 09 — Not started | Game feel and personalization | Feedback, motion and settings | CP02/04/08 | Reduced motion, sound controls, accessible feedback and performance checks |
| 10 — Not started | Daily challenges and replay | Seeded challenges, varied sessions | CP06/08 | Repeatability, timezone, offline behavior and replay tests |
| 11 — Not started | Quality, performance, security | Browser matrix, audits, hardening | CP04–10 | Agreed budgets, WCAG review, dependency and vulnerability review pass |
| 12 — Not started | Public beta and free hosting | Release candidate, feedback, verified free hosting | CP11 | Owner acceptance, license clearance, operational and zero-cost terms checked; deployment separately authorized |
| 13 — Conditional | Accounts and cloud sync | Optional identity, conflict and recovery design | CP12 and demand, verified zero-cost feasibility | Security/privacy review, predictable zero cost, consent and recovery verified |
| 14 — Conditional | Leaderboards and ranked | Authoritative validation, abuse controls | CP13 and demand, verified zero-cost feasibility | Server authority, moderation, privacy and cost review; no client-trust ranking |
| 15 — Conditional | Multiplayer and seasons | Authoritative sessions and seasonal operations | CP14 and demand, verified zero-cost feasibility | Resilience, accessibility, moderation and operating costs validated |

Follow-up: CP04 owns browser-reproduced I-13; CP05 owns investigation of I-15, and CP05/07 own I-14's scope-specific path mapping and provenance. The separately cloned `main` commit is a comparison baseline, not the extracted workspace's start commit. The remaining verification gaps are recorded and assigned to later checkpoints; founder review of the audit may proceed.

## CP01 consolidation

Consolidation: CP01 audit has received development acceptance. Defects and incomplete browser/SVG tests are deferred to the owners above; unverified asset rights block public release until CP07/12 clearance. At CP01 consolidation, CP03 and later checkpoints had not begun.

CP02 has received development acceptance; see design/CP02_VERIFICATION.md for evidence and limitations. At CP02 acceptance, CP03 had not begun.

CP02 follow-up adds card/disclosure and notification examples. Remaining gameplay regression is assigned to CP04, map interactions to CP05, responsive/accessibility verification to CP11, and asset clearance to CP07/12.

CP03 has received development acceptance with documented limitations; remaining verification is in `docs/cp03/CP03_ACCEPTANCE.md`. Known gameplay and mapping defects remain assigned to CP04/05/07; comprehensive accessibility to CP11.

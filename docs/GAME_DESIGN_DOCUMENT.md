# MapMaster game design document — proposed, not implemented

## Identity

A welcoming, replayable geography game for curious learners, students and map enthusiasts. The promise is to turn recall and recognition into short, understandable challenges followed by useful feedback. Design for clarity, fair answers, geographic nuance, accessibility and player agency. Differentiate with a coherent learn→play→review loop, transparent data coverage and maps usable without precise pointing. No paid service is required for the initial product.

## Core loop and system rules

Choose Play → game and region → accessible, well-described challenge → immediate correct/incorrect feedback → finish or end → review answers and source context → earn meaningful local progression → replay with a different pool or difficulty. Each session declares scope, question count and coverage before start. Question selection excludes already answered canonical IDs; seeded selection may support repeatable challenges. Prevent duplicates and handle empty pools explicitly. Accept reviewed exact aliases after Unicode/whitespace normalization; never accept arbitrary substrings. Practice offers feedback and a retry or skip without pressure; challenge defines deadlines, lives, skip/hint cost and atomic ending up front. Show score components, streak, remaining questions, final accuracy and elapsed time with consistent denominators. Avoid arbitrary difficulty/scoring numbers until playtesting. Learning mode should explain errors, alternate names and sources without turning a quiz into a test of spelling alone.

| Proposed mode | Objective and mechanic | Data | Difficulty / replay / access | Complexity; checkpoint |
|---|---|---|---|---|
| Name the places (retain) | Recall names in a chosen scope | canonical names, aliases | pool size selectable; keyboard and spelling support | Medium; CP04 |
| Locate (retain) | Find named place on map or equivalent list | IDs, geometries | vary scope and size; zoom and keyboard/list alternative | High; CP05 |
| Flags (retain) | Match flag to place | licensed images, names | choices or typing, flag text alternative that does not disclose answer | Medium; CP04/07 |
| Capitals (retain) | Name/match capital for a place | sourced capitals and aliases | recognize vs recall; text equivalents | Medium; CP04/07 |
| Reverse capitals | Find place from capital | capital relationships, ambiguity | show valid multiple answers, avoid trick questions | Medium; CP06/07 |
| Neighbours | Identify bordering places | versioned adjacency | selectable options and text list; disputed borders need policy | High; CP06/07 |
| Region sorter | Assign places to documented regions | memberships and classifications | alternate text interaction; explain overlaps | Medium; CP06/07 |
| Map clues | Identify place from curated geographical clues | sourced clue records, geometry | rotate clues and offer text alternatives | High; CP06/07 |
| Mixed expedition | Short sequence of supported mechanics | validated pools | avoid repeating questions; accessible equivalent for each | High; CP06/10 |

Difficulty may vary pool size, clues and time rather than rely on tiny map targets. Use playtests to tune scoring, durations, lives, hint costs, question counts and progression speed; no default values are accepted here. Daily challenges should use a locally reproducible seed and a clearly defined date/time zone, disclose offline clock manipulation and avoid claims of secure global ranking.

## Progress and information architecture

XP recognizes completed meaningful challenges, with transparent anti-farming limits; levels unlock optional cosmetic or learning content without blocking core access. Region mastery derives from repeated performance across modes rather than a single score. Achievements reward varied learning, while records and stats report sample size and scope. Daily/weekly content is optional and should not punish absence. Home leads to Play, Explore, Progress, Achievements, Settings and Help; ship only working destinations, or clearly mark future sections as unavailable rather than simulating functionality. CP02 defines design tokens and accessible component behavior; CP03 builds navigation and onboarding only for real destinations, keeping current gameplay reachable.

Mobile-first: generous targets, responsive text, stable controls, scrollable layouts, keyboard and screen-reader parity, reduced motion and alternatives to hover, pinch, color-only feedback and precision map clicks. Test zoom, touch and input focus at 360, 390, 768, 1366 and 1920 pixel widths, plus text scaling and landscape.

## Data, saves and later services

Use explicit entity IDs, scope memberships, aliases, provenance, license, version and disputed-boundary policy; permit multiple map geometries per ID. A versioned guest-save envelope should contain settings, achievements, aggregate progress and bounded session history, with validation, safe defaults and migration functions. Preserve `mapmaster-theme` exactly; read it as a legacy preference only when no new setting exists, and do not remove it. Test malformed, denied, quota-limited and future-version storage; offer export/import only when designed safely. Do not silently discard older data.

Accounts and sync require explicit privacy, consent, conflict resolution, recovery and a verifiably free service. Global leaderboards require server-authoritative challenge generation/validation, abuse controls and moderation; client scores are untrusted. Multiplayer requires server authority, latency, disconnect, security and cost planning. None is implemented or promised. Validate terms, quotas and overage exposure before choosing any provider; no free-tier claim is a cost guarantee.

## Measures

Locally measurable with consent and bounded storage: sessions started/completed, first-game completion, attempts per question, retries, time to complete, mode/region replay and error reports. Local-only numbers cannot establish population retention across devices. Future consent-based analytics would be needed for cohort return rates and aggregate funnel metrics; no analytics provider is selected. Performance targets and accessibility gates should be agreed after profiling: track input latency, load timing, map rendering and WCAG 2.2 AA audit results, alongside data coverage and correctness. Define baselines and target thresholds before beta.

## Audit constraints for implementation

Before balancing challenge modes, resolve the observed mismatch between infinite-lives HUD and flag/capital error handling (I-13). Before claiming playable geographic coverage, reconcile scope-specific SVG names and multi-part geometry against the inventory (I-14); include a recoverable map-load failure state and test map switches (I-15). The extracted workspace and remote checkout differ and must be reconciled deliberately before implementation.

## CP01 consolidation

Consolidation: this remains a proposed future specification. CP01 audit completion does not approve gameplay, defer asset rights, or authorize implementation of CP02/03.

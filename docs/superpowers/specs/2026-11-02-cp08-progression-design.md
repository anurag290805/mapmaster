# CP08 Player Progression & Achievements — Design

## Intent

Persist a player’s legitimate CP04 terminal results locally, derive deterministic XP, levels, achievements and compatible personal bests, and expose them in the existing Progress screen.

## Constraints

- CP04 remains the sole owner of session lifecycle, score, timers, lives and terminal state; CP06 choice-pool rules remain unchanged.
- Only a validated terminal result emitted by CP04 can reach progression. UI clicks, review navigation, abandoned sessions, invalid rounds and duplicate terminal callbacks award nothing.
- Persistence is local-only, versioned and bounded. It must tolerate unavailable, malformed or future-version storage without throwing.
- Local storage is player-controlled and is not server-grade anti-cheat.
- No accounts, backend, paid services, new dependencies, CP05 candidate activation or public-beta-gate change.

## Rules

- Eligible result: a CP04 terminal win or time/lives loss with at least one legitimate attempt; abandoned/idle/review results are ignored.
- XP: Practice 20; timed Challenge 30; accuracy bonus `floor(accuracy / 10) * 2`; Challenge difficulty +10 for 60 seconds or less and +5 for locate with one life; win completion +25; total clamped to 0–100.
- Levels: level 1 begins at 0 XP; next level threshold is `100 * currentLevel` total XP.
- Achievements: First Finish (first win), Timed Finisher (first challenge win), Perfect Recall (won with 100% accuracy), Five In A Row (best streak >= 5), Sprint Starter (first completed Flag/Capital Sprint), Explorer (completed sessions in three distinct game types).
- Personal-best partition key: game type, map key, mode, time setting and applicable locate life setting. Track highest score, highest accuracy and fastest completed win.

## Architecture

`src/shared/progression.ts` is the pure authority for validation, XP, levels, achievements, records, migration and idempotent state transitions. `js/progress.js` is the only local-storage/UI adapter. `game.js` creates one immutable terminal-result payload after CP04 sets phase to ended and sends it to the adapter; it never computes XP.

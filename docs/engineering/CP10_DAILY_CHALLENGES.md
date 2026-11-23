# CP10 — Daily Challenges & Replayability

## Intent

CP10 adds an offline, guest-local daily capital challenge that reuses the CP04
session lifecycle and CP08 authoritative progression. It deliberately does not
load CP05 experimental geography or require an account, API, or external
network request once the approved app shell has been warmed.

## Policy decisions

- A **calendar day** is the device's local civil `YYYY-MM-DD` at launch. The
  current day and each reward identity are local to this browser/device.
- Daily identities are `daily-v1:<content-version>:<local-day>:<difficulty>`.
  The seed is the identity, so a given identity always produces the same
  ordered questions from the same content snapshot.
- The content snapshot contains only the existing approved CP06 capital pool.
  It is versioned independently of the generator. Changing it requires a new
  content version, preserving old history and results.
- Device clocks and timezone switches are not authoritative. A backwards
  calendar jump inside 36 hours suppresses new reward claims until the clock
  catches up. This prevents a simple time rollback from creating duplicate
  local-day rewards, but cannot provide cross-device anti-cheat without an
  account or server.
- Replays are unlimited. Only the first winning completion for an identity can
  invoke CP08 progression; losses and replay wins never invoke it.
- Storage is bounded, versioned, and parsed defensively. Corruption resets the
  daily store rather than crashing. When browser storage is unavailable, the
  challenge remains playable for the visit but persistence cannot be promised.

## Architecture

`src/shared/daily.ts` owns pure seed, date, challenge, calendar, streak, and
storage-state rules. `src/ui/daily-bridge.ts` owns the local-store adapter,
calendar/result UI, sharing, and calls the legacy runtime entry point.
`js/game.js` and `js/modes.js` consume a daily queue while preserving CP04's
timing, scoring, answer, review, and terminal lifecycle. CP08 remains the only
component that writes XP and achievements.

A daily identity is attached only by `MapMasterDailyRuntime.start`. Ordinary
starts, map selection, setup reset, explicit restart, and active-session
abandonment detach it. CP04 session IDs still reject stale answer callbacks;
the daily identity cannot be restored by those callbacks after an ordinary
session has started.

## Difficulty

| Difficulty | Questions |        Time | Validated minimum pool |
| ---------- | --------: | ----------: | ---------------------: |
| Easy       |         5 | 180 seconds |      5 unique capitals |
| Medium     |         8 | 150 seconds |      8 unique capitals |
| Hard       |        12 | 120 seconds |     12 unique capitals |

All tiers use four distinct capital choices. Generation fails closed when a
snapshot cannot supply the required targets and distractors.

## Offline and cache lifecycle

Production builds generate a small same-origin `service-worker.js`. It is never
registered in development, so local development and test HMR remain unchanged.
On the first online visit it precaches only the generated JS/CSS shell, ordered
classic runtime, and the already-approved default India asset. The allowlist
explicitly excludes `dist/svg`, runtime cache writes, external origins, and all
CP05 restricted/candidate assets. Cache names include a content fingerprint;
activation removes prior `mapmaster-shell-*` versions only after the replacement
has installed successfully.

After that online warm-up, reopening root or static-subpath hosting without a
network connection loads the app shell and deterministic daily capital content.
A truly first-ever offline visit cannot work because no worker or shell has
been installed. Normal gameplay that needs an uncached or restricted map asset
also remains unavailable offline; CP10 does not use those assets. Flag imagery
is intentionally not used by the daily challenge.

## Engineering closure — 2026-11-03

CP10 received engineering acceptance after the corrective verification: **123
passed, 0 failed, 2 expected development-only skips**. This is development
acceptance only; it does not approve a public release, deployment, or CP11.

The accepted feature set is:

1. Deterministic, versioned daily capital queues with a stable date/difficulty
   identity and content snapshot.
2. Device-local current/longest streaks, completed-day history, missed-day
   handling, and bounded rollback protection for clock/timezone changes.
3. A responsive challenge calendar with completed, missed, current, future, and
   unavailable states; future dates are locked.
4. Validated Easy, Medium, and Hard tiers with distinct question/time settings
   and sufficient four-choice capital pools.
5. Terminal performance summaries covering score, accuracy, elapsed time,
   answer outcome, streak impact, and compatible prior-difficulty comparison.
6. Spoiler-free result sharing through Web Share, clipboard, and copy fallback.
7. One CP08-authoritative XP claim per daily identity, with duplicate, refresh,
   replay, restart, and terminal-callback protection.
8. Deterministic local/offline generation, bounded corruption-tolerant storage,
   and the production warm-start app shell described above.

The corrective pass made daily context explicitly session-scoped. A completed
or abandoned Daily session can no longer contaminate normal typing, Capital
Sprint, or Flag Sprint with a daily queue, daily result identity, streak update,
or daily reward claim. Ordinary CP08 terminal XP remains eligible.

The calendar now uses a complete four-row, seven-cell ARIA grid, with labelled
buttons inside cells, visible focus, and retained arrow-key navigation. The
production worker was verified after an online warm-up for both root and static
subpath hosting; a first-ever offline visit remains intentionally unsupported.

Remaining manual QA is physical-device only: iOS/Android service-worker update
behavior, native share-sheet behavior, VoiceOver/NVDA row/cell announcements,
and 200% text reflow. CP05 experimental/candidate geography remains inactive,
and `build:public-beta` remains fail-closed for the ten unresolved geographic
assets.

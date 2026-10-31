# Navigation and lifecycle

`js/navigation.js` binds the CP03 header, mobile menu, mode intent, settings, help, search and onboarding once. Existing `events.js` owns legacy scope, setup, game and result handlers. `showScreen` in `ui.js` now hides all screens synchronously, shows exactly one, updates breadcrumbs, focuses the destination and emits `mapmaster:screen`; it removes the old transition timeout race. The setup origin survives a visit to challenge settings. Mode intent is applied only after the legacy scope reset; unsupported choices are not silently selected.

When leaving the game through a primary navigation control, a confirmation is requested; on confirmed exit the timer is cleared. Every game-to-other-screen transition also clears the timer and removes the delegated locate click listener, preventing a stale handler from affecting a later mode. `startGame` has a duplicate-start guard; core question, score, lives and timer rules remain unchanged. Settings and onboarding are dialogs and do not reset the current game; a running timer continues while a dialog is open. The later browser re-verification below covers confirmation and exit; automated tests cover targeted transitions and cleanup, not the complete browser lifecycle.

## Browser re-verification — 2026-10-31

On fresh-port Brave, typing world practice accepted Japan once (1/194). A new timed challenge counted down from 02:00. Cancelling the native exit confirmation returned to the same game with its timer running (01:44 observed); confirming returned Home. In a repeat challenge the timer showed 01:55 after exit and remained 01:55 through Play → Explore → Help → Settings and Escape. Challenge settings → Back preserved the selected typing and challenge controls. These observations plus the existing unit test support cleanup for this path; they do not prove all handler counts or all lifecycle paths. The Settings dialog did not navigate away when closed with Escape and restored focus to Settings.

World → Japan after a previous world game reproduced the existing I-15 stale-map failure: Japan labels and 47-state count accompanied world geometry, despite the object's Japan data attribute. The local server recorded no subsequent Japan SVG request. Root cause and independent-browser behavior remain unverified. No game-engine or map fix was made during this verification.

## Final lifecycle check — 2026-10-31

Brave started a two-minute world challenge, then the in-game restart control returned Home. The displayed timer remained 01:17 through subsequent Play and Explore navigation. The earlier confirmed primary-navigation exit and cancel/resume observations remain valid. A controlled-clock test executes the production start, timer, clear and screen-transition functions: a second start while the game is visible creates no extra interval; leaving clears the interval; a later start creates one. This test uses a stubbed reset and does not establish every event handler count.

I-15 remains assigned to CP05. Reproduction: play world practice, exit, select Japan, start a challenge; Japan's setup and object path can coexist with the old world geometry and no Japan SVG request. The cause and independent-browser behavior are unconfirmed. No map architecture was changed.

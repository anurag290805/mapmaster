# CP03 gameplay regression

| Flow | Status | Evidence / limitation |
|---|---|---|
| Typing, world practice | Passed (partial) | Home → Play → typing → world → setup → start; Japan accepted, progress 1; theme changed in settings without resetting progress. Incorrect/complete-game flow not repeated. |
| Flag, world practice | Passed (partial) | Mode card → world → practice; Greece accepted. Completion not tested. |
| Capital, world practice | Passed (partial) | Mode card → world → practice; Lima accepted for Peru. Completion not tested. |
| Locate, world challenge | Failed/blocked — known I-15 | Challenge settings accepted 2 minutes and 3 lives, timer counted down; target remained blank. Correct/incorrect clicks and last life unverified. |
| Challenge back | Passed (partial) | Europe → setup → challenge settings → back → setup → back returned to continent selection. |
| Results/restart, hints, full timer expiration | Not fully tested | Prior CP01/02 evidence exists; full CP03 regression remains open. Header restart used between mode smoke tests. |
| Game exit confirmation / timer cleanup | Partially tested | Unit test covers cleanup; browser-control timeout interrupted confirm interaction. |

Known I-01, I-02, I-04, I-07, I-12, I-13 and I-15 remain open; no game rules or map data were altered. Narrow lifecycle guards in `game.js`/`ui.js` prevent duplicate starts and stale navigation state. Existing flag challenge lives defect is not concealed; Help describes it.

## Browser re-verification — 2026-10-31

World typing practice accepted Japan once and displayed 1/194. A subsequent Japan typing challenge counted down but displayed the previous world map, reproducing existing I-15. Japan setup and `svg/japan.svg` data attribute were correct; no Japan SVG request appeared in the local server log. This remains a serious gameplay risk; cause and whether it occurs outside this browser/tooling environment are not established. Cancel and confirm of the exit prompt worked via the native Brave dialog. After confirmed exit, a separate timed run's displayed 01:55 remained unchanged while navigating several screens. No full game, completion, duplicate-handler count, or all-mode gameplay regression is claimed.

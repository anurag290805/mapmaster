# MapMaster full player audit

**Audit date:** 2026-11-15  
**Environment:** local Vite development build at `127.0.0.1:5173`; Chromium/Brave through Playwright.  
**Method:** independent player walkthrough using the Charles UX and animation review procedure: for each important interaction, assess whether it should move, where attention goes, how it moves, whether it is findable/reachable, and whether the task can be completed.

## Executive assessment

MapMaster has a strong core premise, a coherent charcoal/cobalt/lime identity, functioning primary navigation, responsive layouts without measured horizontal overflow, and good baseline keyboard focus placement between ordinary screens. The choice-sprint loop, daily challenge, map interaction, and account dialogs are not yet at a consistently production-quality level.

No Critical data-loss, security, or gameplay-integrity defect was proven in this audit. Four **High** findings materially impair a core mode, an account flow, rapid-repeat gameplay, or keyboard access.

## Scope and evidence

### Completed live-player coverage

- Desktop home, Play, Explore, Progress, Daily, Help, Settings entry point, Account entry point, and onboarding dismissal.
- All six game-mode setup paths to a live first turn: Typing, Locate, Flag, Capital, Capital Sprint, and Flag Sprint.
- Wrong free-text feedback in Typing and Capital; wrong and correct choice feedback in both Sprint modes.
- Daily Easy, Medium, and Hard start flows. The observed HUDs were respectively 5 questions/3:00, 8/2:30, and 12/2:00.
- Country selection and search (`Japan` filtered to one card; `zzzz` to zero); continent selection; Help accordion keyboard activation.
- Keyboard traversal during Locate; rapid normal navigation; desktop and 320, 375, 390, 414, and 768px viewport checks.
- Default unconfigured local account experience, console, and failed-request observation. This did **not** use a real Firebase project, email, or identity.

### Evidence captured

- [Locate target is not legible](evidence/locate-desktop.png)
- [Account dialog is visually overlaid by the hero](evidence/account-unconfigured-desktop.png)
- [Prior answer/learning cue shown on the next Sprint question](evidence/stale-choice-feedback-desktop.png)
- [Flag Sprint feedback treatment](evidence/flagChoice-desktop.png)
- [Mobile country selection](evidence/country-select-mobile.png)
- [Mobile continent selection](evidence/continent-select-mobile.png)
- [Daily challenge](evidence/daily-desktop.png)
- [Mobile Help](evidence/help-mobile.png)

### Explicitly not claimed as covered

- A complete ordinary player completion of every long World session, every achievement, or every personal-best permutation.
- Production Firebase, Google sign-in, actual email delivery, or cross-device cloud synchronization. Those were intentionally out of scope for a safe local audit.
- A true offline service-worker install/reload cycle, slow-network trace, screen-reader audit with a human assistive-technology user, touch hardware map gestures, or sustained-device performance profiling.
- Geographic correctness, candidate map approval, licensing, or release-gate status.

## Critical

No verified Critical finding.

## High

### H-01 — Locate mode does not visibly name the target country

**Type:** Verified bug / core gameplay usability  
**Affected:** World Locate, desktop; likely any Locate session using the light map panel.  
**Charles criteria:** attention and completion fail. The prompt should direct attention to the target, but the essential information is visually lost.

**Reproduction**

1. Play → Find it on the map → The world → Locate on Map → Practice → Start Game.
2. Observe the prompt above the map.

**Observed:** the accessible text contained `Target Nicaragua`, but the visual panel showed only `Target` and a green underline. The country name was not discernible against the light map surface. The captured screenshot shows the failure.

**Impact:** sighted players cannot reliably know which country to locate, making this game mode effectively blocked.

**Recommendation:** render the target name in a verified high-contrast ink color on the light map surface; add an automated visual/contrast regression covering an actual target name, not merely DOM text.

### H-02 — Account dialog falls behind/through the home hero visual

**Type:** Verified bug / modal layering  
**Affected:** Account dialog on desktop home.

**Reproduction**

1. Dismiss onboarding on the home screen.
2. Select Account.

**Observed:** the hero globe/art remained visually above the darkened dialog content, crossing its inputs and calls to action. The dialog was not a clear modal interruption. See the account screenshot.

**Impact:** fields and account actions are visually obscured; the privacy/account flow looks broken and reduces trust.

**Recommendation:** establish a single overlay stacking contract: backdrop and dialog in the top layer above all decorative hero elements, with no descendant z-index escaping it. Verify at desktop and mobile widths, and on Settings and onboarding as well.

### H-03 — Choice Sprint carries previous-round feedback and learning content into the next question

**Type:** Verified bug / repeated-gameplay feedback  
**Affected:** Capital Sprint and Daily Capital Sprint; likely shared choice flow.

**Reproduction**

1. Daily → Easy.
2. Select the correct answer for `Choose the capital of Kazakhstan` (`Astana`).
3. Wait for the next prompt.

**Observed:** the next question, `Choose the capital of Mexico`, appeared while `✓ Astana` and a learning cue for Kazakhstan remained on screen. The measured time from answer activation to new prompt was **1,731ms**.

**Impact:** the old result competes with the current task, gives the impression that the current question has already been answered, and makes repeated rounds feel slow.

**Charles criteria:** this is a high-frequency interaction. The old state must leave before, or exactly with, the new prompt; attention should have one leader. A 1.7s handoff is well beyond the immediate-feedback rhythm expected for a sprint.

**Recommendation:** treat `answer resolved → feedback → next prompt` as mutually exclusive states. Clear or transition out answer/learning content before presenting the new question; preserve only a short, interruptible confirmation (roughly 200–400ms unless review mode explicitly needs longer). Add a regression asserting that the feedback and learning cue refer to the visible prompt.

### H-04 — Locate gameplay is not meaningfully keyboard-operable

**Type:** Verified accessibility bug  
**Affected:** Locate mode.

**Reproduction**

1. Start a World Locate practice session.
2. Tab from the game HUD through the map.

**Observed:** focus reaches an unnamed `<object>` (`#indiaMap`) and then exits to the page/body and global navigation. No target country/region receives a keyboard focus stop, label, or activation path. The map object itself has no accessible name or role.

**Impact:** keyboard-only players cannot select a region to answer Locate prompts. This blocks one of the six modes.

**Recommendation:** provide a first-class keyboard equivalent: named focusable region controls or a searchable/list-based answer fallback synchronized with map hover/selection. Announce the target and result through an appropriate live region. Do not rely on an embedded SVG object as the only answer mechanism.

## Medium

### M-01 — Daily identity labels every chosen difficulty as “medium”

**Type:** Verified UX/data-presentation defect  
**Affected:** Daily screen.

**Reproduction**

1. Open Daily.
2. Note `Today’s identity: daily-v1:capitals-v1:2026-11-15:medium`.
3. Start Easy or Hard.

**Observed:** the identity remains `medium`, while the started games correctly use Easy (5/3:00) and Hard (12/2:00) rules.

**Impact:** the screen tells the player a different challenge identity than the one they selected. This weakens confidence in deterministic daily rewards and replay rules.

**Recommendation:** derive the displayed identity from the currently selected route, or label the default identity as a default rather than the active challenge.

### M-02 — Unconfigured account controls fail silently

**Type:** Verified local-build UX failure; not a claim about configured production auth  
**Affected:** Account dialog when Firebase is unavailable.

**Reproduction**

1. Open Account in the default local build, which states `Local only`.
2. Enter an email and password.
3. Select Sign in.

**Observed:** there was no visible pending state, error, configuration notice, or control-state change. The dialog remained unchanged.

**Impact:** a player is invited to enter credentials into controls that cannot complete, then receives no recovery guidance.

**Recommendation:** when accounts are unavailable, replace the form with a clear non-interactive “Accounts are not enabled in this build” state, or surface an inline error immediately. Do not expose Google/reset actions when there is no configured backend.

### M-03 — Gameplay chrome is visually dense and duplicates navigation

**Type:** Reviewer recommendation / visual hierarchy  
**Affected:** all desktop game screens.

**Observed:** a full site header remains above a second game header, followed by four large HUD cards and then the play surface. In the Locate screenshot, the task begins well below two layers of chrome.

**Why it matters:** a geography game needs the map/question to be the visual leader. The chrome consumes a large part of the first viewport and increases accidental escape routes during a timed task.

**Recommendation:** use a deliberate “in-session” shell: compact the global header or hide nonessential navigation during an active game, retain a clearly labelled exit/restart affordance, and reserve the top of the viewport for question, progress, and map.

### M-04 — Dark-game visual language is inconsistent with bright answer controls

**Type:** Reviewer recommendation / visual consistency  
**Affected:** Capital Sprint, Flag Sprint, Daily Sprint.

**Observed:** the shell, cards, and prompt are charcoal, while default answer buttons are near-white with dark text. This is legible, but it reads as a different theme and makes correct/wrong/focus states visually busy; see the Flag Sprint evidence.

**Recommendation:** choose one intentional answer-control treatment—either dark surfaces with cobalt/lime state accents, or a consistently light answer area with a clearly separated panel. Test normal, hover, focus, selected, wrong, correct, disabled, and reduced-motion states together.

## Low

### L-01 — Progress and achievement system lacks an early-session motivational bridge

**Type:** Reviewer recommendation / engagement  
**Affected:** Progress empty state, first long session.

**Observed:** Progress correctly explains that the player must finish a game, but the first World modes are long (194 countries / 129 flags) and the audit did not encounter a visible near-term milestone in ordinary play.

**Recommendation:** keep the existing score rules, but make the first-session path more legible: show a clear “first finish” target, a short recommended route, and an explicit first reward. This should not add fabricated XP or weaken duplicate-award protections.

### L-02 — Daily calendar needs more explicit current/selected-day orientation

**Type:** Reviewer recommendation  
**Affected:** Daily calendar.

**Observed:** the numeric calendar and state legend are present, but the current day/selected route relationship is not immediately obvious in a quick player scan.

**Recommendation:** add a textual current-day label and a selected-state explanation that does not rely solely on color. Keep future dates disabled with a reason discoverable to keyboard and screen-reader users.

## What worked well

- No console errors or failed browser requests were observed during the primary desktop/mode walkthrough.
- Ordinary navigation moved focus to the destination screen; all primary screens were reachable on desktop and at 320, 375, 390, 414, and 768px widths.
- No horizontal overflow was measured at those viewport widths.
- Country search filtered correctly for a known country and cleanly produced zero visible cards for a non-match.
- Daily Easy/Medium/Hard correctly changed the question count and timer.
- Free-text error feedback was immediate and intelligible: `Not a valid country name` and a capital hint were visible.
- Choice options had large desktop targets and keyboard focus was visible in the captured sprint evidence.
- Help’s native disclosure control opened by keyboard Enter in the follow-up check.

## Motion and interaction audit summary

| Interaction            | Finding                                                                | Charles assessment                                                                 |
| ---------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Screen navigation      | Functional focus placement; low-frequency visual handoff is restrained | Appropriate movement; keep keyboard state immediate.                               |
| Answer selection       | H-03 stale result/learning state and 1.731s next-prompt delay          | High-frequency path should be faster and present one visual leader.                |
| Correct/wrong feedback | Legible, but persists beyond its causal question                       | Feedback needs a bounded lifecycle and clear state replacement.                    |
| Dialogs                | H-02 stacking violates modal staging                                   | Modal/backdrop must be one top-layer unit above decorative content.                |
| Map selection          | H-01 and H-04 prevent/impede task completion                           | The game must communicate the target and offer an equivalent keyboard action.      |
| Account actions        | M-02 silent unavailable state                                          | A failed/unavailable async action must provide immediate, local recovery guidance. |

## Prioritized implementation roadmap

1. **Repair blocked gameplay and accessibility:** fix Locate target contrast, then ship a labelled keyboard/list fallback for map selection. Test desktop, mobile, keyboard, and reduced motion.
2. **Repair state handoff in Sprint/Daily:** clear feedback/learning content before a new prompt and shorten the answer-to-next-round cadence. Add regression coverage for stale text and rapid repeat answers.
3. **Repair modal stacking and account-unavailable state:** enforce dialog top-layer behavior and replace nonfunctional local-build auth controls with a truthful state.
4. **Correct Daily identity binding:** keep the displayed identity, selected difficulty, timer, question count, replay state, and reward eligibility in one visible model.
5. **Refine the play shell:** reduce duplicate navigation/HUD weight and normalize answer-control styling without compromising focus contrast or touch size.
6. **Run the untested acceptance passes:** local emulator account/cloud sync, offline/service-worker recovery, slow-network behavior, full-session achievement/progression completion, screen-reader map alternative, and real-device touch/landscape tests.

## Audit limitations and final verdict

This was a live local audit, not a release acceptance or security approval. It found several issues a player would discover immediately, including one visually blocked core mode and one blocked keyboard path. The product has a solid navigable foundation, but it needs the first four roadmap items before it can credibly feel polished across all supported ways of playing.

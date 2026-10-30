# Feature inventory

Evidence key: **S** static inspection; **B** browser-tested (none); **U** isolated unit-tested only where explicitly stated. Presence does not mean accepted or production-ready. Future checkpoints are proposed ownership, not implementation approval.

| Feature / screen | Implementation | Observed from source | Status / issue | Direction; CP |
|---|---|---|---|---|
| Home, scopes, country/continent selection | index.html:21–112; events.js:146–230 | 25 countries, six continents, world | S; no responsive or visual verification | retain/refactor; CP03 |
| Setup / challenge options | index.html:114–189; events.js:36–143 | four game types; practice/challenge; 2/3/5 minutes, locate 3/5/10 lives | S; availability uses static support; I-04 | retain/refactor; CP04 |
| Typing | modes.js:14–82 | trims, lowercases/removes whitespace; fuzzy substring; UT bonus | S; I-01 | replace matcher; CP04 |
| Locate | modes.js:102–160; events.js:286–365 | random target, delegated SVG click, lives for challenge | S; I-02/I-03/I-07 | refactor adapter and alternative; CP04/05 |
| Flag | modes.js:176–257 | filtered flags, exact normalized name; CDN PNG | S; I-04/I-06 | retain/refactor; CP04/07 |
| Capital | modes.js:260–331 | filtered capital pool; exact normalized answer | S; I-04/I-05 | retain/refactor; CP04/07 |
| Timer, score, streak | game.js:11–29, 200–224; ui.js:127–190 | one point per accepted answer, bonus +2 per India UT, current/best streak, interval timer | S; drift/race risk I-09 | refactor; CP04 |
| Hints | game.js:342–386 | typing random unguessed first letter; flag/capital target initial; challenge costs ten seconds | S; locate hint code exists but button hidden | refactor; CP04 |
| Win/loss/review | game.js:114–207,305–337 | results, missed list, map review, play again to home | S; practice time/accuracy shown as `--`; no full completion verified | retain/refactor; CP04 |
| Theme and sound | ui.js:610–615; events.js:259–273; audio.js | theme stored; sound toggle in memory | S; storage errors, external font | retain/refactor; CP02/09 |
| Zoom, touch, hover | events.js:375–461; 330–365 | wheel/drag/pinch and mouse tooltip | S; keyboard alternative unverified I-07 | refactor; CP05 |
| Progress, achievements, help, onboarding, accounts | no dedicated screens | HUD session progress and transient India UT toast only | S; durable systems absent | defer; CP03/08/13 |

No skip is implemented. Empty input is ignored; matching ignores case/whitespace but not punctuation or accents. Alias table is for SVG labels, not answer input. Rapid inputs are throttled for 200 ms; post-game and race behavior needs browser testing. Refresh resets the session. Last-life and time-end flows exist in code but are not integration-tested. Existing screenshots are historical and do not validate current behavior.

## Follow-up browser evidence

Brave on localhost: home → world setup → typing practice rendered; `a` twice yielded score/streak 2 and progress 2/194 (I-01). Hint displayed a masked name. Flag challenge rendered 0/129 and its image accessibility name exposed the answer; a wrong answer ended the game with a lives message despite ∞ HUD (I-11/I-13). Retry returned home. World capital practice rendered 0/84 and an incorrect answer gave an initial. Country and continent selections rendered; North America and UAE locate produced blank targets in one switching sequence (I-15). Sound toggle changed icon and was toggled back. See BROWSER_VERIFICATION.md for untested behaviors.

## CP01 consolidation

Consolidation: the audited application is now the selected development candidate; browser gaps are deferred to CP04/05/11. Existing failures are not acceptance of gameplay.

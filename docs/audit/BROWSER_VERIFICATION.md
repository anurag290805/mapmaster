# Browser verification — 2026-10-31

A sandboxed `python3 -m http.server 8765 --bind 127.0.0.1` and a Node loopback bind initially returned EPERM. An authorized localhost-only Python server was then started outside that restriction and Brave opened `http://127.0.0.1:8765/`. Browser tests used real UI, not a simulated DOM. Temporary settings were not cleared; sound was returned to its original on state. No browser storage was cleared. No test is an acceptance of the entire feature.

| Test | Result | Evidence / limitation |
|---|---|---|
| Home, world navigation and setup | PASS | Home → World → setup rendered; four types and two modes visible. |
| Country and continent selection | PASS (partial) | Country and continent lists, UAE and North America setup appeared; other selections not exercised. |
| Typing, first answer, score and streak | FAIL | World practice: `a` twice produced score/streak 2 and progress 2/194. I-01. |
| Typing hint | PASS (partial) | Hint displayed a masked country and letter count. |
| Flag challenge, incorrect answer | FAIL | 0/129, timer counted down, HUD ∞ lives; wrong answer resulted in loss for lives. I-13. |
| Flag correct answer / hint / completion | BLOCKED / not executed | No end-to-end coverage; flag's accessible image name exposed the answer (I-11). |
| Capital practice incorrect answer | PASS (partial) | Iran target and incorrect response with initial T appeared; 0/84. |
| Capital correct / challenge / completion | BLOCKED / not executed | No end-to-end coverage; source indicates same lives defect as flag. |
| Locate challenge | FAIL (observed sequence) | North America showed blank target; UAE after switching also showed blank target and previously displayed world geometry. I-02 and I-15; cause of latter unconfirmed. No actual target click verified. |
| Timer and lives | PASS (partial) | 2-minute timer decreased to zero and displayed the time-expired loss with seven missed UAE regions; locate HUD displayed three lives. Life decrement and last life not tested. |
| Results and restart | PASS (partial) | Flag loss rendered and Try Again returned home; win, review and normal restart not tested. Header restart returned home. |
| Sound toggle | PASS (partial) | Icon changed on→off→on; audio output not assessed. |
| Theme and persistence | BLOCKED / not executed | Existing browser storage preserved; no theme toggle, reload or persistence test. |
| Map zoom, pan, correct/incorrect selection | BLOCKED / not executed | Blank target and stale map in observed sequence; no target interaction verified. |
| Keyboard navigation / screen reader | BLOCKED / not executed | DOM accessibility tree observed; no complete keyboard or screen-reader audit. |
| Mobile touch | BLOCKED / not executed | Desktop browser only; no physical touch or touch emulation validation. |
| Console and network | PARTIAL | `tab.dev.logs` returned no captured warning/error entries; server logged 404 for favicon. Browser tool did not expose a complete network waterfall. A missing configured North America path is verified by filesystem; no corresponding request appeared in captured server output. |
| Responsive widths | PASS (limited measurement) | After correcting viewport scaling, CSS viewports measured 360×800, 391×844, 768×1024, 1367×768 and 1920×1080. Document/body scroll widths equaled viewport width on the UAE locate screen at each size. The two 1px approximations are not exact requested sizes; other screens, clipping, text scaling and touch remain untested. A 360×800 screenshot was visually inspected. |

Screenshots of the UAE challenge at desktop and 360×800 during the observed map-switch sequence were visually inspected, showing a blank target and world-shaped map; they were not exported as files. A full viewport/visual review and automated coverage remain outstanding. The tool's page snapshots do not establish physical touch, console completeness or cross-browser behavior.

## CP01 consolidation

Consolidation: the recorded tests apply to the audited extraction whose application files were selected for the candidate. Untested flows, accessibility, touch, complete viewport review and SVG clicks are deferred to CP04/05/11; they are not represented as passing.

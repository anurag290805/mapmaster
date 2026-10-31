# CP02 implementation plan

Goal: introduce an atlas-inspired visual system without altering game rules or navigation structure. Stack: native HTML, CSS, classic JavaScript; no packages or paid services.

1. Preserve every gameplay script and DOM ID; layer semantic tokens and shared component styles after legacy CSS. Keep `mapmaster-theme` and the existing body class as the source of theme preference.
2. Add original SVG compass/grid mark and favicon, with system-font stacks; integrate mark, focus, surfaces and readable HUD into existing screens without moving their controls.
3. Create a standalone development showcase using native controls and dialog. Implement only showcase interactions in an isolated script, with theme stored in page memory so it cannot overwrite game preferences.
4. Verify static assets, syntax, reference links and theme wiring; serve locally and inspect real game and showcase at representative widths when supported. Document exact evidence and gaps, preserve CP01 issue register and avoid claims of WCAG compliance.

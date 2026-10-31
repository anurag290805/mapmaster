# CP03 accessibility verification

New navigation uses buttons within a labeled nav and `aria-current`; mobile menu exposes `aria-expanded`. Mode and region controls are native buttons, with selected state reflected through `aria-pressed`. Native dialogs provide modal semantics, Escape behavior and focus restoration. New screens receive focus after navigation; country search has a label and status for no results. Help uses native disclosures. Existing CP02 focus-visible and reduced-motion styles remain. The app describes map and data limitations without color alone.

Brave verified mode selection, search empty state, onboarding replay/skip/completion and focus return; mobile menu expanded. Node tests cover storage failures and exclusive screen transitions. Full Tab/Shift+Tab traversal, assistive technology, contrast auditing, physical touch targets, text zoom and reduced-motion rendering were not tested. Native exit confirmation was later verified in Brave as recorded in the navigation report. Existing map keyboard access I-07 remains CP05/11. No WCAG conformance claim is made.

## Targeted re-verification — 2026-10-31

Brave's accessibility tree exposed named navigation and controls, selected state for setup buttons, headings, the search label and the modal introduction. Enter advanced and completed the four-step introduction; Space advanced a replay; Escape closed it and restored focus to Help's replay button. Completing a Settings replay restored focus to Settings; Escape also closed Settings and restored focus. At 390 × 844, the guide and Settings actions were visible in the inspected screenshots. This is partial keyboard and dialog evidence, not exhaustive Tab/Shift+Tab traversal or a screen-reader test. At the time of that observation, setup headings skipped from h1 to h3; this was corrected in the final CP03 changes below. Contrast measurement, 200% text scaling, reduced-motion behavior, touch-target measurements and physical-touch testing remain unverified.

The earlier storage-denial observation was corrected in the final CP03 changes below.

## Final corrections — 2026-10-31

Setup now has an h1 and two h2 section headings, with the former small uppercase presentation preserved. Brave's accessibility tree confirmed the hierarchy for world and Europe; DOM inspection confirmed it for Japan and after challenge-settings Back. The denied-storage path was tested using the actual navigation script in a simulated DOM: the guide opens, skip and completion close it, navigation does not reopen it, and Help and Settings replay work without escaping storage errors. A browser with storage physically disabled was not tested. Memory persists only for the current page session; a reload with no storage can show the guide again.

Physical touch, screen readers, full focus-order traversal, contrast measurements, text scaling, reduced motion, and exhaustive viewport coverage remain deferred. No WCAG conformance claim is made.

# CP03 acceptance evidence

Status: DEVELOPMENT-ACCEPTED with documented limitations. The actual homepage, navigation, discovery, scope and country search, skippable/replayable onboarding, Help, Settings and honest progress empty state are implemented. Existing modes are reachable via the legacy engine, with known data/map defects disclosed. CP01/02 history remains in place; this acceptance does not authorize pushing or deploying.

Full viewport-by-screen visual verification, physical touch, screen-reader and contrast tests, and complete gameplay regression remain outstanding. Existing I-01/I-02/I-04/I-07/I-12/I-13/I-15 are not fixed. See the separate responsive, accessibility and gameplay reports for evidence and limits. No claim of production readiness or WCAG conformance.

## Targeted re-verification — 2026-10-31

At that time the status was **not accepted**. Brave against an uncached local server verified all four Play cards select the matching world game type, world typing practice, country search and Japan selection, challenge settings/back, confirmation cancel and confirm, and timer cessation after exit. The same session reproduced pre-existing I-15: after world practice, Japan challenge displayed world geometry despite `data="svg/japan.svg"`; the server saw no Japan SVG request. Its cause is unconfirmed and no map defect was concealed or changed. This blocks a clean gameplay-readiness recommendation and is assigned to CP05.

Seven CP02/CP03 Node tests passed; JavaScript syntax checks passed; 36 SVGs parsed; HTML local references and duplicate IDs passed; regenerated SVG inventory matched the checked-in report. The data audit exited 1 for the two known missing America paths, with existing coverage gaps. `git diff --check` passed. The application links `assets/brand/icon.svg`, which the local server served successfully. No `/favicon.ico` request appeared on the fresh-port run; no application reference to it exists. A request for that path would be a browser fallback, not evidence of a missing application reference.

This is targeted evidence, not a complete acceptance matrix. Physical touch, screen-reader testing, exhaustive responsive/keyboard/contrast/reduced-motion checks, full gameplay completion and independent-browser reproduction remain open. See the companion reports. The initial test port served cached older scripts; testing was repeated on a fresh port.

## Final CP03 corrections — 2026-10-31

The setup screen now uses an h1 followed by two h2 section headings, styled as before. Brave exposed these levels in world, Europe and Japan setup and after challenge-settings Back. Onboarding now opens on first visit even if both storage writes fail, using in-memory state for the current page session. Automated integration-style tests run the navigation script against denied storage and cover skip, completion, navigation without reopening, and replay from Help and Settings. If storage remains unavailable, a full reload starts a new page session and can show the introduction again.

A focused browser run started a two-minute challenge and exited via the in-game restart control; the displayed timer stayed at 01:17 while navigating. Prior browser evidence covers cancel and confirm on the primary-navigation exit. A focused lifecycle test exercises the real start, transition and timer functions with a controlled clock: repeated starts leave one timer, exit clears it, and restart creates one new timer. This is targeted verification, not proof of every gameplay path.

The user granted **development acceptance of CP03** with the inherited defects and deferred checks explicitly disclosed. I-15 remains assigned to CP05: after world practice, choose Japan and start a challenge; Japan labels/count may accompany world geometry, the object references Japan, and no Japan SVG request was observed. Root cause remains unconfirmed. Existing geography audit failures and gameplay defects remain open. No full WCAG or production-readiness claim is made.

Final automated verification: `node --test tests/*.test.cjs` passed 10/10 (3 CP02 and 7 CP03); all JavaScript syntax checks passed; 36 SVGs parsed; 23 HTML references were checked with no missing local files or duplicate IDs; regenerated SVG inventory matched; `git diff --check` passed. The geography data audit exited 1 for the two known missing configured America paths and continues to report incomplete coverage.

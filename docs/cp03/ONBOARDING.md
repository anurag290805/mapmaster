# Onboarding

A four-step native dialog explains discovery, scopes, practice/challenge, hints, score, guest theme and unsaved progress. It can be skipped, closed with Escape, completed, and replayed from Help or Settings. The `mapmaster-onboarding-v1` key stores `pending` or `done`; a pending marker prevents forced repetition on reload. Local storage is preferred; session storage is fallback. If neither can be written, the introduction opens and its seen state is retained in memory for the current page session; a reload may show it again. No existing key is removed. Returning focus uses the opener; native dialog provides modal focus behavior.

Brave verified first appearance, skip, reload without repeat, replay, advance through four steps, completion and focus return. Denied storage was exercised in simulated-DOM tests of the navigation script, not in a browser; cross-browser dialog and assistive-technology behavior need further testing.

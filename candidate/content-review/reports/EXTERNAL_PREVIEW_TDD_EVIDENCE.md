# External geography preview — TDD evidence

Source plan: user-requested complete external geography integration and gameplay expansion; no untrusted plan command was executed. The preview deliberately stays outside production gameplay.

| Journey | Guarantee | RED evidence | GREEN evidence |
|---|---|---|---|
| Reviewer opens the development preview | Only technical-accepted, human-pending, gameplay-blocked records can be shown. | `node --test tests/external-content-preview-core.test.cjs` initially failed with `ERR_MODULE_NOT_FOUND` for the absent preview core. | Same command passed 3/3 after `pilot/external-content-preview-core.mjs` was added. |
| Reviewer repeats a candidate trivia run | A seed gives a stable queue and the source array is not mutated. | Same RED run above. | Core test proves repeatable same-seed selection, different-seed ordering, and source immutability. |
| Reviewer completes a preview | Results cannot award XP or write progression, Daily, or cloud records. | Same RED run above. | Core test asserts `xp_awarded: 0` and all eligibility flags are false. |
| Reviewer opens the preview in browser | Local development can show it; production and service worker cannot ship or activate it. | Focused Playwright run initially failed because Vite removed a trailing slash from the candidate base URL and returned `index.html` to JSON parsing. | `npx playwright test tests/e2e/external-content-preview.spec.ts`: 3 passed, 3 expected project skips. Production and subpath query assertions passed. |

Focused coverage is behavioral: `tests/external-content-preview-core.test.cjs` covers the pure policy boundary, deterministic queue, and non-rewarding result; `tests/e2e/external-content-preview.spec.ts` covers the local browser surface and both production targets. The repository has no configured coverage script, so no percentage is claimed.

No TDD checkpoint commits were created because the task expressly prohibits commits. The raw snapshots and normalized records were never edited.

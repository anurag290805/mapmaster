# CP07 Geography Content & Learning — Design

## Intent

Give a player an accessible, useful way to retain the answer they just encountered and review missed answers without adding a data source, geography, or a second session model.

## Constraints

- Reuse the CP04 session state, results flow, and CP06 choice controls.
- Use only current prompt and accepted-answer records. Do not add country facts or alter pools.
- `docs/audit/ASSET_PROVENANCE.md` records `data.js` geography/flag facts as lacking documented provenance. Any richer country fact is therefore unavailable, not inferred.
- Keep CP05 candidate assets and public-beta gate unchanged.

## Approach

Add one shared learning cue renderer. After a scored or incorrect answer it displays the current game prompt and the accepted answer, with a clear source-status note. Expand the existing CP04 review mode with a keyboard-operable review card for each missed item and next/previous navigation. It derives display copy from the active game type and existing data only; an item without an available accepted answer says so.

## Alternatives considered

- Add facts such as capitals, regions, populations, or history: rejected because the installed dataset has no factual provenance record.
- Import a new geography dataset or service: rejected by scope and release constraints.
- Add a separate learning mode/state engine: rejected because the existing results/review lifecycle already supplies the required navigation and restart behavior.

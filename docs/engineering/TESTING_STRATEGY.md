# Testing strategy

- `npm test`: ten existing CP02/CP03 Node tests plus the Vitest unit suite.
- `npm run test:legacy`, `npm run test:unit`: run the suites independently.
- `npm run test:e2e`: builds first and runs Playwright against separate Vite dev and preview servers. Install a browser with `npx playwright install chromium`, or set `MAPMASTER_BROWSER_PATH` to a compatible Chromium-family executable. Without one Playwright reports an actionable launch failure. For the recorded test, the installed Brave executable was supplied explicitly. Tests isolate their browser context and abort external HTTPS requests; they do not clear the user's existing browser storage.
- `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm run check`: new TypeScript, tests and config are the initial quality scope. Legacy JS remains covered by Node tests and `node --check`, not a wholesale formatting rewrite. `check` excludes E2E because browsers and local listeners are environment-dependent.

Smoke tests do not prove full gameplay, accessibility or map hit-testing. Known data and map defects are not silently marked passing. Run `node tools/audit-data.cjs` and `python3 tools/audit-svg.py` separately; the former intentionally exits nonzero for two existing missing paths.

# Architecture decisions

## ADR: staged migration of the classic application

The nine game scripts share globals and rely on HTML execution order. Replacing all of them with ES modules would change their binding and initialization semantics. Vite therefore processes HTML/CSS and the typed search module, while an explicit build plugin copies the nine runtime scripts unchanged in their existing order. The plugin also copies map and brand assets; `base: './'` supports relative static hosting. The design-system showcase remains in the repository and dev server but is deliberately excluded from the game build. Docs, tests, source maps and node_modules are not published.

Country-search matching is a pure TypeScript function, with DOM wiring in `src/ui`. Game state, rules, maps and navigation remain legacy globals; new code should use narrow explicit exports, keep DOM code out of pure rules and avoid importing legacy scripts as modules. Future folders can be introduced as functionality migrates; no duplicate game engine is created here. I-15 map switching and other gameplay defects remain open. An automatic bundler warning for each classic script is expected and is not proof that it was copied: inspect build output and run preview tests.

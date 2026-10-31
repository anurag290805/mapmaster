# Development setup

Use Node.js 22.12 or later and npm. This work was tested with Node 22.23.2 and npm 10.9.8. From a clone of the repository:

```sh
npm ci
npm run dev
```

Open the printed localhost URL. Vite is required to serve the TypeScript country search; opening `index.html` directly or serving the unbuilt source as plain static files is not supported. `npm run build` creates `dist/`; `npm run preview` serves that build locally. `npm run check` runs legacy and unit tests, typecheck, lint, format check and build. See TESTING_STRATEGY.md for browser tests. The pre-existing .DS_Store files are ignored but were not removed. No credentials or paid service are required.

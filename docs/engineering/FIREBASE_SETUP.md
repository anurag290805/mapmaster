# Firebase setup (Spark / ₹0)

## Emulator-verified configuration

1. Install the Firebase CLI locally (`npm install --save-dev firebase-tools`) only if it is not already available. For the full local verification, run `npm run test:e2e:emulator`; it starts Auth and Firestore for the test process, forces browser emulator mode, and supplies a synthetic `mapmaster-local-acceptance` configuration rather than reading `.env.local`. For manual work, use `npx firebase emulators:start --only auth,firestore`.
2. Copy `.env.example` to `.env.local`; leave `VITE_USE_FIREBASE_EMULATORS=true`. The values can be any syntactically valid Firebase web config for emulator-only work, but never add service-account keys.
3. Run the Vite app. Auth connects to `127.0.0.1:9099`; Firestore connects to `127.0.0.1:8080`. Do not treat a production `.env.local` setting as emulator evidence: the dedicated script sets the required environment variables itself.

## Later: exact Firebase Console steps

1. Create a Firebase project on the Spark plan; do not attach billing or upgrade to Blaze.
2. Add a Web app, then copy its public web config fields to `.env.local` / the host's build-time environment.
3. Authentication → Sign-in method: enable **Email/Password** and **Google**. Add each production/staging web origin to Authorized domains.
4. Authentication → Templates: set the password reset and verification action URL to your approved HTTPS site origin.
5. Firestore Database: create a production database only after reviewing location and Spark eligibility. Publish `firestore.rules` via a deliberate manual release. Do not enable Storage, Functions, paid APIs, or billing.
6. Verify registration, email verification, reset email, Google popup and redirect fallback, two-device merge, account deletion, and offline recovery on the real domain before any release.

## Data policy and limits

Player data is one private `players/{uid}` document: XP/progression, daily history, and minimal preferences. The browser keeps a local copy for guest/offline play. A merge never adds XP; it selects the higher valid total, unions achievements, preserves better records, and deduplicates daily identities. This is client-managed gameplay data, not tamper-proof scoring. No Firestore data is cached by the service worker, and no public leaderboard is implemented.

## Manual device QA pending

- Android Chrome install prompt and offline launch after a first online visit.
- iOS Safari Add to Home Screen, standalone auth redirect return, and service-worker update behavior.
- Google provider behavior under popup blockers and restrictive in-app browsers.
- Account switching on a shared device and deletion confirmation/re-auth behavior.

import assert from "node:assert/strict";
import test from "node:test";
import { initializeApp } from "firebase/app";
import { connectAuthEmulator, createUserWithEmailAndPassword, deleteUser, getAuth, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from "firebase/auth";

const host = process.env.FIREBASE_AUTH_EMULATOR_HOST;
test("Authentication emulator registers, signs in/out, invokes callbacks, and deletes an account", { skip: !host && "Set FIREBASE_AUTH_EMULATOR_HOST via firebase emulators:exec." }, async () => {
  const app = initializeApp({ apiKey: "emulator-key", authDomain: "localhost", projectId: process.env.GCLOUD_PROJECT ?? "mapmaster-local-acceptance", appId: `auth-test-${Date.now()}` }, `auth-${Date.now()}`);
  const auth = getAuth(app);
  connectAuthEmulator(auth, `http://${host}`, { disableWarnings: true });
  const email = `explorer-${Date.now()}@example.test`;
  const seen = [];
  const unsubscribe = onAuthStateChanged(auth, (user) => seen.push(user?.uid ?? null));
  const created = await createUserWithEmailAndPassword(auth, email, "local-pass-123");
  assert.equal(auth.currentUser?.uid, created.user.uid);
  await signOut(auth);
  assert.equal(auth.currentUser, null);
  const loggedIn = await signInWithEmailAndPassword(auth, email, "local-pass-123");
  assert.equal(loggedIn.user.uid, created.user.uid);
  await deleteUser(loggedIn.user);
  assert.equal(auth.currentUser, null);
  unsubscribe();
  assert.ok(seen.includes(created.user.uid));
  assert.ok(seen.includes(null));
});

test("Authentication emulator accepts a password-reset request for a local account", { skip: !host && "Set FIREBASE_AUTH_EMULATOR_HOST via firebase emulators:exec." }, async () => {
  const app = initializeApp({ apiKey: "emulator-key", authDomain: "localhost", projectId: process.env.GCLOUD_PROJECT ?? "mapmaster-local-acceptance", appId: `auth-reset-${Date.now()}` }, `auth-reset-${Date.now()}`);
  const auth = getAuth(app);
  connectAuthEmulator(auth, `http://${host}`, { disableWarnings: true });
  const email = `reset-${Date.now()}@example.test`;
  const created = await createUserWithEmailAndPassword(auth, email, "local-pass-123");
  await assert.doesNotReject(sendPasswordResetEmail(auth, email));
  await deleteUser(created.user);
});

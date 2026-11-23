import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  browserLocalPersistence,
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  deleteUser,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type Auth,
  type User,
} from "firebase/auth";
import {
  connectFirestoreEmulator,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  runTransaction,
  type Firestore,
} from "firebase/firestore";
import {
  mergeCloudSaves,
  sameCloudSaveContent,
  sanitizeCloudSave,
} from "../shared/cloud-save";
import type { CloudSaveGateway } from "../shared/cloud-sync";

const env = import.meta.env;
const configured = Boolean(
  env.VITE_FIREBASE_API_KEY &&
  env.VITE_FIREBASE_AUTH_DOMAIN &&
  env.VITE_FIREBASE_PROJECT_ID &&
  env.VITE_FIREBASE_APP_ID,
);
export interface FirebaseClient {
  auth: Auth;
  db: Firestore;
  gateway: CloudSaveGateway;
}
let client: FirebaseClient | null = null;

export function firebaseClient(): FirebaseClient | null {
  if (!configured) return null;
  if (client) return client;
  const app: FirebaseApp =
    getApps()[0] ??
    initializeApp({
      apiKey: env.VITE_FIREBASE_API_KEY,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: env.VITE_FIREBASE_PROJECT_ID,
      appId: env.VITE_FIREBASE_APP_ID,
    });
  const auth = getAuth(app);
  const db = getFirestore(app);
  if (env.VITE_USE_FIREBASE_EMULATORS === "true") {
    connectAuthEmulator(
      auth,
      `http://${env.VITE_FIREBASE_AUTH_EMULATOR_HOST ?? "127.0.0.1:9099"}`,
      { disableWarnings: true },
    );
    connectFirestoreEmulator(
      db,
      "127.0.0.1",
      Number(env.VITE_FIRESTORE_EMULATOR_PORT ?? "8080"),
    );
  }
  void setPersistence(auth, browserLocalPersistence);
  const gateway: CloudSaveGateway = {
    subscribe(uid, listener, onError) {
      return onSnapshot(
        doc(db, "players", uid),
        (snapshot) =>
          listener(
            snapshot.exists() ? sanitizeCloudSave(snapshot.data()) : null,
          ),
        onError,
      );
    },
    async write(uid, save) {
      await runTransaction(db, async (tx) => {
        const ref = doc(db, "players", uid);
        const current = await tx.get(ref);
        const merged = mergeCloudSaves(
          current.exists() ? current.data() : save,
          save,
        );
        if (!current.exists() || !sameCloudSaveContent(current.data(), merged))
          tx.set(ref, merged);
      });
    },
  };
  client = { auth, db, gateway };
  return client;
}
export function listenForUser(callback: (user: User | null) => void) {
  const current = firebaseClient();
  return current ? onAuthStateChanged(current.auth, callback) : () => {};
}
function userError(error: unknown) {
  const code =
    typeof error === "object" && error && "code" in error
      ? String((error as { code: string }).code)
      : "";
  return code.includes("invalid-credential")
    ? "Incorrect email or password."
    : code.includes("email-already-in-use")
      ? "An account already uses this email."
      : code.includes("weak-password")
        ? "Use at least 8 characters for your password."
        : "That account action could not be completed.";
}

function errorCode(error: unknown) {
  return typeof error === "object" && error && "code" in error
    ? String((error as { code: string }).code)
    : "";
}

export function verificationNotice(code: string) {
  return code.includes("too-many-requests")
    ? "Account created, but the verification email was rate-limited. You can still play; try again later."
    : code.includes("unauthorized-continue-uri") ||
        code.includes("invalid-continue-uri")
      ? "Account created, but Firebase could not send the verification email. Check the authorized domain and try again."
      : "Account created, but the verification email could not be sent. You can still play and try again later.";
}

export function shouldUseGoogleRedirectFallback(code: string) {
  return code === "auth/popup-blocked";
}

export function isGooglePopupCancellation(code: string) {
  return code === "auth/popup-closed-by-user";
}

export interface RegistrationResult {
  verificationNotice?: string;
}

export async function register(
  email: string,
  password: string,
): Promise<RegistrationResult> {
  const c = firebaseClient();
  if (!c) throw new Error("Accounts are not configured for this build yet.");
  let user: User;
  try {
    const result = await createUserWithEmailAndPassword(
      c.auth,
      email,
      password,
    );
    user = result.user;
  } catch (error) {
    throw new Error(userError(error), { cause: error });
  }
  try {
    await sendEmailVerification(user);
    return {};
  } catch (error) {
    return { verificationNotice: verificationNotice(errorCode(error)) };
  }
}
export async function signIn(email: string, password: string) {
  const c = firebaseClient();
  if (!c) throw new Error("Accounts are not configured for this build yet.");
  try {
    await signInWithEmailAndPassword(c.auth, email, password);
  } catch (error) {
    throw new Error(userError(error), { cause: error });
  }
}
export async function resetPassword(email: string) {
  const c = firebaseClient();
  if (!c) throw new Error("Accounts are not configured for this build yet.");
  if (!email) throw new Error("Enter your email address first.");
  await sendPasswordResetEmail(c.auth, email);
}
export async function googleSignIn() {
  const c = firebaseClient();
  if (!c) throw new Error("Accounts are not configured for this build yet.");
  try {
    await signInWithPopup(c.auth, new GoogleAuthProvider());
  } catch (error) {
    const code = String((error as { code?: string })?.code ?? "");
    if (shouldUseGoogleRedirectFallback(code)) {
      await signInWithRedirect(c.auth, new GoogleAuthProvider());
      return;
    }
    if (isGooglePopupCancellation(code)) return;
    throw new Error(userError(error), { cause: error });
  }
}
export async function logout() {
  const c = firebaseClient();
  if (c) await signOut(c.auth);
}
export async function deleteCurrentAccount() {
  const c = firebaseClient();
  if (!c?.auth.currentUser) return;
  await deleteDoc(doc(c.db, "players", c.auth.currentUser.uid));
  await deleteUser(c.auth.currentUser);
}

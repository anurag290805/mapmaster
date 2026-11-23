import { createCloudSave, type CloudSaveV1 } from "../shared/cloud-save";
import { createCloudSyncCoordinator } from "../shared/cloud-sync";
import {
  deleteCurrentAccount,
  firebaseClient,
  googleSignIn,
  listenForUser,
  logout,
  register,
  resetPassword,
  signIn,
} from "./firebase-client";
import { setAccountActions, setAccountUiState } from "./account-bridge";

type LocalServices = {
  MapMasterProgression?: {
    getState(): unknown;
    replaceState(value: unknown): void;
  };
  MapMasterDaily?: { getState(): unknown; replaceState(value: unknown): void };
};
const services = window as Window & LocalServices;
function localSave(): CloudSaveV1 {
  return createCloudSave({
    progress: services.MapMasterProgression?.getState(),
    daily: services.MapMasterDaily?.getState(),
  });
}
function importSave(save: CloudSaveV1) {
  applyingCloudSave = true;
  try {
    services.MapMasterProgression?.replaceState(save.progress);
    services.MapMasterDaily?.replaceState(save.daily);
  } finally {
    applyingCloudSave = false;
  }
}
const client = firebaseClient();
setAccountUiState({ available: Boolean(client) });
const sync = client
  ? createCloudSyncCoordinator(
      localSave,
      importSave,
      client.gateway,
      (sync, detail) => setAccountUiState({ sync, detail }),
    )
  : null;
const GUEST_SAVE_KEY = "mapmaster-cloud-guest-v1";
const accountSaveKey = (uid: string) => `mapmaster-cloud-account-v1:${uid}`;
let activeUid: string | null = null;
let guestSave = localSave();
let applyingCloudSave = false;
function remember(key: string, save: CloudSaveV1) {
  try {
    window.localStorage.setItem(key, JSON.stringify(save));
  } catch {
    /* optional browser persistence */
  }
}
function recalled(key: string): CloudSaveV1 | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? createCloudSave(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}
function resetGuestSave() {
  guestSave = createCloudSave();
  remember(GUEST_SAVE_KEY, guestSave);
}
remember(GUEST_SAVE_KEY, guestSave);
setAccountActions({
  signIn,
  register,
  resetPassword,
  signInWithGoogle: googleSignIn,
  signOut: logout,
  deleteAccount: deleteCurrentAccount,
});
listenForUser((user) => {
  const previousUid = activeUid;
  if (previousUid) remember(accountSaveKey(previousUid), localSave());
  sync?.activate(null);
  activeUid = user?.uid ?? null;
  if (user && previousUid !== user.uid) {
    const cached = recalled(accountSaveKey(user.uid));
    if (cached) importSave(cached);
    else if (previousUid) importSave(createCloudSave());
    // Guest progress is now part of this signed-in profile.  Do not retain it
    // as a future guest migration source after the account is signed out.
    if (!previousUid) resetGuestSave();
  }
  if (!user && previousUid) importSave(recalled(GUEST_SAVE_KEY) ?? guestSave);
  sync?.activate(activeUid);
  setAccountUiState(
    user
      ? {
          identity: user.displayName || user.email || "Signed in",
          sync: "syncing",
          signedIn: true,
          error: "",
          detail: user.emailVerified
            ? undefined
            : "Signed in — verify your email to secure recovery.",
        }
      : {
          identity: "Playing as guest",
          detail: "",
          error: "",
          sync: "local-only",
          signedIn: false,
        },
  );
});
document.addEventListener("mapmaster:local-save-changed", () => {
  const current = localSave();
  if (activeUid) remember(accountSaveKey(activeUid), current);
  else {
    guestSave = current;
    remember(GUEST_SAVE_KEY, current);
  }
  if (!applyingCloudSave) sync?.schedule();
});
window.addEventListener("online", () => sync?.schedule());
window.addEventListener("offline", () =>
  setAccountUiState({ sync: "offline" }),
);

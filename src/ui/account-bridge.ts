export type SyncState =
  "local-only" | "syncing" | "saved" | "offline" | "error";

export interface AccountUiState {
  identity?: string;
  detail?: string;
  sync?: SyncState;
  signedIn?: boolean;
  available?: boolean;
  error?: string;
  notice?: string;
}

export interface AccountActions {
  signIn(email: string, password: string): Promise<void>;
  register(
    email: string,
    password: string,
  ): Promise<{ verificationNotice?: string }>;
  resetPassword(email: string): Promise<void>;
  signInWithGoogle(): Promise<void>;
  signOut(): Promise<void>;
  deleteAccount(): Promise<void>;
}

const dialog = document.querySelector<HTMLDialogElement>("#accountDialog");
const status = document.querySelector<HTMLElement>("#cloudSyncStatus");
const identity = document.querySelector<HTMLElement>("#accountIdentity");
const guestNote = document.querySelector<HTMLElement>("#accountGuestNote");
const error = document.querySelector<HTMLElement>("#accountError");
const notice = document.querySelector<HTMLElement>("#accountNotice");
const form = document.querySelector<HTMLFormElement>("#accountEmailForm");
const email = document.querySelector<HTMLInputElement>("#accountEmail");
const password = document.querySelector<HTMLInputElement>("#accountPassword");
const register = document.querySelector<HTMLButtonElement>("#accountRegister");
const signOut = document.querySelector<HTMLButtonElement>("#accountSignOut");
const remove = document.querySelector<HTMLButtonElement>("#accountDelete");
const unavailable = document.querySelector<HTMLElement>("#accountUnavailable");
const google = document.querySelector<HTMLButtonElement>("#accountGoogle");
const reset = document.querySelector<HTMLButtonElement>("#accountReset");
const signIn = form?.querySelector<HTMLButtonElement>("button[type='submit']");
let actions: AccountActions | null = null;
let current: Required<AccountUiState> = {
  identity: "Playing as guest",
  detail: "",
  sync: "local-only",
  signedIn: false,
  available: false,
  error: "",
  notice: "",
};

function readableState(state: SyncState) {
  return {
    "local-only": "Local only",
    syncing: "Syncing…",
    saved: "Saved to cloud",
    offline: "Offline — changes will sync later",
    error: "Cloud sync needs attention",
  }[state];
}

export function setAccountUiState(next: AccountUiState) {
  current = { ...current, ...next };
  if (identity) identity.textContent = current.identity;
  if (guestNote) guestNote.hidden = current.signedIn;
  if (status) {
    status.textContent = current.detail || readableState(current.sync);
    status.dataset.state = current.sync;
  }
  if (error) error.textContent = current.error;
  if (notice) notice.textContent = current.notice;
  signOut?.classList.toggle("hidden", !current.signedIn);
  remove?.classList.toggle("hidden", !current.signedIn);
  const unavailableHere = !current.available && !current.signedIn;
  unavailable?.toggleAttribute("hidden", !unavailableHere);
  [email, password, signIn, register, google, reset].forEach((control) => {
    if (control) control.disabled = unavailableHere;
  });
}

export function setAccountActions(next: AccountActions) {
  actions = next;
}

export function successfulAccountActionFeedback(action: keyof AccountActions) {
  return action === "resetPassword"
    ? {
        error: "",
        notice:
          "If an account matches this address, password-reset instructions were requested.",
      }
    : { error: "", notice: "" };
}

async function invoke(action: keyof AccountActions) {
  if (!actions) {
    setAccountUiState({
      sync: "local-only",
      error: "Accounts are not configured for this build yet.",
    });
    return;
  }
  try {
    setAccountUiState({ error: "", notice: "" });
    if (action === "signIn")
      await actions.signIn(email?.value.trim() ?? "", password?.value ?? "");
    else if (action === "register") {
      const result = await actions.register(
        email?.value.trim() ?? "",
        password?.value ?? "",
      );
      setAccountUiState({ error: result.verificationNotice ?? "" });
    } else if (action === "resetPassword") {
      await actions.resetPassword(email?.value.trim() ?? "");
      setAccountUiState(successfulAccountActionFeedback(action));
    } else await actions[action]();
  } catch (caught) {
    setAccountUiState({
      error:
        caught instanceof Error
          ? caught.message
          : "That account action could not be completed.",
    });
  }
}

document
  .querySelector("#openAccount")
  ?.addEventListener("click", () => dialog?.showModal());
document
  .querySelectorAll<HTMLElement>("[data-close='accountDialog']")
  .forEach((button) => button.addEventListener("click", () => dialog?.close()));
form?.addEventListener("submit", (event) => {
  event.preventDefault();
  void invoke("signIn");
});
register?.addEventListener("click", () => void invoke("register"));
document
  .querySelector("#accountGoogle")
  ?.addEventListener("click", () => void invoke("signInWithGoogle"));
document
  .querySelector("#accountReset")
  ?.addEventListener("click", () => void invoke("resetPassword"));
signOut?.addEventListener("click", () => void invoke("signOut"));
remove?.addEventListener("click", () => {
  if (
    window.confirm(
      "Delete this account and its cloud save? This cannot be undone.",
    )
  )
    void invoke("deleteAccount");
});
setAccountUiState({ sync: "local-only" });

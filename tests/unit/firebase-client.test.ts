import { beforeEach, describe, expect, it, vi } from "vitest";

const firebase = vi.hoisted(() => ({
  createUserWithEmailAndPassword: vi.fn(),
  sendEmailVerification: vi.fn(),
  signInWithPopup: vi.fn(),
  signInWithRedirect: vi.fn(),
}));

vi.mock("firebase/app", () => ({
  getApps: vi.fn(() => []),
  initializeApp: vi.fn(() => ({})),
}));
vi.mock("firebase/auth", async () => {
  const actual =
    await vi.importActual<typeof import("firebase/auth")>("firebase/auth");
  return {
    ...actual,
    createUserWithEmailAndPassword: firebase.createUserWithEmailAndPassword,
    getAuth: vi.fn(() => ({})),
    sendEmailVerification: firebase.sendEmailVerification,
    setPersistence: vi.fn(() => Promise.resolve()),
    signInWithPopup: firebase.signInWithPopup,
    signInWithRedirect: firebase.signInWithRedirect,
  };
});
vi.mock("firebase/firestore", async () => {
  const actual =
    await vi.importActual<typeof import("firebase/firestore")>(
      "firebase/firestore",
    );
  return { ...actual, getFirestore: vi.fn(() => ({})) };
});

import {
  googleSignIn,
  isGooglePopupCancellation,
  register,
  shouldUseGoogleRedirectFallback,
  verificationNotice,
} from "../../src/ui/firebase-client";

describe("verificationNotice", () => {
  beforeEach(() => vi.clearAllMocks());

  it("explains that a throttled verification email does not undo account creation", () => {
    expect(verificationNotice("auth/too-many-requests")).toBe(
      "Account created, but the verification email was rate-limited. You can still play; try again later.",
    );
  });

  it("keeps a successfully created account signed in when verification email delivery fails", async () => {
    const user = { uid: "created-user" };
    firebase.createUserWithEmailAndPassword.mockResolvedValue({ user });
    firebase.sendEmailVerification.mockRejectedValue({
      code: "auth/too-many-requests",
    });

    await expect(
      register("founder@example.test", "local-pass-123"),
    ).resolves.toEqual({
      verificationNotice:
        "Account created, but the verification email was rate-limited. You can still play; try again later.",
    });
    expect(firebase.sendEmailVerification).toHaveBeenCalledWith(user);
  });

  it("uses redirect fallback only when a popup is blocked, not when the player cancels", () => {
    expect(shouldUseGoogleRedirectFallback("auth/popup-blocked")).toBe(true);
    expect(shouldUseGoogleRedirectFallback("auth/popup-closed-by-user")).toBe(
      false,
    );
    expect(isGooglePopupCancellation("auth/popup-closed-by-user")).toBe(true);
  });

  it("does not redirect or display a failed action when the Google popup is cancelled", async () => {
    firebase.signInWithPopup.mockRejectedValue({
      code: "auth/popup-closed-by-user",
    });

    await expect(googleSignIn()).resolves.toBeUndefined();
    expect(firebase.signInWithRedirect).not.toHaveBeenCalled();
  });

  it("uses the redirect fallback when the browser blocks Google popup sign-in", async () => {
    firebase.signInWithPopup.mockRejectedValue({ code: "auth/popup-blocked" });
    firebase.signInWithRedirect.mockResolvedValue(undefined);

    await expect(googleSignIn()).resolves.toBeUndefined();
    expect(firebase.signInWithRedirect).toHaveBeenCalledOnce();
  });
});

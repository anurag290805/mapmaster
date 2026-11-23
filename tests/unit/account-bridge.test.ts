import { beforeAll, describe, expect, it, vi } from "vitest";

const error = { textContent: "" };
const notice = { textContent: "" };

beforeAll(() => {
  vi.stubGlobal("document", {
    querySelector: vi.fn((selector: string) => {
      if (selector === "#accountError") return error;
      if (selector === "#accountNotice") return notice;
      return null;
    }),
    querySelectorAll: vi.fn(() => []),
  });
});

describe("account action feedback", () => {
  it("replaces a stale error with a cautious reset-request success notice", async () => {
    const { setAccountUiState, successfulAccountActionFeedback } =
      await import("../../src/ui/account-bridge");

    setAccountUiState({ error: "Incorrect email or password.", notice: "" });
    setAccountUiState(successfulAccountActionFeedback("resetPassword"));

    expect(successfulAccountActionFeedback("resetPassword")).toEqual({
      error: "",
      notice:
        "If an account matches this address, password-reset instructions were requested.",
    });
    expect(error.textContent).toBe("");
    expect(notice.textContent).toBe(
      "If an account matches this address, password-reset instructions were requested.",
    );
  });
});

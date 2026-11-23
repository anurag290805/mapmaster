import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

const password = "local-pass-123";
const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const accountA = `mapmaster-a-${id}@example.test`;
const accountB = `mapmaster-b-${id}@example.test`;
const isolationA = `mapmaster-isolation-a-${id}@example.test`;
const configuredProjectId =
  process.env.VITE_FIREBASE_PROJECT_ID ??
  readFileSync(".env.local", "utf8").match(
    /^VITE_FIREBASE_PROJECT_ID=(.+)$/m,
  )?.[1];

if (!configuredProjectId)
  throw new Error(
    "Set VITE_FIREBASE_PROJECT_ID for Firebase emulator E2E tests.",
  );

async function dismissGuide(page: import("@playwright/test").Page) {
  const skip = page.getByRole("button", { name: "Skip for now" });
  if (await skip.isVisible()) await skip.click();
}
async function openAccount(page: import("@playwright/test").Page) {
  if (!(await page.locator("#accountDialog").isVisible()))
    await page.getByRole("button", { name: "Account", exact: true }).click();
}
async function register(page: import("@playwright/test").Page, email: string) {
  await openAccount(page);
  await page.locator("#accountEmail").fill(email);
  await page.locator("#accountPassword").fill(password);
  await page.locator("#accountRegister").click();
  await expect(page.locator("#accountIdentity")).toContainText(email);
}
async function registerWithIdentity(
  page: import("@playwright/test").Page,
  email: string,
) {
  const response = page.waitForResponse(
    (candidate) =>
      candidate.url().includes("accounts:signUp") &&
      candidate.request().method() === "POST",
  );
  await register(page, email);
  const body = (await (await response).json()) as {
    idToken: string;
    localId: string;
  };
  return { token: body.idToken, uid: body.localId };
}
async function signIn(page: import("@playwright/test").Page, email: string) {
  await openAccount(page);
  await page.locator("#accountEmail").fill(email);
  await page.locator("#accountPassword").fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.locator("#accountIdentity")).toContainText(email);
}
async function award(page: import("@playwright/test").Page, resultId: string) {
  await page.evaluate((id) => {
    (
      window as unknown as {
        MapMasterProgression: { recordTerminalResult(result: object): void };
      }
    ).MapMasterProgression.recordTerminalResult({
      id,
      outcome: "won",
      gameType: "typing",
      mapKey: "india",
      gameMode: "challenge",
      selectedTime: 60,
      selectedLives: null,
      score: 10,
      correctAnswers: 10,
      totalAttempts: 10,
      bestStreak: 5,
      elapsedSeconds: 30,
    });
  }, resultId);
}
async function xp(page: import("@playwright/test").Page) {
  return page.evaluate(
    () =>
      (
        window as unknown as {
          MapMasterProgression: { getState(): { totalXp: number } };
        }
      ).MapMasterProgression.getState().totalXp,
  );
}

async function cloudUpdatedAt(
  request: import("@playwright/test").APIRequestContext,
  identity: { token: string; uid: string },
) {
  const url = `http://127.0.0.1:8080/v1/projects/${configuredProjectId}/databases/(default)/documents/players/${identity.uid}`;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const response = await request.get(url, {
      headers: { Authorization: `Bearer ${identity.token}` },
    });
    if (response.ok()) {
      const body = (await response.json()) as {
        fields: { updatedAt: { integerValue: string } };
      };
      return body.fields.updatedAt.integerValue;
    }
    expect(response.status()).toBe(404);
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Cloud save was not visible through the Firestore emulator.");
}

async function observedWriteTimes(
  page: import("@playwright/test").Page,
  request: import("@playwright/test").APIRequestContext,
  identity: { token: string; uid: string },
  samples = 4,
) {
  const values = new Set<string>();
  for (let sample = 0; sample < samples; sample += 1) {
    values.add(await cloudUpdatedAt(request, identity));
    await page.waitForTimeout(1_000);
  }
  return values;
}

test.describe("Firebase emulator cloud synchronization", () => {
  test.skip(
    !(
      process.env.FIREBASE_AUTH_EMULATOR_HOST &&
      process.env.FIRESTORE_EMULATOR_HOST &&
      process.env.VITE_USE_FIREBASE_EMULATORS === "true"
    ),
    "Run npm run test:e2e:emulator with Auth, Firestore, and the browser emulator mode enabled.",
  );

  test("emulator-backed cloud saves quiesce after echoes and one local edit", async ({
    browser,
    request,
  }) => {
    test.setTimeout(45_000);
    const device = await browser.newContext();
    const page = await device.newPage();
    await page.goto("./");
    await dismissGuide(page);
    const identity = await registerWithIdentity(
      page,
      `quiescent-${id}@example.test`,
    );
    await expect(page.locator("#cloudSyncStatus")).toHaveText(
      "Saved to cloud",
      {
        timeout: 15_000,
      },
    );

    const idleTimes = await observedWriteTimes(page, request, identity);
    expect(idleTimes.size).toBe(1);

    const beforeEdit = await cloudUpdatedAt(request, identity);
    await award(page, `quiescent-${id}`);
    await expect(page.locator("#cloudSyncStatus")).toHaveText(
      "Saved to cloud",
      {
        timeout: 15_000,
      },
    );
    const afterEdit = await observedWriteTimes(page, request, identity);
    expect(afterEdit.size).toBe(2);
    expect([...afterEdit]).toContain(beforeEdit);
    expect([...afterEdit].some((updatedAt) => updatedAt !== beforeEdit)).toBe(
      true,
    );
    await device.close();
  });

  test("emulator-backed guest migration and same-account restore", async ({
    browser,
  }) => {
    const guest = await browser.newContext();
    const pageA = await guest.newPage();
    await pageA.goto("./");
    await dismissGuide(pageA);
    await award(pageA, `guest-${id}`);
    const guestXp = await xp(pageA);
    expect(guestXp).toBeGreaterThan(0);

    await register(pageA, accountA);
    await expect(pageA.locator("#cloudSyncStatus")).toHaveText(
      "Saved to cloud",
      {
        timeout: 15_000,
      },
    );

    const deviceB = await browser.newContext();
    const pageB = await deviceB.newPage();
    await pageB.goto("./");
    await dismissGuide(pageB);
    await signIn(pageB, accountA);
    await expect.poll(() => xp(pageB), { timeout: 15_000 }).toBe(guestXp);

    await guest.close();
    await deviceB.close();
  });

  test("emulator-backed session restoration retains the account and does not duplicate XP", async ({
    browser,
  }) => {
    const device = await browser.newContext();
    const page = await device.newPage();
    const email = `restore-${id}@example.test`;
    await page.goto("./");
    await dismissGuide(page);
    await register(page, email);
    await award(page, `restore-${id}`);
    const savedXp = await xp(page);
    await expect(page.locator("#cloudSyncStatus")).toHaveText(
      "Saved to cloud",
      { timeout: 15_000 },
    );

    await page.reload();

    await expect(page.locator("#accountIdentity")).toContainText(email, {
      timeout: 15_000,
    });
    await expect(page.locator("#cloudSyncStatus")).toHaveText(
      "Saved to cloud",
      { timeout: 15_000 },
    );
    await expect.poll(() => xp(page), { timeout: 15_000 }).toBe(savedXp);
    await device.close();
  });

  test("emulator-backed offline progression retries without XP duplication", async ({
    browser,
  }) => {
    const device = await browser.newContext();
    const page = await device.newPage();
    await page.goto("./");
    await dismissGuide(page);
    await register(page, `offline-${id}@example.test`);
    await expect(page.locator("#cloudSyncStatus")).toHaveText(
      "Saved to cloud",
      {
        timeout: 15_000,
      },
    );
    await device.setOffline(true);
    await award(page, `offline-${id}`);
    const offlineXp = await xp(page);
    await expect(page.locator("#cloudSyncStatus")).toContainText("Offline");
    await device.setOffline(false);
    await expect(page.locator("#cloudSyncStatus")).toHaveText(
      "Saved to cloud",
      {
        timeout: 15_000,
      },
    );
    await expect.poll(() => xp(page), { timeout: 5_000 }).toBe(offlineXp);
    await device.close();
  });

  test("emulator-backed account switching does not leak account A progress to B", async ({
    browser,
  }) => {
    test.setTimeout(60_000);
    const device = await browser.newContext();
    const page = await device.newPage();
    await page.goto("./");
    await dismissGuide(page);
    await award(page, `isolation-${id}`);
    const accountAXp = await xp(page);
    await register(page, isolationA);
    await expect(page.locator("#cloudSyncStatus")).toHaveText(
      "Saved to cloud",
      {
        timeout: 15_000,
      },
    );
    await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page.locator("#accountIdentity")).toHaveText(
      "Playing as guest",
    );
    await expect.poll(() => xp(page), { timeout: 15_000 }).toBe(0);
    await register(page, accountB);
    await expect.poll(() => xp(page), { timeout: 15_000 }).toBe(0);
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page.locator("#accountIdentity")).toHaveText(
      "Playing as guest",
    );
    await signIn(page, isolationA);
    await expect.poll(() => xp(page), { timeout: 15_000 }).toBe(accountAXp);
    await device.close();
  });
});

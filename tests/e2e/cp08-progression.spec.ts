import { expect, test } from "@playwright/test";

type ProgressionWindow = Window & {
  MapMasterProgression: { recordTerminalResult(result: object): unknown };
};

test("progress dashboard persists local XP, supports keyboard reset, and fits mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 720 });
  await page.goto("./");
  await page.getByRole("button", { name: "Skip for now" }).click();
  await page.evaluate(() => {
    (
      window as unknown as ProgressionWindow
    ).MapMasterProgression.recordTerminalResult({
      id: "cp08-e2e",
      outcome: "won",
      gameType: "typing",
      mapKey: "world",
      gameMode: "practice",
      selectedTime: null,
      selectedLives: null,
      score: 5,
      correctAnswers: 5,
      totalAttempts: 5,
      bestStreak: 5,
      elapsedSeconds: 30,
    });
  });
  await page.getByRole("button", { name: "Menu" }).click();
  await page.locator("nav").getByRole("button", { name: "Progress" }).click();

  await expect(page.locator("#progressLevel")).toContainText("Level 1");
  await expect(page.locator("#progressXp")).toContainText("65 XP");
  await expect(page.locator("#achievementList")).toContainText("First Finish");
  await page.reload();
  await page.getByRole("button", { name: "Menu" }).click();
  await page.locator("nav").getByRole("button", { name: "Progress" }).click();
  await expect(page.locator("#progressXp")).toContainText("65 XP");
  await page.getByRole("button", { name: "Reset local progress" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#progressXp")).toContainText("0 XP");
  const bounds = await page
    .locator("#progressDashboard")
    .evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { left: rect.left, right: rect.right, width: window.innerWidth };
    });
  expect(bounds.left).toBeGreaterThanOrEqual(0);
  expect(bounds.right).toBeLessThanOrEqual(bounds.width);
});

test("progression fails closed for corrupt or unavailable local storage", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(Storage.prototype, "getItem", {
      configurable: true,
      value() {
        throw new Error("storage unavailable");
      },
    });
    Object.defineProperty(Storage.prototype, "setItem", {
      configurable: true,
      value() {
        throw new Error("storage unavailable");
      },
    });
    Object.defineProperty(Storage.prototype, "removeItem", {
      configurable: true,
      value() {
        throw new Error("storage unavailable");
      },
    });
  });
  await page.goto("./");
  await page.getByRole("button", { name: "Skip for now" }).click();
  const menu = page.getByRole("button", { name: "Menu" });
  if (await menu.isVisible()) await menu.click();
  await page.locator("nav").getByRole("button", { name: "Progress" }).click();
  await expect(page.locator("#progressXp")).toContainText("0 XP");
  await expect(page.locator("#achievementList")).toContainText(
    "No achievements yet",
  );
});

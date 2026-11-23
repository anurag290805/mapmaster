import { expect, test } from "@playwright/test";

test("daily challenge hub is keyboard accessible and future calendar days are locked", async ({
  page,
}) => {
  await page.goto("./");
  const skip = page.getByRole("button", { name: "Skip for now" });
  if (await skip.isVisible()) await skip.click();
  await page.getByRole("button", { name: "Daily challenge" }).click();
  await expect(
    page.getByRole("heading", { name: /daily geography challenge/i }),
  ).toBeVisible();
  await expect(page.locator("#dailyCalendar [role='row']")).toHaveCount(4);
  await expect(
    page.locator("#dailyCalendar [role='row']").first().getByRole("gridcell"),
  ).toHaveCount(7);
  await expect(
    page.locator("#dailyCalendar [role='gridcell'] button"),
  ).toHaveCount(28);
  await expect(
    page.locator("#dailyCalendar button[disabled]").first(),
  ).toBeDisabled();
  await page.locator("#dailyCalendar button").first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#dailyCalendar button").nth(1)).toBeFocused();
  await page.getByRole("button", { name: /easy/i }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#gameScreen")).toBeVisible();
  await expect(page.locator("#choiceOptions button")).toHaveCount(4);
});

test("daily result shares through clipboard when Web Share is unavailable", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          (window as Window & { copied?: string }).copied = text;
        },
      },
    });
  });
  await page.goto("./");
  const skip = page.getByRole("button", { name: "Skip for now" });
  if (await skip.isVisible()) await skip.click();
  await page.getByRole("button", { name: "Daily challenge" }).click();
  await page.getByRole("button", { name: /easy/i }).click();
  await page.evaluate(() => {
    (0, eval)(
      `gameState.score = 5; gameState.totalAttempts = 5; gameState.guessedStates = gameState.dailyQuestions.slice(); gameState.bestStreak = 5; endGame(true);`,
    );
  });
  await page.getByRole("button", { name: /share daily result/i }).click();
  await expect
    .poll(() =>
      page.evaluate(
        () => (window as Window & { copied?: string }).copied ?? "",
      ),
    )
    .toContain("MapMaster Daily");
});

test("a completed daily reward is idempotent across a replay", async ({
  page,
}) => {
  const finish = async () => {
    await page.evaluate(() => {
      (0, eval)(
        `gameState.score = 5; gameState.totalAttempts = 5; gameState.guessedStates = gameState.dailyQuestions.slice(); gameState.bestStreak = 5; endGame(true);`,
      );
    });
  };
  await page.goto("./");
  const skip = page.getByRole("button", { name: "Skip for now" });
  if (await skip.isVisible()) await skip.click();
  await page.getByRole("button", { name: "Daily challenge" }).click();
  await page.getByRole("button", { name: /easy/i }).click();
  await finish();
  const firstXp = await page.evaluate(
    () =>
      (
        window as unknown as Window & {
          MapMasterProgression: { getState(): { totalXp: number } };
        }
      ).MapMasterProgression.getState().totalXp,
  );
  await page.getByRole("button", { name: "Play Again" }).click();
  await page.getByRole("button", { name: "Daily challenge" }).click();
  await page.getByRole("button", { name: /easy/i }).click();
  await finish();
  const replayXp = await page.evaluate(
    () =>
      (
        window as unknown as Window & {
          MapMasterProgression: { getState(): { totalXp: number } };
        }
      ).MapMasterProgression.getState().totalXp,
  );
  expect(firstXp).toBeGreaterThan(0);
  expect(replayXp).toBe(firstXp);
  await expect(page.locator("#winProgressionAward")).toBeEmpty();
});

test("daily challenge remains playable when local storage throws", async ({
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
  });
  await page.goto("./");
  const skip = page.getByRole("button", { name: "Skip for now" });
  if (await skip.isVisible()) await skip.click();
  await page.getByRole("button", { name: "Daily challenge" }).click();
  await page.getByRole("button", { name: /hard/i }).click();
  await expect(page.locator("#gameScreen")).toBeVisible();
});

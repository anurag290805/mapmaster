import { expect, test, type Page } from "@playwright/test";

async function dismissGuide(page: Page) {
  const skip = page.getByRole("button", { name: "Skip for now" });
  if (await skip.isVisible()) await skip.click();
}

async function startDaily(page: Page) {
  await page.getByRole("button", { name: "Daily challenge" }).click();
  await page.getByRole("button", { name: /easy/i }).click();
  await expect(page.locator("#gameScreen")).toBeVisible();
}

async function startNormal(
  page: Page,
  gameType: "typing" | "capitalChoice" | "flagChoice",
) {
  await page.locator("nav").getByRole("button", { name: "Play" }).click();
  await page.locator(`.play-card[data-mode='${gameType}']`).click();
  await page.locator("#worldScopeBtn").click();
  await page.locator(`#${gameType}ModeBtn`).click();
  await page.locator("#practiceModeBtn").click();
  await page.locator("#homeStartBtn").click();
  await expect(page.locator("#gameScreen")).toBeVisible();
}

test("daily context cannot contaminate normal modes, ordinary XP, or delayed callbacks", async ({
  page,
}) => {
  await page.goto("./");
  await dismissGuide(page);
  await startDaily(page);
  await page.evaluate(() => {
    (0, eval)(
      "gameState.score=5;gameState.totalAttempts=5;gameState.guessedStates=gameState.dailyQuestions.slice();endGame(true);",
    );
  });
  const before = await page.evaluate(() => ({
    history: JSON.parse(localStorage.getItem("mapmaster-daily-v1") ?? "{}")
      .completions?.length,
    xp: (
      window as unknown as {
        MapMasterProgression: { getState(): { totalXp: number } };
      }
    ).MapMasterProgression.getState().totalXp,
  }));
  await page.getByRole("button", { name: "Play Again" }).click();

  for (const gameType of ["typing", "capitalChoice", "flagChoice"] as const) {
    await startNormal(page, gameType);
    const state = await page.evaluate(() =>
      (0, eval)(
        "({daily:!!gameState.dailyChallenge,queued:gameState.dailyQuestions.length,id:gameState.progressionResultId,type:gameState.gameType})",
      ),
    );
    expect(state).toEqual({
      daily: false,
      queued: 0,
      id: expect.stringMatching(/^v1-/),
      type: gameType,
    });
    await page.locator("#headerRestartBtn").click();
  }

  await startNormal(page, "typing");
  await page.evaluate(() => {
    (0, eval)(
      "gameState.score=CURRENT_REGIONS.length;gameState.totalAttempts=CURRENT_REGIONS.length;gameState.guessedStates=CURRENT_REGIONS.slice();endGame(true);",
    );
  });
  const afterNormal = await page.evaluate(() => ({
    history: JSON.parse(localStorage.getItem("mapmaster-daily-v1") ?? "{}")
      .completions?.length,
    xp: (
      window as unknown as {
        MapMasterProgression: { getState(): { totalXp: number } };
      }
    ).MapMasterProgression.getState().totalXp,
  }));
  expect(afterNormal.history).toBe(before.history);
  expect(afterNormal.xp).toBeGreaterThan(before.xp);

  await page.getByRole("button", { name: "Play Again" }).click();
  await startDaily(page);
  await page.evaluate(() => {
    (0, eval)(
      "handleChoiceSelection(gameState.choiceAnswer, document.querySelector('#choiceOptions button'))",
    );
  });
  await page.locator("#headerRestartBtn").click();
  await startNormal(page, "typing");
  await page.waitForTimeout(600);
  expect(
    await page.evaluate(() =>
      (0, eval)(
        "({daily:!!gameState.dailyChallenge,queued:gameState.dailyQuestions.length,type:gameState.gameType})",
      ),
    ),
  ).toEqual({ daily: false, queued: 0, type: "typing" });
});

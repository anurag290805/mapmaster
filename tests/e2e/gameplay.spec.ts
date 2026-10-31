import { expect, test, type Page } from "@playwright/test";

async function start(page: Page, mode: string, challenge = false) {
  await page.getByRole("button", { name: "Skip for now" }).click();
  await page.locator("nav").getByRole("button", { name: "Play" }).click();
  await page.locator(`.play-card[data-mode="${mode}"]`).click();
  await page.locator("#worldScopeBtn").click();
  await page
    .locator(challenge ? "#challengeModeBtn" : "#practiceModeBtn")
    .click();
  await page.locator("#homeStartBtn").click();
  if (challenge) {
    await page.locator('[data-time="120"]').click();
    if (mode === "locate") await page.locator('[data-lives="3"]').click();
    await page.locator("#startGameBtn").click();
  }
  await expect(page.locator("#gameScreen")).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.route("https://**/*", (route) => route.abort());
  await page.goto("./");
});

test("typing rejects partial and duplicate canonical answers", async ({
  page,
}) => {
  await start(page, "typing");
  await page.locator("#stateInput").fill("a");
  await page.locator("#submitAnswerBtn").click();
  await expect(page.locator("#progressLabel")).toContainText("0 / 194");
  await page.waitForTimeout(220);
  await page.locator("#stateInput").fill("USA");
  await page.locator("#submitAnswerBtn").click();
  await expect(page.locator("#progressLabel")).toContainText("1 / 194");
  await page.waitForTimeout(220);
  await page.locator("#stateInput").fill("United States");
  await page.locator("#submitAnswerBtn").click();
  await expect(page.locator("#progressLabel")).toContainText("1 / 194");
});

for (const mode of ["flag", "capital"]) {
  test(`${mode} challenge keeps infinite lives on a wrong answer`, async ({
    page,
  }) => {
    await start(page, mode, true);
    if (mode === "flag")
      await expect(page.locator(".flag-img")).toHaveAttribute(
        "alt",
        "Flag to identify",
      );
    await page.locator("#stateInput").fill("definitely incorrect");
    await page.locator("#submitAnswerBtn").click();
    await expect(page.locator("#gameScreen")).toBeVisible();
    await expect(page.locator("#livesDisplay")).toHaveText("∞");
    await expect(page.locator("#feedbackMessage")).toContainText("✗");
  });
}

test("a hint that reaches the deadline ends the session immediately", async ({
  page,
}) => {
  await start(page, "typing", true);
  await page.evaluate(() => {
    (0, eval)("gameState.deadline = performance.now() + 5000");
  });
  await page.locator("#hintBtn").click();
  await expect(page.locator("#loseScreen")).toBeVisible();
  await expect(page.locator("#loseReason")).toContainText("Time's up");
});

test("completion is unique and a new session starts cleanly", async ({
  page,
}) => {
  await start(page, "typing");
  await page.evaluate(() => {
    (0, eval)('CURRENT_REGIONS = ["Japan"]');
  });
  await page.locator("#stateInput").fill("Japan");
  await page.locator("#submitAnswerBtn").click();
  await expect(page.locator("#winScreen")).toBeVisible();
  await page.locator("#restartBtn").click();
  await page.locator("nav").getByRole("button", { name: "Play" }).click();
  await page.locator('.play-card[data-mode="typing"]').click();
  await page.locator("#worldScopeBtn").click();
  await page.locator("#practiceModeBtn").click();
  await page.locator("#homeStartBtn").click();
  await expect(page.locator("#progressLabel")).toContainText("0 / 194");
});

test("locate challenge ends on its last wrong life and review exits cleanly", async ({
  page,
}) => {
  await start(page, "locate", true);
  await expect
    .poll(
      () =>
        page.evaluate(() =>
          (0, eval)(
            `Boolean(svgLoaded && gameState.currentTarget && getSvgDoc()?.URL.endsWith('/svg/world.svg'))`,
          ),
        ),
      { timeout: 15000 },
    )
    .toBe(true);
  const clicked = await page.evaluate(() =>
    (0, eval)(`(() => {
    const path = [...getSvgDoc().querySelectorAll('path')].find(p => {
      const name = getRegionName(p);
      return name && CURRENT_REGIONS.includes(name) && name !== gameState.currentTarget;
    });
    if (!path) return false;
    gameState.livesLeft = 1;
    path.dispatchEvent(new MouseEvent('click', {bubbles: true}));
    return true;
  })()`),
  );
  expect(clicked).toBe(true);
  await expect(page.locator("#loseScreen")).toBeVisible();
  await expect(page.locator("#loseReason")).toContainText("lives");
  await page.locator("#reviewBtn").click();
  await expect(page.locator("#reviewBanner")).toBeVisible();
  await expect(page.locator("#gameScreen")).toBeFocused();
  expect(await page.evaluate(() => (0, eval)("gameState.reviewMode"))).toBe(
    true,
  );
  await page.locator("#reviewExitBtn").click();
  await expect(page.locator("#reviewBanner")).toHaveCount(0);
  await expect(page.locator("#startScreen")).toBeFocused();
  expect(await page.evaluate(() => (0, eval)("gameState.reviewMode"))).toBe(
    false,
  );
});

test("an answer after the deadline cannot score", async ({ page }) => {
  await start(page, "typing", true);
  await page.locator("#stateInput").fill("Japan");
  await page.evaluate(() => {
    (0, eval)(
      "gameState.deadline = performance.now() - 1; handleTypingSubmit()",
    );
  });
  await expect(page.locator("#loseScreen")).toBeVisible();
  expect(await page.evaluate(() => (0, eval)("gameState.score"))).toBe(0);
});

test("bonus answers count as correct attempts without inflating completion", async ({
  page,
}) => {
  await start(page, "typing", true);
  await page.evaluate(() => {
    (0, eval)('currentMapKey = "india"; CURRENT_REGIONS = ["Andhra Pradesh"]');
  });
  await page.locator("#stateInput").fill("Delhi");
  await page.locator("#submitAnswerBtn").click();
  await expect(page.locator("#progressLabel")).toContainText("0 / 1");
  await page.waitForTimeout(220);
  await page.locator("#stateInput").fill("Andhra Pradesh");
  await page.locator("#submitAnswerBtn").click();
  await expect(page.locator("#winScreen")).toBeVisible();
  await expect(page.locator("#finalAccuracy")).toHaveText("100");
  expect(
    await page.evaluate(() =>
      (0, eval)(
        "({score: gameState.score, bonus: gameState.bonusPoints, attempts: gameState.totalAttempts})",
      ),
    ),
  ).toEqual({ score: 1, bonus: 2, attempts: 2 });
  await page.evaluate(() => {
    (0, eval)('stateInput.value = "Andhra Pradesh"; handleTypingSubmit()');
  });
  expect(await page.evaluate(() => (0, eval)("gameState.totalAttempts"))).toBe(
    2,
  );
});

test("empty pools do not start a session", async ({ page }) => {
  await page.getByRole("button", { name: "Skip for now" }).click();
  await page.locator("nav").getByRole("button", { name: "Play" }).click();
  await page.locator('.play-card[data-mode="typing"]').click();
  await page.locator("#worldScopeBtn").click();
  await page.locator("#practiceModeBtn").click();
  await page.evaluate(() => {
    (0, eval)("CURRENT_REGIONS = []");
  });
  page.once("dialog", (dialog) => dialog.accept());
  await page.locator("#homeStartBtn").click();
  await expect(page.locator("#setupScreen")).toBeVisible();
  await expect(page.locator("#gameScreen")).toBeHidden();
});

for (const mode of ["flag", "capital"]) {
  test(`${mode} awards one point for the current correct answer`, async ({
    page,
  }) => {
    await start(page, mode);
    const answer = await page.evaluate(
      (type) =>
        (0, eval)(
          type === "flag"
            ? "gameState.currentTarget"
            : "CAPITALS.world[gameState.currentTarget]",
        ),
      mode,
    );
    await page.locator("#stateInput").fill(answer);
    await page.locator("#submitAnswerBtn").click();
    await expect(page.locator("#progressLabel")).toContainText("1 /");
    await expect(page.locator("#streakDisplay")).toHaveText("1");
    expect(await page.evaluate(() => (0, eval)("gameState.score"))).toBe(1);
  });
}

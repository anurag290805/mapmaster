import { expect, test, type Page } from "@playwright/test";

async function dismissGuide(page: Page) {
  await page.goto("./");
  const skip = page.getByRole("button", { name: "Skip for now" });
  if (await skip.isVisible()) await skip.click();
}

test("audio preference is accessible, persisted, and safe to call", async ({
  page,
}) => {
  await dismissGuide(page);
  await page.getByRole("button", { name: "Settings" }).click();

  await expect(page.locator("#settingsSound")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.locator("#settingsSound").click();
  await expect(page.locator("#settingsSound")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await expect
    .poll(() =>
      page.evaluate(() => window.localStorage.getItem("mapmaster-sound-v1")),
    )
    .toBe("off");
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          typeof (window as Window & { MapMasterAudio?: unknown })
            .MapMasterAudio === "object",
      ),
    )
    .toBe(true);
  await page.reload();
  await page.getByRole("button", { name: "Settings" }).click();
  await expect(page.locator("#settingsSound")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await page.evaluate(() => {
    const audio = (
      window as unknown as Window & {
        MapMasterAudio: { play: (event: string) => void };
      }
    ).MapMasterAudio;
    audio.play("correct");
    audio.play("incorrect");
  });
});

test("mandatory CP09 palette is exposed through the existing semantic tokens", async ({
  page,
}) => {
  await dismissGuide(page);
  const tokens = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement);
    return {
      charcoal: style.getPropertyValue("--mm-charcoal").trim().toLowerCase(),
      cobalt: style.getPropertyValue("--mm-cobalt").trim().toLowerCase(),
      lime: style.getPropertyValue("--mm-lime").trim().toLowerCase(),
      brand: style.getPropertyValue("--mm-brand").trim().toLowerCase(),
    };
  });
  expect(tokens).toEqual({
    charcoal: "#1a1a1a",
    cobalt: "#1558c9",
    lime: "#32cd32",
    brand: "#1558c9",
  });
});

test("screen navigation preserves immediate focus while marking low-frequency views for motion", async ({
  page,
}) => {
  await dismissGuide(page);
  await page.locator("nav").getByRole("button", { name: "Play" }).click();

  const playScreen = page.locator("#playScreen");
  await expect(playScreen).toBeVisible();
  await expect(playScreen).toBeFocused();
  await expect(playScreen).toHaveClass(/mm-screen-enter/);
});

test("reduced motion keeps screen navigation immediate without decorative entry motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await dismissGuide(page);
  await page.locator("nav").getByRole("button", { name: "Play" }).click();

  const playScreen = page.locator("#playScreen");
  await expect(playScreen).toBeVisible();
  await expect(playScreen).toBeFocused();
  await expect(playScreen).not.toHaveClass(/mm-screen-enter/);
});

test("active gameplay is excluded from screen-entry motion", async ({
  page,
}) => {
  await dismissGuide(page);
  await page.evaluate(() => {
    (0, eval)(`showScreen("game")`);
  });

  const gameScreen = page.locator("#gameScreen");
  await expect(gameScreen).toBeVisible();
  await expect(gameScreen).toBeFocused();
  await expect(gameScreen).not.toHaveClass(/mm-screen-enter/);
});

test("completed games give visible XP and achievement feedback alongside the result", async ({
  page,
}) => {
  await dismissGuide(page);
  await page.evaluate(() => {
    (0, eval)(`
      currentMapKey = "world";
      CURRENT_REGIONS = MAPS.world.regions;
      gameState.gameType = "typing";
      gameState.gameMode = "practice";
      gameState.phase = "active";
      gameState.sessionId += 1;
      gameState.startTime = Date.now();
      gameState.startedAt = performance.now();
      gameState.score = 1;
      gameState.totalAttempts = 1;
      gameState.guessedStates = ["Japan"];
      gameState.bestStreak = 1;
      endGame(true);
    `);
  });
  await expect(page.locator("#winScreen")).toBeVisible();
  await expect(page.locator("#winProgressionAward")).toContainText("XP");
  await expect(page.locator("#winProgressionAward")).toContainText(
    /achievement/i,
  );
});

test("reduced motion keeps score updates immediate and suppresses confetti", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await dismissGuide(page);
  const result = await page.evaluate(() => {
    const score = document.getElementById("scoreDisplay")!;
    (0, eval)(
      `gameState.sessionId += 1; animateCounter(document.getElementById("scoreDisplay"), 0, 7); launchConfetti();`,
    );
    return {
      score: score.textContent,
      confettiHidden: document
        .getElementById("confettiCanvas")!
        .classList.contains("hidden"),
      feedbackAnimation: getComputedStyle(
        document.getElementById("feedbackMessage")!,
      ).animationName,
    };
  });
  expect(result.score).toBe("7");
  expect(result.confettiHidden).toBe(true);
  expect(result.feedbackAnimation).toBe("none");
});

test("sound controls remain safe when Web Audio is unsupported", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "AudioContext", {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(window, "webkitAudioContext", {
      configurable: true,
      value: undefined,
    });
  });
  await dismissGuide(page);
  const supported = await page.evaluate(() => {
    const audio = (
      window as unknown as Window & {
        MapMasterAudio: {
          isSupported: () => boolean;
          play: (event: string) => void;
        };
      }
    ).MapMasterAudio;
    audio.play("correct");
    return audio.isSupported();
  });
  expect(supported).toBe(false);
  await page.getByRole("button", { name: "Settings" }).click();
  await page.locator("#settingsSound").click();
  await expect(page.locator("#settingsSound")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
});

test("Flag Sprint keeps large stacked touch controls and a visible focus state on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await dismissGuide(page);
  const play = page.locator("nav").getByRole("button", { name: "Play" });
  if (!(await play.isVisible())) await page.locator("#menuToggle").click();
  await play.click();
  await page.locator('[data-mode="flagChoice"]').click();
  await page.locator("#worldScopeBtn").click();
  await page.locator("#flagChoiceModeBtn").click();
  await page.locator("#practiceModeBtn").click();
  await page.locator("#homeStartBtn").click();

  const options = page.locator("#choiceOptions button");
  await expect(options).toHaveCount(4);
  await expect(options.first()).toBeFocused();
  const metrics = await options.first().evaluate((button) => {
    const rect = button.getBoundingClientRect();
    const style = getComputedStyle(button);
    return { height: rect.height, outline: style.outlineWidth };
  });
  expect(metrics.height).toBeGreaterThanOrEqual(44);
  await page.keyboard.press("Tab");
  await expect(options.nth(1)).toBeFocused();
});

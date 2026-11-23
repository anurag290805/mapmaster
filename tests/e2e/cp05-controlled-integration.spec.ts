import { expect, test, type Page } from "@playwright/test";

async function startCandidate(page: Page, challenge = false) {
  await page.goto("./?cp05Candidate=1");
  await page.getByRole("button", { name: "Skip for now" }).click();
  const play = page.locator("nav").getByRole("button", { name: "Play" });
  if (!(await play.isVisible())) await page.locator("#menuToggle").click();
  await play.click();
  await page.locator('.play-card[data-mode="locate"]').click();
  await page.locator("#worldScopeBtn").click();
  await expect(page.locator("#setupScreen")).toBeVisible();
  await page
    .locator(challenge ? "#challengeModeBtn" : "#practiceModeBtn")
    .click();
  const start = page.locator("#homeStartBtn");
  await expect(start).toBeEnabled();
  // Mobile setup can scroll the CTA beneath its full-screen container during
  // pointer hit testing. Exercise the native keyboard path here; pointer and
  // touch selection are covered below on the mounted candidate map.
  await start.focus();
  await page.keyboard.press("Enter");
  if (challenge) {
    await page.locator('[data-time="120"]').click();
    await page.locator('[data-lives="3"]').click();
    await page.locator("#startGameBtn").click();
  }
  await expect(page.locator("#gameScreen")).toBeVisible();
  await expect(page.locator("#cp05CandidateControls")).toBeVisible({
    timeout: 30000,
  });
}

async function point(page: Page, code: string) {
  // Browser coordinate input is viewport-relative. Keep the mounted candidate
  // map in view before sampling a fill point. Disable page smooth-scrolling
  // and allow layout to settle so sampled coordinates remain the coordinates
  // delivered to the touch input.
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
  });
  await page.locator(".cp05-candidate-svg").scrollIntoViewIfNeeded();
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  return page.locator(`#country-${code}`).evaluate((group) => {
    const svg = (group as SVGElement).ownerSVGElement!;
    for (const path of [...group.querySelectorAll("path")]) {
      const box = path.getBBox();
      for (let y = 1; y < 20; y++)
        for (let x = 1; x < 20; x++) {
          const p = svg.createSVGPoint();
          p.x = box.x + (box.width * x) / 20;
          p.y = box.y + (box.height * y) / 20;
          if (!path.isPointInFill(p)) continue;
          const screen = p.matrixTransform(path.getScreenCTM()!);
          const hit = document.elementFromPoint(
            Math.round(screen.x),
            Math.round(screen.y),
          );
          if (hit === path)
            return { x: Math.round(screen.x), y: Math.round(screen.y) };
        }
    }
    throw new Error(`No hit-tested point for ${group.id}`);
  });
}

test("controlled candidate path uses CP04 score, duplicate, completion and session guards", async ({
  page,
  baseURL,
}) => {
  test.skip(
    !baseURL?.includes("4174"),
    "Candidate integration is development-only.",
  );
  await startCandidate(page);
  await expect(page.locator("#country-AF")).toHaveAccessibleName(
    "Map target 1",
  );
  await page.evaluate(() => {
    (0, eval)(
      `locateEligible=["Afghanistan","Albania"];gameState.currentTarget="Afghanistan";updateHUD();showLocateTarget(gameState.currentTarget);`,
    );
  });
  const wrong = await point(page, "AL");
  await page.mouse.click(wrong.x, wrong.y);
  await expect(page.locator("#scoreDisplay")).toHaveText("0");
  expect(await page.evaluate(() => (0, eval)("gameState.totalAttempts"))).toBe(
    1,
  );
  const af = await point(page, "AF");
  await page.mouse.click(af.x, af.y);
  await expect(page.locator("#scoreDisplay")).toHaveText("1");
  await expect(page.locator("#streakDisplay")).toHaveText("1");
  await page.mouse.click(af.x, af.y);
  await expect(page.locator("#scoreDisplay")).toHaveText("1");
  await page.locator("#country-AL").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#winScreen")).toBeVisible();
  await page.locator("#restartBtn").click();
  await expect(page.locator("#startScreen")).toBeVisible();
});

test("controlled candidate path enforces challenge terminal, review and stale-document guards", async ({
  page,
  baseURL,
}) => {
  test.skip(
    !baseURL?.includes("4174"),
    "Candidate integration is development-only.",
  );
  await startCandidate(page, true);
  await page.evaluate(() => {
    (0, eval)(
      `locateEligible=["Afghanistan","Albania"];gameState.currentTarget="Afghanistan";gameState.livesLeft=1;updateHUD();showLocateTarget(gameState.currentTarget);window.__oldCandidateGroup=document.querySelector("#country-AF");`,
    );
  });
  const wrong = await point(page, "AL");
  await page.mouse.click(wrong.x, wrong.y);
  await expect(page.locator("#loseScreen")).toBeVisible();
  await page.locator("#reviewBtn").click();
  await expect(page.locator("#reviewBanner")).toBeVisible();
  await expect(page.locator("#cp05CandidateControls")).toBeVisible();
  await page
    .locator("#cp05CandidateControls select")
    .selectOption("iso3166-1:AF");
  await page
    .locator("#cp05CandidateControls button", { hasText: "Submit country" })
    .click();
  expect(await page.evaluate(() => (0, eval)("gameState.score"))).toBe(0);
  await page.locator("#reviewExitBtn").click();
  await expect(page.locator("#startScreen")).toBeVisible();
  expect(
    await page.evaluate(() =>
      (0, eval)("window.__mapmasterCandidateSvg === null"),
    ),
  ).toBe(true);
  expect(
    await page.evaluate(() =>
      (0, eval)(
        `(() => { window.__oldCandidateGroup?.dispatchEvent(new MouseEvent("click", {bubbles:true})); return gameState.score; })()`,
      ),
    ),
  ).toBe(0);
});

test.describe("controlled candidate interaction controls", () => {
  test.use({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  });
  test("mouse, keyboard, chooser, focus, view controls and touch stay in the CP04 session", async ({
    page,
    baseURL,
  }) => {
    test.skip(
      !baseURL?.includes("4174"),
      "Candidate integration is development-only.",
    );
    await startCandidate(page);
    await page.evaluate(() => {
      (0, eval)(
        `locateEligible=["Afghanistan","Albania"];gameState.currentTarget="Afghanistan";updateHUD();showLocateTarget(gameState.currentTarget);`,
      );
    });
    await page
      .locator("#cp05CandidateControls select")
      .selectOption("iso3166-1:VA");
    await page.getByRole("button", { name: "Focus selected country" }).click();
    await expect(page.locator("#candidate-layer")).toHaveAttribute(
      "transform",
      /scale\(5\)/,
    );
    await expect
      .poll(() =>
        page.evaluate(() =>
          document.activeElement?.getAttribute("data-canonical-id"),
        ),
      )
      .toBe("iso3166-1:VA");
    await page.getByRole("button", { name: "Reset view" }).click();
    await expect(page.locator("#candidate-layer")).toHaveAttribute(
      "transform",
      "translate(0 0) scale(1)",
    );
    await page.locator(".cp05-candidate-svg").scrollIntoViewIfNeeded();
    const af = await point(page, "AF");
    await page.touchscreen.tap(af.x, af.y);
    await expect(page.locator("#scoreDisplay")).toHaveText("1");
    await page
      .locator("#cp05CandidateControls select")
      .selectOption("iso3166-1:AL");
    await page.getByRole("button", { name: "Submit country" }).click();
    await expect(page.locator("#winScreen")).toBeVisible();
  });
});

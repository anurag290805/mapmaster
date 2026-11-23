import { expect, test } from "@playwright/test";

function productionOnly(testInfo: { project: { name: string } }) {
  test.skip(
    !["production", "production-subpath"].includes(testInfo.project.name),
    "Service workers are intentionally disabled in development.",
  );
}

test("a warmed app shell reopens offline with cached daily content", async ({
  page,
}, testInfo) => {
  productionOnly(testInfo);
  const context = page.context();
  const baseURL = testInfo.project.use.baseURL as string;
  await page.goto("./");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect
    .poll(() =>
      page.evaluate(() => Boolean(navigator.serviceWorker.controller)),
    )
    .toBe(true);
  const cachedPaths = await page.evaluate(async () => {
    const keys = await caches.keys();
    const requests = await Promise.all(
      keys.map(async (key) =>
        (await caches.open(key))
          .keys()
          .then((entries) =>
            entries.map((entry) => new URL(entry.url).pathname),
          ),
      ),
    );
    return requests.flat();
  });
  expect(cachedPaths.join("\n")).not.toMatch(
    /(?:candidate|pilot|australia|brazil|canada|china|germany|japan|spain|uae|usa|world)\.svg/i,
  );

  await context.setOffline(true);
  await page.close();
  const reopened = await context.newPage();
  const pageErrors: string[] = [];
  reopened.on("pageerror", (error) => pageErrors.push(error.message));
  await reopened.goto(baseURL);
  await expect(reopened.locator("#startScreen")).toBeVisible();
  expect(pageErrors).toEqual([]);
  await expect
    .poll(() =>
      reopened.evaluate(() => ({
        content: window.MapMasterDailyContent?.capitalPool.length ?? 0,
        dailyBridge: typeof window.MapMasterDaily?.recordTerminal,
        runtime: typeof window.MapMasterDailyRuntime?.start,
        sessionScoped: window.MapMasterDailyRuntime?.start
          .toString()
          .includes("daily: true"),
      })),
    )
    .toEqual({
      content: expect.any(Number),
      dailyBridge: "function",
      runtime: "function",
      sessionScoped: true,
    });
  const skip = reopened.getByRole("button", { name: "Skip for now" });
  if (await skip.isVisible()) await skip.click();
  await reopened.getByRole("button", { name: "Daily challenge" }).click();
  await reopened.getByRole("button", { name: /easy/i }).click();
  await expect(reopened.locator("#gameScreen")).toBeVisible();
  await expect
    .poll(() =>
      reopened.evaluate(() =>
        (0, eval)(
          "({daily:!!gameState.dailyChallenge,pool:gameState.dailyPool.length,questions:gameState.dailyQuestions.length,target:gameState.currentTarget,options:document.querySelectorAll('#choiceOptions button').length})",
        ),
      ),
    )
    .toEqual({
      daily: true,
      pool: expect.any(Number),
      questions: 5,
      target: expect.any(String),
      options: 4,
    });
  await expect(reopened.locator("#choiceOptions button")).toHaveCount(4);
});

test("a first-ever offline visit is unsupported", async ({
  page,
}, testInfo) => {
  productionOnly(testInfo);
  await page.context().setOffline(true);
  await expect(
    page.goto("./", { waitUntil: "domcontentloaded" }),
  ).rejects.toThrow();
});

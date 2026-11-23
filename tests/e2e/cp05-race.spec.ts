import { expect, test } from "@playwright/test";

test("a delayed initial India load cannot replace a later world selection", async ({
  page,
}) => {
  let releaseIndia!: () => void;
  const gate = new Promise<void>((resolve) => {
    releaseIndia = resolve;
  });
  let sawIndia!: () => void;
  const indiaRequested = new Promise<void>((resolve) => {
    sawIndia = resolve;
  });
  const requests: string[] = [];
  await page.route("**/*.svg", async (route) => {
    const url = route.request().url();
    requests.push(new URL(url).pathname);
    if (/\/india(?:-[^/]*)?\.svg$/.test(url)) {
      sawIndia();
      await gate;
    }
    await route.continue();
  });
  await page.goto("./", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => (0, eval)('showScreen("game")'));
  await indiaRequested;
  await page.evaluate(() => (0, eval)('applyMap("world"); showScreen("game")'));
  releaseIndia();
  await expect
    .poll(() =>
      page.locator("#indiaMap").evaluate((node) => {
        const object = node as HTMLObjectElement;
        return {
          requested: object.data,
          loaded: object.contentDocument?.URL ?? "",
        };
      }),
    )
    .toMatchObject({
      requested: expect.stringMatching(/\/svg\/world\.svg$/),
      loaded: expect.stringMatching(/\/svg\/world\.svg$/),
    });
  expect(requests.some((url) => url.endsWith("/svg/world.svg"))).toBe(true);
});

test("switching India and world owns a fresh document each time", async ({
  page,
}) => {
  await page.goto("./");
  await page.evaluate(() => (0, eval)('showScreen("game")'));
  for (const key of ["india", "world", "india", "world"]) {
    await page.evaluate(
      (selection) => (0, eval)(`applyMap(${JSON.stringify(selection)})`),
      key,
    );
    await expect
      .poll(() =>
        page.locator("#indiaMap").evaluate((node) => {
          const object = node as HTMLObjectElement;
          return object.contentDocument?.URL ?? "";
        }),
      )
      .toMatch(new RegExp(`/svg/${key}\\.svg$`));
  }
});

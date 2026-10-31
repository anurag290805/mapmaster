import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("https://**/*", (route) => route.abort());
  await page.goto("./");
});

test("onboarding, help replay, settings and theme", async ({ page }) => {
  await expect(
    page.getByRole("dialog", { name: "Welcome, explorer." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Skip for now" }).click();
  await page.reload();
  await expect(page.locator("#onboardingDialog")).not.toBeVisible();
  await page.locator("nav").getByRole("button", { name: "Help" }).click();
  await page.getByRole("button", { name: "Replay introduction" }).click();
  await expect(page.locator("#onboardingDialog")).toBeVisible();
  await page.getByRole("button", { name: "Skip for now" }).click();
  await page.getByRole("button", { name: "Settings" }).click();
  await page.locator("#settingsTheme").click();
  await expect(page.locator("body")).toHaveClass(/dark-theme/);
  await page.locator("#settingsDialog").press("Escape");
  await page.reload();
  await expect(page.locator("body")).toHaveClass(/dark-theme/);
});

test("play, world typing, assets, and game entry", async ({ page }) => {
  await page.getByRole("button", { name: "Skip for now" }).click();
  await page.locator("nav").getByRole("button", { name: "Play" }).click();
  await page.locator('.play-card[data-mode="typing"]').click();
  await page.locator("#worldScopeBtn").click();
  await expect(page.locator("#typingModeBtn")).toHaveClass(/selected/);
  await page.locator("#practiceModeBtn").click();
  await page.locator("#homeStartBtn").click();
  await expect(page.locator("#gameScreen")).toBeVisible();
  await expect
    .poll(() =>
      page.locator("#indiaMap").evaluate((node) => {
        const map = node as HTMLObjectElement;
        return Boolean(map.contentDocument?.querySelector("svg path"));
      }),
    )
    .toBe(true);
  await expect
    .poll(() =>
      page.locator("#indiaMap").evaluate((node) => {
        const doc = (node as HTMLObjectElement).contentDocument;
        return doc ? new URL(doc.URL).pathname : "";
      }),
    )
    .toBe(new URL("svg/world.svg", page.url()).pathname);
  await page.locator("#stateInput").fill("Japan");
  await page.locator("#submitAnswerBtn").click();
  await expect(page.locator("#progressLabel")).toContainText("1 / 194");
  expect(
    (await page.request.get(new URL("svg/world.svg", page.url()).href)).ok(),
  ).toBeTruthy();
  expect(
    (
      await page.request.get(new URL("assets/brand/icon.svg", page.url()).href)
    ).ok(),
  ).toBeTruthy();
});

test("country filtering works in the built typed module", async ({ page }) => {
  await page.getByRole("button", { name: "Skip for now" }).click();
  await page.locator("nav").getByRole("button", { name: "Explore" }).click();
  await page.locator("#countryScopeBtn").click();
  await page.locator("#countrySearch").fill("japan");
  await expect(page.locator('[data-country="japan"]')).toBeVisible();
  await expect(page.locator('[data-country="france"]')).toBeHidden();
  await page.locator("#countrySearch").fill("not a country");
  await expect(page.locator("#countryEmpty")).toBeVisible();
});

test("all four mode cards reach their matching world setup without script errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.getByRole("button", { name: "Skip for now" }).click();
  for (const [mode, id] of [
    ["typing", "typingModeBtn"],
    ["locate", "locateModeBtn"],
    ["flag", "flagModeBtn"],
    ["capital", "capitalModeBtn"],
  ]) {
    await page.locator("nav").getByRole("button", { name: "Play" }).click();
    await page.locator(`.play-card[data-mode="${mode}"]`).click();
    await page.locator("#worldScopeBtn").click();
    await expect(page.locator(`#${id}`)).toHaveClass(/selected/);
  }
  expect(errors).toEqual([]);
});

test("ordered scripts, CSS, branding, and one onboarding advance", async ({
  page,
}, testInfo) => {
  const prefix = new URL(testInfo.project.use.baseURL as string).pathname;
  const scripts = await page
    .locator('script[src^="js/"]')
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("src")));
  const expected = [
    "data",
    "state",
    "audio",
    "ui",
    "modes",
    "game",
    "events",
    "navigation-core",
    "navigation",
  ].map((name) => `js/${name}.js`);
  expect(scripts).toEqual(expected);
  const loads = await page.evaluate(() =>
    performance.getEntriesByType("resource").map((entry) => entry.name),
  );
  for (const script of expected) {
    expect(
      loads.filter((url) => new URL(url).pathname === `${prefix}${script}`),
    ).toHaveLength(1);
  }
  expect(
    await page
      .locator(".site-brand img")
      .evaluate((img) => (img as HTMLImageElement).naturalWidth),
  ).toBeGreaterThan(0);
  await expect(page.locator(".site-header")).toHaveCSS("display", "block");
  const family = await page
    .locator("body")
    .evaluate((node) => getComputedStyle(node).fontFamily);
  expect(family.length).toBeGreaterThan(0);
  await page.locator("#guideNext").click();
  await expect(page.locator("#guideCount")).toHaveText("STEP 2 OF 4");
});

for (const [mode, visible] of [
  ["typing", "#inputSection"],
  ["flag", "#flagContainer"],
  ["capital", "#capitalPrompt"],
  ["locate", "#locatePrompt"],
]) {
  test(`${mode} practice reaches its gameplay screen`, async ({ page }) => {
    const errors: string[] = [];
    const failedLocal: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("response", (response) => {
      const url = new URL(response.url());
      if (
        url.hostname === "127.0.0.1" &&
        response.status() >= 400 &&
        !url.pathname.endsWith("/favicon.ico")
      )
        failedLocal.push(`${response.status()} ${url.pathname}`);
    });
    await page.getByRole("button", { name: "Skip for now" }).click();
    await page.locator("nav").getByRole("button", { name: "Play" }).click();
    await page.locator(`.play-card[data-mode="${mode}"]`).click();
    await page.locator("#worldScopeBtn").click();
    await page.locator("#practiceModeBtn").click();
    await page.locator("#homeStartBtn").click();
    await expect(page.locator("#gameScreen")).toBeVisible();
    await expect(page.locator(visible)).toBeVisible();
    await expect
      .poll(() =>
        page
          .locator("#indiaMap")
          .evaluate((node) =>
            Boolean(
              (node as HTMLObjectElement).contentDocument?.querySelector(
                "svg path",
              ),
            ),
          ),
      )
      .toBe(true);
    expect(errors).toEqual([]);
    expect(failedLocal).toEqual([]);
  });
}

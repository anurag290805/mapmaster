import { expect, test } from "@playwright/test";

test("development-only country-fact preview renders the full pending checklist without changing approval", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "development",
    "candidate preview is development-only",
  );
  await page.goto("/candidate/country-facts/preview/index.html", {
    waitUntil: "domcontentloaded",
  });

  await expect(
    page.getByRole("heading", { name: "194-country fact review" }),
  ).toBeVisible();
  await expect(page.locator("#summary")).toContainText("194 catalog slots");
  await expect(page.locator("#ledger tr")).toHaveCount(194);
  await expect(page.locator("#cuePrompt")).toHaveText(
    "Identify the current prompt to unlock a country fact.",
  );
  await expect(page.locator("#cueCountry")).toBeEmpty();
  await expect(page.locator("#cueFact")).toBeEmpty();

  await page
    .getByRole("button", { name: "Preview after correct answer" })
    .click();
  await expect(page.locator("#cueCountry")).toHaveText("Afghanistan");
  await expect(page.locator("#cueFact")).toContainText("Noshaq");
  await expect(page.locator("#cueSource")).toContainText(
    "Development-only candidate",
  );
  expect(
    await page
      .locator('input[type="checkbox"]')
      .evaluateAll(
        (nodes) =>
          nodes.length === 194 &&
          nodes.every((node) => (node as HTMLInputElement).disabled),
      ),
  ).toBe(true);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.addStyleTag({ content: "html { font-size: 200%; }" });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(
    page.getByRole("button", { name: "Before answer" }),
  ).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("country-facts-mobile.png"),
    fullPage: true,
  });
});

test("production builds do not serve the country-fact candidate preview", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name === "development",
    "production isolation assertion",
  );
  await page.goto("/candidate/country-facts/preview/index.html", {
    waitUntil: "domcontentloaded",
  });
  await expect(
    page.getByRole("heading", { name: "194-country fact review" }),
  ).toHaveCount(0);
});

import { expect, test, type Page } from "@playwright/test";

async function openPreview(page: Page) {
  await page.goto("./?externalGeoPreview=1&externalGeoSeed=playwright");
  const onboarding = page.getByRole("button", { name: "Skip for now" });
  if (await onboarding.isVisible()) await onboarding.click();
  await expect(page.locator("#externalGeoPreview")).toBeVisible();
}

test("localhost development exposes founder-pending release content without rewards", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "development",
    "preview is development-only",
  );
  await openPreview(page);
  await expect(page.locator("#externalGeoPreview")).toContainText(
    "Candidate content only",
  );
  await expect(page.locator("#externalGeoPreview")).toContainText(
    "50 proposed items",
  );
  await expect(page.locator("#externalGeoPreview")).not.toContainText(
    "Open Trivia DB",
  );
  await page.getByRole("tab", { name: "City challenge" }).click();
  await expect(page.locator("#externalGeoPreview")).toContainText(
    /which country|which country\?/i,
  );
  await expect(page.locator("#externalGeoPreview")).not.toContainText(
    "reviewed city",
  );
  await page.locator(".external-choice-list button").first().click();
  await expect(page.locator("#externalGeoPreview")).toContainText(
    /Matched|Correct answer/,
  );
  await expect(page.locator("#externalGeoPreview")).toContainText("0 XP");
});

test("development preview has keyboard-operable tabs and stable responsive candidate screens", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "development",
    "preview is development-only",
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  await openPreview(page);

  const preview = page.locator("#externalGeoPreview");
  const explorer = page.getByRole("tab", { name: "Country explorer" });
  const cities = page.getByRole("tab", { name: "City challenge" });
  const features = page.getByRole("tab", { name: "Feature learning" });
  const checklist = page.getByRole("tab", { name: "Founder checklist" });

  await explorer.focus();
  await page.keyboard.press("ArrowRight");
  await expect(cities).toBeFocused();
  await expect(cities).toHaveAttribute("aria-selected", "true");
  await expect(preview).toContainText(/which country|which country\?/i);
  await preview.screenshot({ path: testInfo.outputPath("desktop-cities.png") });

  await page.keyboard.press("ArrowRight");
  await expect(features).toBeFocused();
  await expect(features).toHaveAttribute("aria-selected", "true");
  await expect(preview).toContainText("Feature learning:");
  await expect(preview).toContainText(/GeoNames classifies/);
  await preview.screenshot({
    path: testInfo.outputPath("desktop-features.png"),
  });

  await explorer.focus();
  await page.keyboard.press("Enter");
  await expect(explorer).toHaveAttribute("aria-selected", "true");
  const countryChooser = page.getByRole("combobox", {
    name: "Choose a proposed country fact",
  });
  await countryChooser.focus();
  await expect(countryChooser).toBeFocused();
  expect(
    await countryChooser.evaluate(
      (node) => getComputedStyle(node).outlineStyle,
    ),
  ).not.toBe("none");
  await preview.screenshot({
    path: testInfo.outputPath("desktop-explorer.png"),
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await explorer.focus();
  await page.keyboard.press("Enter");
  await expect(preview).toContainText("Country explorer");
  await preview.screenshot({
    path: testInfo.outputPath("mobile-explorer.png"),
  });

  await cities.focus();
  await page.keyboard.press("Enter");
  await expect(preview).toContainText(/which country|which country\?/i);
  await preview.screenshot({ path: testInfo.outputPath("mobile-cities.png") });

  await features.focus();
  await page.keyboard.press("Enter");
  await expect(preview).toContainText("Feature learning:");
  await preview.screenshot({
    path: testInfo.outputPath("mobile-features.png"),
  });

  await checklist.focus();
  await page.keyboard.press("Enter");
  await expect(preview).toContainText("Individual founder decisions");
  await expect(preview).toContainText("Pending founder approval");
  await preview.screenshot({
    path: testInfo.outputPath("mobile-founder-checklist.png"),
  });

  await page.addStyleTag({ content: "html { font-size: 200%; }" });
  expect(
    await preview.evaluate(
      (node) =>
        document.documentElement.scrollWidth <=
        node.ownerDocument.defaultView!.innerWidth,
    ),
  ).toBe(true);

  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(
    await preview.evaluate((node) => getComputedStyle(node).transitionDuration),
  ).toBe("0s");
});

test("production projects cannot activate the external-content preview query", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name === "development",
    "production-isolation assertion",
  );
  await page.goto("./?externalGeoPreview=1");
  await expect(page.locator("#externalGeoPreview")).toHaveCount(0);
});

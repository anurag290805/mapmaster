import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";

type Mapping = {
  question_key: string;
  display_name: string;
  dom_id: string;
  source_polygon_count: number;
};
type Scope = { status: string; mappings: Mapping[] };
const scopes: Record<string, Scope> = JSON.parse(
  readFileSync("candidate/admin1/manifest.json", "utf8"),
).scopes;
const pointerTargets: Record<string, string> = {
  australia: "New South Wales",
  brazil: "Acre",
  canada: "British Columbia",
  germany: "Bavaria",
  japan: "Kagoshima",
  usa: "Alabama",
};

async function startCandidate(page: Page, scope: string) {
  await page.goto(`./?cp05Candidate=admin1:${scope}`);
  await page.getByRole("button", { name: "Skip for now" }).click();
  const play = page.locator("nav").getByRole("button", { name: "Play" });
  if (!(await play.isVisible())) await page.locator("#menuToggle").click();
  await play.click();
  await page.locator('.play-card[data-mode="locate"]').click();
  await page.locator("#countryScopeBtn").click();
  await page.locator(`.country-btn[data-country="${scope}"]`).click();
  await page.locator("#countryContinueBtn").click();
  await page.locator("#practiceModeBtn").click();
  await page.locator("#homeStartBtn").focus();
  await page.keyboard.press("Enter");
  try {
    await expect(page.locator("#cp05CandidateControls")).toBeVisible();
  } catch {
    throw new Error(
      `Admin-1 candidate did not mount: ${await page.locator("#feedbackMessage").textContent()}`,
    );
  }
}

async function point(page: Page, domId: string) {
  // Browser coordinate input is viewport-relative. Keep the mounted candidate
  // map in view before sampling a fill point, particularly for lower states
  // such as Alabama after the development controls have been rendered.
  await page.locator(".cp05-candidate-svg").scrollIntoViewIfNeeded();
  return page.locator(`#${domId}`).evaluate((group) => {
    const svg = (group as SVGElement).ownerSVGElement!;
    for (const path of [...group.querySelectorAll("path")]) {
      const box = path.getBBox();
      for (let y = 1; y < 20; y++)
        for (let x = 1; x < 20; x++) {
          const point = svg.createSVGPoint();
          point.x = box.x + (box.width * x) / 20;
          point.y = box.y + (box.height * y) / 20;
          if (!path.isPointInFill(point)) continue;
          const screen = point.matrixTransform(path.getScreenCTM()!);
          if (
            document.elementFromPoint(
              Math.round(screen.x),
              Math.round(screen.y),
            ) === path
          )
            return { x: Math.round(screen.x), y: Math.round(screen.y) };
        }
    }
    throw new Error(`No reachable fill point for ${group.id}`);
  });
}

for (const scope of [
  "australia",
  "brazil",
  "canada",
  "germany",
  "japan",
  "usa",
]) {
  test(`${scope} candidate scores only through its live CP04 Locate session`, async ({
    page,
    baseURL,
  }) => {
    test.skip(
      !baseURL?.includes("4174"),
      "Candidate integration is localhost-only.",
    );
    const candidate = scopes[scope];
    expect(candidate.status).toBe(
      "candidate_ready_for_manual_geometry_and_interaction_review",
    );
    const correct = candidate.mappings.find(
      (mapping) => mapping.display_name === pointerTargets[scope],
    )!;
    const incorrect = candidate.mappings.find(
      (mapping) => mapping !== correct,
    )!;
    await startCandidate(page, scope);
    await page.evaluate(
      ([correctName, incorrectName]) =>
        (0, eval)(
          `locateEligible=[${JSON.stringify(correctName)},${JSON.stringify(incorrectName)}];gameState.currentTarget=${JSON.stringify(correctName)};updateHUD();showLocateTarget(gameState.currentTarget);`,
        ),
      [correct.display_name, incorrect.display_name],
    );
    await page.locator(`#${incorrect.dom_id}`).focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#scoreDisplay")).toHaveText("0");
    if (scope === "japan") {
      await page
        .locator("#cp05CandidateControls select")
        .selectOption(correct.question_key);
      await page.getByRole("button", { name: "Focus selected target" }).click();
      await page.locator(`#${correct.dom_id}`).focus();
      await page.keyboard.press("Enter");
    } else {
      const right = await point(page, correct.dom_id);
      await page.mouse.click(right.x, right.y);
    }
    await expect(page.locator("#scoreDisplay")).toHaveText("1");
    expect(
      await page.evaluate(() => (0, eval)("gameState.totalAttempts")),
    ).toBe(2);
  });
}

test("Australia's small ACT target remains keyboard-selectable through the focused candidate view", async ({
  page,
  baseURL,
}) => {
  test.skip(
    !baseURL?.includes("4174"),
    "Candidate integration is localhost-only.",
  );
  const act = scopes.australia.mappings.find(
    (mapping) => mapping.display_name === "Australian Capital Territory",
  )!;
  await startCandidate(page, "australia");
  await page.evaluate(
    (name) =>
      (0, eval)(
        `locateEligible=[${JSON.stringify(name)}];gameState.currentTarget=${JSON.stringify(name)};updateHUD();showLocateTarget(gameState.currentTarget);`,
      ),
    act.display_name,
  );
  await page
    .locator("#cp05CandidateControls select")
    .selectOption(act.question_key);
  await page.getByRole("button", { name: "Focus selected target" }).click();
  await page.locator(`#${act.dom_id}`).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#scoreDisplay")).toHaveText("1");
});

test.describe("Canada multipart candidate", () => {
  test.use({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  });

  test("touch, focus, zoom, pan and reset retain CP04 scoring ownership", async ({
    page,
    baseURL,
  }) => {
    test.skip(
      !baseURL?.includes("4174"),
      "Candidate integration is localhost-only.",
    );
    const candidate = scopes.canada;
    const multipart = candidate.mappings.find(
      (mapping) => mapping.source_polygon_count > 1,
    )!;
    await startCandidate(page, "canada");
    await page.evaluate(
      (name) =>
        (0, eval)(
          `locateEligible=[${JSON.stringify(name)}];gameState.currentTarget=${JSON.stringify(name)};updateHUD();showLocateTarget(gameState.currentTarget);`,
        ),
      multipart.display_name,
    );
    await page
      .locator("#cp05CandidateControls select")
      .selectOption(multipart.question_key);
    await page.getByRole("button", { name: "Focus selected target" }).click();
    await expect(page.locator("#candidate-layer")).toHaveAttribute(
      "transform",
      /scale\(5\)/,
    );
    await page.getByRole("button", { name: "Reset view" }).click();
    await expect(page.locator("#candidate-layer")).toHaveAttribute(
      "transform",
      "translate(0 0) scale(1)",
    );
    const target = await point(page, multipart.dom_id);
    await page.touchscreen.tap(target.x, target.y);
    await expect(page.locator("#scoreDisplay")).toHaveText("1");
  });
});

test.describe("Japan's reassigned Kagoshima components", () => {
  test.use({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  });

  test("the first reallocated Amami component remains a touch-selectable Kagoshima target", async ({
    page,
    baseURL,
  }) => {
    test.skip(
      !baseURL?.includes("4174"),
      "Candidate integration is localhost-only.",
    );
    const kagoshima = scopes.japan.mappings.find(
      (mapping) => mapping.display_name === "Kagoshima",
    )!;
    expect(kagoshima.source_polygon_count).toBe(19);
    await startCandidate(page, "japan");
    await page.evaluate(
      (name) =>
        (0, eval)(
          `locateEligible=[${JSON.stringify(name)}];gameState.currentTarget=${JSON.stringify(name)};updateHUD();showLocateTarget(gameState.currentTarget);`,
        ),
      kagoshima.display_name,
    );
    await page
      .locator("#cp05CandidateControls select")
      .selectOption(kagoshima.question_key);
    const remotePath = page.locator(`#${kagoshima.dom_id}-part-14`);
    await expect(remotePath).toHaveCount(1);
    expect(
      await remotePath.evaluate((path) =>
        (() => {
          if (
            !(path instanceof SVGGeometryElement) ||
            !(path.ownerSVGElement instanceof SVGSVGElement)
          ) {
            throw new Error("Kagoshima candidate path is not an SVG geometry");
          }
          const box = path.getBBox();
          const point = path.ownerSVGElement.createSVGPoint();
          point.x = box.x + box.width / 2;
          point.y = box.y + box.height / 2;
          return path.isPointInFill(point);
        })(),
      ),
    ).toBe(true);
    const submit = page.getByRole("button", { name: "Submit target" });
    await submit.scrollIntoViewIfNeeded();
    const box = await submit.boundingBox();
    if (!box) throw new Error("Kagoshima touch fallback is not visible");
    await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
    await expect(page.locator("#scoreDisplay")).toHaveText("1");
    expect(
      await page.evaluate(() => (0, eval)("gameState.totalAttempts")),
    ).toBe(1);
  });
});

test("Brazil Acre pointer retains its candidate identity and CP04 scoring ownership", async ({
  page,
  baseURL,
}) => {
  test.skip(
    !baseURL?.includes("4174"),
    "Candidate integration is localhost-only.",
  );
  const browserErrors: string[] = [];
  page.on("pageerror", (error) => browserErrors.push(error.message));
  const acre = scopes.brazil.mappings.find(
    (mapping) => mapping.display_name === "Acre",
  )!;
  const alagoas = scopes.brazil.mappings.find(
    (mapping) => mapping.display_name === "Alagoas",
  )!;
  await startCandidate(page, "brazil");
  await page.evaluate(
    ([correctName, incorrectName]) => {
      (
        window as typeof window & { __cp05BrazilTrace?: unknown[] }
      ).__cp05BrazilTrace = [];
      document.addEventListener("pointerdown", record);
      document.addEventListener("pointerup", record);
      document.addEventListener("click", record);
      function record(event: Event) {
        const target = event.target as Element | null;
        const group = target?.closest("g[data-canonical-id]");
        (
          window as typeof window & { __cp05BrazilTrace: unknown[] }
        ).__cp05BrazilTrace.push({
          type: event.type,
          detail: event instanceof MouseEvent ? event.detail : null,
          targetId: target?.id ?? null,
          groupId: group?.id ?? null,
          canonicalId: group?.getAttribute("data-canonical-id") ?? null,
          score: (0, eval)("gameState.score"),
          totalAttempts: (0, eval)("gameState.totalAttempts"),
          currentTarget: (0, eval)("gameState.currentTarget"),
        });
      }
      (0, eval)(
        `locateEligible=[${JSON.stringify(correctName)},${JSON.stringify(incorrectName)}];gameState.currentTarget=${JSON.stringify(correctName)};updateHUD();showLocateTarget(gameState.currentTarget);`,
      );
    },
    [acre.display_name, alagoas.display_name],
  );

  await page.locator(`#${alagoas.dom_id}`).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#scoreDisplay")).toHaveText("0");

  const oldAcre = await page.locator(`#${acre.dom_id}`).elementHandle();
  if (!oldAcre) throw new Error("Brazil Acre candidate target is missing");
  const target = await point(page, acre.dom_id);
  await page.mouse.click(target.x, target.y);
  await expect(page.locator("#scoreDisplay")).toHaveText("1");
  await page.mouse.click(target.x, target.y);
  await expect(page.locator("#scoreDisplay")).toHaveText("1");
  expect(await page.evaluate(() => (0, eval)("gameState.totalAttempts"))).toBe(
    2,
  );

  const trace = await page.evaluate(
    () =>
      (window as typeof window & { __cp05BrazilTrace: unknown[] })
        .__cp05BrazilTrace,
  );
  expect(trace).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        type: "click",
        detail: 0,
        groupId: alagoas.dom_id,
        canonicalId: alagoas.question_key,
        score: 0,
        totalAttempts: 1,
      }),
      expect.objectContaining({
        type: "pointerdown",
        groupId: acre.dom_id,
        canonicalId: acre.question_key,
        score: 0,
        totalAttempts: 1,
      }),
      expect.objectContaining({
        type: "pointerup",
        targetId: "",
        groupId: null,
        canonicalId: null,
        score: 1,
        totalAttempts: 2,
      }),
    ]),
  );
  expect(browserErrors).toEqual([]);

  await page.getByRole("button", { name: "Reload candidate" }).click();
  await expect
    .poll(() => oldAcre.evaluate((element) => !document.contains(element)))
    .toBe(true);
  await oldAcre.evaluate((element) =>
    element.dispatchEvent(new MouseEvent("click", { bubbles: true })),
  );
  await expect(page.locator("#scoreDisplay")).toHaveText("1");
  expect(await page.evaluate(() => (0, eval)("gameState.totalAttempts"))).toBe(
    2,
  );
});

test.describe("Brazil CP04 candidate touch fallback", () => {
  test.use({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  });

  test("wrong, correct, and duplicate choices retain CP04 scoring semantics", async ({
    page,
    baseURL,
  }) => {
    test.skip(
      !baseURL?.includes("4174"),
      "Candidate integration is localhost-only.",
    );
    const acre = scopes.brazil.mappings.find(
      (mapping) => mapping.display_name === "Acre",
    )!;
    const alagoas = scopes.brazil.mappings.find(
      (mapping) => mapping.display_name === "Alagoas",
    )!;
    await startCandidate(page, "brazil");
    await page.evaluate(
      ([correctName, incorrectName]) =>
        (0, eval)(
          `locateEligible=[${JSON.stringify(correctName)},${JSON.stringify(incorrectName)}];gameState.currentTarget=${JSON.stringify(correctName)};updateHUD();showLocateTarget(gameState.currentTarget);`,
        ),
      [acre.display_name, alagoas.display_name],
    );
    const chooser = page.locator("#cp05CandidateControls select");
    const submit = page.getByRole("button", { name: "Submit target" });
    await submit.scrollIntoViewIfNeeded();
    const tapSubmit = async () => {
      const box = await submit.boundingBox();
      if (!box) throw new Error("Brazil touch fallback is not visible");
      await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
    };
    await chooser.selectOption(alagoas.question_key);
    await tapSubmit();
    await expect(page.locator("#scoreDisplay")).toHaveText("0");
    await chooser.selectOption(acre.question_key);
    await tapSubmit();
    await expect(page.locator("#scoreDisplay")).toHaveText("1");
    await tapSubmit();
    await expect(page.locator("#scoreDisplay")).toHaveText("1");
    expect(
      await page.evaluate(() => (0, eval)("gameState.totalAttempts")),
    ).toBe(2);
  });
});

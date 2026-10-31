const { chromium } = require("@playwright/test");
const { execFileSync } = require("node:child_process");
const base = "2908da04979aac084ecf4f9bbb85511d3aafe1db";
const names = [
  "data",
  "state",
  "audio",
  "ui",
  "modes",
  "game",
  "events",
  "navigation-core",
  "navigation",
];
const prior = Object.fromEntries(
  names.map((n) => [
    n,
    execFileSync("git", ["show", `${base}:js/${n}.js`], {
      cwd: process.cwd(),
      encoding: "utf8",
    }),
  ]),
);
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.MAPMASTER_BROWSER_PATH,
    headless: true,
  });
  for (const version of ["baseline-scripts", "cp04-scripts"]) {
    for (let i = 0; i < 5; i++) {
      const context = await browser.newContext();
      const page = await context.newPage();
      const requests = [];
      page.on("request", (req) => {
        if (req.url().includes("/svg/world.svg")) requests.push(req.url());
      });
      await page.route("https://**/*", (r) => r.abort());
      if (version === "baseline-scripts")
        await page.route(/\/js\/([a-z-]+)\.js(?:\?.*)?$/, (r) => {
          const m = r
            .request()
            .url()
            .match(/\/js\/([a-z-]+)\.js/);
          return prior[m[1]]
            ? r.fulfill({
                status: 200,
                contentType: "text/javascript",
                body: prior[m[1]],
              })
            : r.continue();
        });
      await page.goto(
        process.env.MAPMASTER_PROBE_URL || "http://127.0.0.1:4188/",
      );
      await page.locator("#guideSkip").click();
      await page.locator('nav [data-go="play"]').click();
      await page.locator('.play-card[data-mode="typing"]').click();
      await page.locator("#worldScopeBtn").click();
      await page.locator("#practiceModeBtn").click();
      await page.locator("#homeStartBtn").click();
      await page.waitForTimeout(1500);
      const state = await page.evaluate(() => {
        const o = document.querySelector("#indiaMap");
        return {
          attribute: o.getAttribute("data"),
          document: o.contentDocument?.URL ?? null,
        };
      });
      console.log(
        JSON.stringify({
          version,
          iteration: i + 1,
          ...state,
          worldRequests: requests.length,
        }),
      );
      await context.close();
    }
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      hasTouch: true,
      isMobile: true,
    });
    const page = await context.newPage();
    await page.route("https://**/*", (r) => r.abort());
    if (version === "baseline-scripts")
      await page.route(/\/js\/([a-z-]+)\.js(?:\?.*)?$/, (r) => {
        const m = r
          .request()
          .url()
          .match(/\/js\/([a-z-]+)\.js/);
        return prior[m[1]]
          ? r.fulfill({
              status: 200,
              contentType: "text/javascript",
              body: prior[m[1]],
            })
          : r.continue();
      });
    await page.goto(
      process.env.MAPMASTER_PROBE_URL || "http://127.0.0.1:4188/",
    );
    await page.locator("#guideSkip").click();
    await page.locator("#menuToggle").click();
    await page.locator('nav [data-go="play"]').click();
    await page.locator('.play-card[data-mode="typing"]').click();
    await page.locator("#worldScopeBtn").click();
    await page.locator("#practiceModeBtn").click();
    await page.locator("#homeStartBtn").scrollIntoViewIfNeeded();
    const hit = await page.evaluate(() => {
      let b = document.querySelector("#homeStartBtn"),
        r = b.getBoundingClientRect(),
        el = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
      return {
        button: [r.x, r.y, r.width, r.height],
        hit: el?.id || el?.tagName,
      };
    });
    let touchStart;
    try {
      await page.locator("#homeStartBtn").click({ timeout: 5000 });
      touchStart = "clicked";
    } catch (_) {
      touchStart = "timeout";
    }
    console.log(JSON.stringify({ version, touchHit: hit, touchStart }));
    await context.close();
  }
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

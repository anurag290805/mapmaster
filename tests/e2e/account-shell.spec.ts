import { expect, test } from "@playwright/test";

test("account dialog keeps guest play available and exposes a cloud-sync status", async ({
  page,
}) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Skip for now" }).click();
  await page.getByRole("button", { name: "Account" }).click();
  await expect(
    page.getByRole("dialog", { name: "Your MapMaster account" }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Guest progress stays on this device until you choose to sign in.",
    ),
  ).toBeVisible();
  await expect(page.getByTestId("cloud-sync-status")).toHaveText("Local only");
});

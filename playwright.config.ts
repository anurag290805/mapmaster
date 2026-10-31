import { defineConfig, devices } from "@playwright/test";

const executablePath = process.env.MAPMASTER_BROWSER_PATH;
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30000,
  fullyParallel: false,
  reporter: "list",
  use: {
    ...devices["Desktop Chrome"],
    launchOptions: executablePath ? { executablePath } : {},
  },
  projects: [
    { name: "development", use: { baseURL: "http://127.0.0.1:4174" } },
    { name: "production", use: { baseURL: "http://127.0.0.1:4175/" } },
    {
      name: "production-subpath",
      use: { baseURL: "http://127.0.0.1:4176/mapmaster/" },
    },
  ],
  webServer: [
    {
      command: "npm run dev -- --port 4174 --strictPort",
      url: "http://127.0.0.1:4174",
      reuseExistingServer: false,
    },
    {
      command: "npm run preview -- --port 4175 --strictPort",
      url: "http://127.0.0.1:4175",
      reuseExistingServer: false,
    },
    {
      command: "npm run preview -- --port 4176 --strictPort --base /mapmaster/",
      url: "http://127.0.0.1:4176/mapmaster/",
      reuseExistingServer: false,
    },
  ],
});

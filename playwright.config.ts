import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  workers: 2,
  use: { baseURL: "http://127.0.0.1:3100", trace: "retain-on-failure" },
  projects: [
    {
      name: "chromium",
      testIgnore: "profiles.spec.ts",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile",
      testIgnore: "profiles.spec.ts",
      use: { ...devices["Pixel 7"] },
    },
    { name: "profiles", testMatch: "profiles.spec.ts" },
  ],
  webServer: {
    command:
      process.env.TEST_PRODUCTION === "1"
        ? "npm start -- --port 3100"
        : "npm run dev -- --port 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: false,
    timeout: 120000,
  },
});

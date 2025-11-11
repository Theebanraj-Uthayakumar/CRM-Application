import { defineConfig, devices } from "@playwright/test";

const devServerPort = Number(process.env.E2E_DEV_SERVER_PORT ?? process.env.VITE_DEV_SERVER_PORT ?? 5174);
const resolvedDevServerPort = Number.isFinite(devServerPort) ? devServerPort : 5174;
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${resolvedDevServerPort}`;

export default defineConfig({
  testDir: "./e2e",
  timeout: 60 * 1000,
  expect: {
    timeout: 5000,
  },
  use: {
    baseURL,
    trace: "on-first-retry",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    cwd: "./",
    port: resolvedDevServerPort,
    env: {
      ...process.env,
      VITE_DEV_SERVER_PORT: String(resolvedDevServerPort),
    },
    reuseExistingServer: !process.env.CI,
  },
});

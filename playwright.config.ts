import { defineConfig, devices } from "@playwright/test"

// End-to-end tests against a deployed preview (staging database).
// See e2e/README.md for the environment variables.
export default defineConfig({
  testDir: "e2e",
  // One journey with three e-mails, each a minute apart (Supabase limit).
  timeout: 10 * 60_000,
  expect: { timeout: 20_000 },
  workers: 1,
  retries: 0,
  reporter: process.env.CI
    ? [["list"], ["html", { open: "never" }]]
    : [["list"]],
  globalTeardown: "./e2e/teardown.ts",
  use: {
    ...devices["Desktop Chrome"],
    baseURL: process.env.E2E_BASE_URL,
    locale: "de-DE",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    // Lets the intro and question audio start without a click.
    launchOptions: { args: ["--autoplay-policy=no-user-gesture-required"] },
    // Only for running behind a proxy (e.g. a sandbox).
    proxy: process.env.E2E_PROXY
      ? { server: process.env.E2E_PROXY }
      : undefined,
  },
})

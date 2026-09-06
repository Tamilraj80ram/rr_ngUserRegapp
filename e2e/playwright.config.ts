import { defineConfig, devices } from '@playwright/test';

const FRONTEND_URL = 'http://localhost:4200';
const BACKEND_URL = 'http://localhost:5000';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // tests share one in-memory user store on the backend
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['html', { open: 'never' }], ['list']],

  use: {
    baseURL: FRONTEND_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],

  // Starts the real backend and frontend before the test run, and tears them
  // down after. Set reuseExistingServer so local `npm run e2e` reuses servers
  // you already have running via `dotnet run` / `ng serve`.
  webServer: [
    {
      command: 'dotnet run --urls http://localhost:5000',
      cwd: '../backend/UserService',
      url: `${BACKEND_URL}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      stdout: 'pipe',
      stderr: 'pipe'
    },
    {
      command: 'npx ng serve --port 4200',
      cwd: '../frontend',
      url: FRONTEND_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      stdout: 'pipe',
      stderr: 'pipe'
    }
  ]
});

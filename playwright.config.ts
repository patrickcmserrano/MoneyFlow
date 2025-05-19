import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

// Emular __dirname em ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  testDir: './e2e-tests',
  fullyParallel: false, // Changed to false to avoid concurrency issues
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1, // Added 1 retry for local runs
  workers: 1, // Limiting to 1 worker to avoid server conflicts
  reporter: 'html',
  timeout: 60000, // Increased overall timeout
  globalSetup: path.join(__dirname, 'e2e-tests/global-setup.ts'),
  use: {
    baseURL: 'http://localhost:5174/MoneyFlow/',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: process.env.CI ? 'on-first-retry' : 'off',
    viewport: { width: 1280, height: 720 },
    actionTimeout: 30000, // Increased timeout
    navigationTimeout: 60000, // Increased timeout
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    /* Enable these when the system dependencies are installed
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
    */
  ],  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5174/MoneyFlow/',
    reuseExistingServer: !process.env.CI,
    timeout: 180000, // Increased timeout for server startup
    stdout: 'pipe', // Log server output
    stderr: 'pipe', // Log server errors
  },
});
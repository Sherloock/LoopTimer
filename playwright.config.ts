import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./e2e",
	timeout: 30_000,
	expect: { timeout: 5_000 },
	retries: process.env.CI ? 2 : 0,
	use: {
		baseURL: "http://localhost:3000",
		trace: "on-first-retry",
	},
	webServer: {
		command: "next dev -p 3000",
		port: 3000,
		reuseExistingServer: !process.env.CI,
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
});

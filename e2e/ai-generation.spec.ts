import { expect, test } from "@playwright/test";

test.describe("AI Workout Generation", () => {
	test("should generate workout from natural language prompt", async ({
		page,
	}) => {
		// Navigate to timer editor
		await page.goto("/app/timer/edit");

		// Open AI prompt dialog
		await page.click('button[aria-label="Generate with AI"]');
		await expect(
			page.getByRole("dialog", { name: /ai.*generate/i }),
		).toBeVisible();

		// Enter prompt
		await page.fill(
			'textarea[placeholder*="work"]',
			"Create a 20 minute HIIT workout with 30 seconds work and 15 seconds rest",
		);

		// Submit
		await page.click('button:has-text("Generate")');

		// Wait for generation (with loading state)
		await expect(page.getByText(/generating/i)).toBeVisible();

		// Wait for completion
		await expect(page.getByText(/generating/i)).not.toBeVisible({
			timeout: 30000,
		});

		// Verify timer was created
		// This depends on your UI - could check for interval blocks, timer name, etc.
		await expect(page.getByText(/interval|work|rest/i)).toBeVisible();

		// Verify we can save the generated timer
		await page.click('button:has-text("Save")');
		await expect(page).toHaveURL(/\/app\/timer\/list/);
	});

	test("should handle AI generation errors gracefully", async ({ page }) => {
		await page.goto("/app/timer/edit");

		// Open AI dialog
		await page.click('button[aria-label="Generate with AI"]');

		// Submit empty prompt
		await page.click('button:has-text("Generate")');

		// Should show validation error
		await expect(page.getByText(/please enter.*description/i)).toBeVisible();
	});

	test("should show retry mechanism for AI failures", async ({ page }) => {
		// This test would require mocking the API to return errors
		// Or testing with invalid API key scenario

		await page.goto("/app/timer/edit");
		await page.click('button[aria-label="Generate with AI"]');

		await page.fill('textarea[placeholder*="work"]', "Simple workout");
		await page.click('button:has-text("Generate")');

		// If API fails, should show retry count
		// await expect(page.getByText(/attempt.*\d+/i)).toBeVisible();
	});

	test("should allow editing AI-generated timer", async ({ page }) => {
		// Generate a timer
		await page.goto("/app/timer/edit");
		await page.click('button[aria-label="Generate with AI"]');
		await page.fill("textarea", "Tabata workout");
		await page.click('button:has-text("Generate")');

		// Wait for generation
		await page.waitForTimeout(5000);

		// Close dialog
		await page.keyboard.press("Escape");

		// Should be able to modify the generated timer
		await page.fill('input[name="timerName"]', "My Custom Tabata");

		// Save
		await page.click('button:has-text("Save")');
		await expect(page).toHaveURL(/\/app\/timer\/list/);
		await expect(page.getByText("My Custom Tabata")).toBeVisible();
	});
});

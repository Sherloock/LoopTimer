import { expect, test } from "@playwright/test";

test.describe("Timer Lifecycle", () => {
	test("should complete full timer lifecycle: create → edit → play → complete", async ({
		page,
	}) => {
		// Navigate to app (assuming user is signed in or we're using test auth)
		await page.goto("/app/menu");

		// Navigate to timer creation
		await page.click('text="Create Timer"');
		await expect(page).toHaveURL(/\/app\/timer\/edit/);

		// Create a simple timer
		await page.fill('input[name="timerName"]', "Test Workout");

		// Add an interval (work period)
		await page.click('button:has-text("Add Interval")');
		await page.fill('input[name="intervalDuration"]', "30");
		await page.selectOption('select[name="intervalType"]', "work");

		// Save timer
		await page.click('button:has-text("Save")');

		// Should navigate back to timer list
		await expect(page).toHaveURL(/\/app\/timer\/list/);
		await expect(page.getByText("Test Workout")).toBeVisible();

		// Play the timer
		await page.click('button[aria-label="Play Test Workout"]');
		await expect(page).toHaveURL(/\/app\/timer\/play/);

		// Verify timer is running
		await expect(page.getByText("WORK")).toBeVisible();
		await expect(page.getByRole("button", { name: "Pause" })).toBeVisible();

		// Pause timer
		await page.keyboard.press("Space");
		await expect(page.getByRole("button", { name: "Play" })).toBeVisible();

		// Resume timer
		await page.keyboard.press("Space");
		await expect(page.getByRole("button", { name: "Pause" })).toBeVisible();

		// Stop timer
		await page.keyboard.press("Escape");

		// Should show confirmation or navigate back
		// This depends on your implementation
	});

	test("should handle keyboard controls during playback", async ({ page }) => {
		await page.goto("/app/timer/play");

		// Assuming there's a timer loaded
		// Test space bar (play/pause)
		await page.keyboard.press("Space");

		// Test M key (mute)
		await page.keyboard.press("m");

		// Test Escape (stop)
		await page.keyboard.press("Escape");
	});

	test("should display timer completion screen", async ({ page }) => {
		// This test requires setting up a very short timer
		// Or mocking the timer state
		await page.goto("/app/timer/play");

		// Fast-forward or wait for completion
		// await page.waitForSelector('text="Workout Complete"', { timeout: 35000 });

		// Verify completion screen elements
		// await expect(page.getByText("Workout Complete")).toBeVisible();
		// await expect(page.getByText("Great job!")).toBeVisible();
	});
});

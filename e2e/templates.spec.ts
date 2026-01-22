import { expect, test } from "@playwright/test";

test.describe("Timer Templates", () => {
	test("should browse and clone a template", async ({ page }) => {
		await page.goto("/app/menu");

		// Navigate to templates
		await page.click('text="Template Library"');
		await expect(page).toHaveURL(/\/app\/timer\/templates/);

		// Should show templates
		await expect(page.getByText("Template Library")).toBeVisible();

		// Should have system templates
		await expect(page.getByText("Tabata Classic")).toBeVisible();
		await expect(page.getByText("HIIT Beginner")).toBeVisible();

		// Clone a template
		await page.click('button:has-text("Clone"):first');

		// Should redirect to timer list
		await expect(page).toHaveURL(/\/app\/timer\/list/);

		// Template should appear in timer list
		await expect(page.getByText("Tabata Classic")).toBeVisible();
	});

	test("should filter templates by category", async ({ page }) => {
		await page.goto("/app/timer/templates");

		// Click on HIIT category
		await page.click('button[role="tab"]:has-text("HIIT")');

		// Should show only HIIT templates
		await expect(page.getByText("HIIT Beginner")).toBeVisible();
		// Tabata should not be visible (it's in Tabata category)
		await expect(page.getByText("Tabata Classic")).not.toBeVisible();
	});

	test("should search templates", async ({ page }) => {
		await page.goto("/app/timer/templates");

		// Search for "boxing"
		await page.fill('input[placeholder*="Search"]', "boxing");

		// Should show only boxing templates
		await expect(page.getByText("Boxing Rounds")).toBeVisible();
		// Others should not be visible
		await expect(page.getByText("Tabata Classic")).not.toBeVisible();
	});
});

test.describe("Export/Import", () => {
	test("should export timer as JSON", async ({ page }) => {
		// This test would require setting up download handling
		// For now, just verify the button exists
		await page.goto("/app/timer/edit");

		// Should have export button
		await expect(page.getByRole("button", { name: /export/i })).toBeVisible();
	});

	test("should open import dialog", async ({ page }) => {
		await page.goto("/app/timer/list");

		// Click import button
		await page.click('button:has-text("Import")');

		// Import dialog should open
		await expect(page.getByRole("dialog")).toBeVisible();
		await expect(page.getByText("Import Timer")).toBeVisible();

		// Should have tabs
		await expect(page.getByRole("tab", { name: /file/i })).toBeVisible();
		await expect(page.getByRole("tab", { name: /clipboard/i })).toBeVisible();
		await expect(page.getByRole("tab", { name: /link/i })).toBeVisible();
	});
});

test.describe("Share Timer", () => {
	test("should open share dialog from editor", async ({ page }) => {
		await page.goto("/app/timer/edit");

		// Click share button
		await page.click('button:has-text("Share")');

		// Share dialog should open
		await expect(page.getByRole("dialog")).toBeVisible();
		await expect(page.getByText("Share Timer")).toBeVisible();

		// Should have expiration options
		await expect(page.getByText("Link expires in")).toBeVisible();
	});
});

test.describe("Save as Template", () => {
	test("should open save template dialog", async ({ page }) => {
		await page.goto("/app/timer/edit");

		// Click save template button
		await page.click('button:has-text("Template")');

		// Dialog should open
		await expect(page.getByRole("dialog")).toBeVisible();
		await expect(page.getByText("Save as Template")).toBeVisible();

		// Should have category selector
		await expect(page.getByText("Category")).toBeVisible();

		// Should have public toggle
		await expect(page.getByText(/make this template public/i)).toBeVisible();
	});
});

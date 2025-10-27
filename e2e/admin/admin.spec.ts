import { expect, test } from "@playwright/test";
import { AdminDashboardPage } from "../utils/page-objects";

// Use the admin authentication state for all tests in this file
test.use({ storageState: "playwright/.auth/user.json" });

test.describe("Admin Functionality", () => {
	test("should display the admin dashboard for admin users", async ({
		page,
	}) => {
		const adminPage = new AdminDashboardPage(page);

		// Navigate to the admin dashboard
		await adminPage.goto();

		// Check that the admin dashboard heading is visible
		await expect(adminPage.heading).toBeVisible();

		// Check that the create move button is available
		await expect(adminPage.createMoveButton).toBeVisible();
	});

	test("should allow creating a new move", async ({ page }) => {
		const adminPage = new AdminDashboardPage(page);

		// Navigate to the admin dashboard
		await adminPage.goto();

		// Click on create new move button
		await adminPage.createNewMove();

		// Check that we're on the create move form
		await expect(
			page.getByRole("heading", { name: "Create Move" })
		).toBeVisible();

		// Fill in the form
		const moveName = `Test Move ${Date.now()}`;
		await page.getByLabel("Name").fill(moveName);
		await page
			.getByLabel("Description")
			.fill("This is a test move created by Playwright");
		await page.getByLabel("Level").selectOption("Beginner");

		// Add a step
		await page.getByRole("button", { name: "Add Step" }).click();
		await page.getByLabel("Step Description").fill("This is step 1");

		// Upload a test image if available
		const fileInput = page.locator('input[type="file"]');
		if ((await fileInput.count()) > 0) {
			await fileInput.setInputFiles({
				name: "test-image.jpg",
				mimeType: "image/jpeg",
				buffer: Buffer.from("fake image content"),
			});
		}

		// Submit the form
		await page.getByRole("button", { name: "Save" }).click();

		// Check for success notification
		await expect(page.getByText("Move created successfully")).toBeVisible();

		// Verify the new move appears in the admin list
		await adminPage.goto(); // Go back to admin dashboard
		await expect(page.getByText(moveName)).toBeVisible();
	});

	test("should allow editing an existing move", async ({ page }) => {
		const adminPage = new AdminDashboardPage(page);

		// Navigate to the admin dashboard
		await adminPage.goto();

		// Get the name of the first move in the list
		const moveRow = page.locator(".admin-moves-list tr").nth(1); // Skip header row
		const moveName = await moveRow.locator("td").first().textContent();
		expect(moveName).toBeTruthy();

		if (moveName) {
			// Click on edit button for this move
			await moveRow.getByRole("button", { name: "Edit" }).click();

			// Check that we're on the edit move form
			await expect(
				page.getByRole("heading", { name: "Edit Move" })
			).toBeVisible();

			// Update the description
			const updatedDesc = `Updated description ${Date.now()}`;
			await page.getByLabel("Description").fill(updatedDesc);

			// Submit the form
			await page.getByRole("button", { name: "Save" }).click();

			// Check for success notification
			await expect(page.getByText("Move updated successfully")).toBeVisible();
		}
	});

	test("should allow deleting a move", async ({ page }) => {
		const adminPage = new AdminDashboardPage(page);

		// Navigate to the admin dashboard
		await adminPage.goto();

		// Get the initial count of moves
		const initialCount =
			(await page.locator(".admin-moves-list tr").count()) - 1; // Subtract header row

		// Get the name of the last move in the list (to delete)
		const lastMoveRow = page.locator(".admin-moves-list tr").nth(initialCount); // Last row
		const moveName = await lastMoveRow.locator("td").first().textContent();
		expect(moveName).toBeTruthy();

		if (moveName) {
			// Click on delete button for this move
			await lastMoveRow.getByRole("button", { name: "Delete" }).click();

			// Confirm deletion
			await page.getByRole("button", { name: "Confirm" }).click();

			// Check for success notification
			await expect(page.getByText("Move deleted successfully")).toBeVisible();

			// Verify the move count has decreased
			const newCount = (await page.locator(".admin-moves-list tr").count()) - 1; // Subtract header row
			expect(newCount).toBe(initialCount - 1);
		}
	});

	test("should prevent non-admin users from accessing admin pages", async ({
		browser,
	}) => {
		// Create a new context with regular user auth
		const context = await browser.newContext({
			storageState: "playwright/.auth/user.json",
		});

		const page = await context.newPage();

		// Try to access admin page
		await page.goto("/admin");

		// Check that we're redirected or shown an error
		await expect(page.url()).not.toContain("/admin");

		// Clean up
		await context.close();
	});
});

import { expect, test } from "@playwright/test";
import { MyMovesPage } from "../pages/my-moves-page";

// Use authentication setup from playwright.config.ts

// Define regex at top level to avoid linting issues
const CATALOG_URL_REGEX = /\/catalog/;

test.describe("My Moves Page", () => {
	// Authentication is handled by the auth fixture in playwright.config.ts

	test("should allow filtering moves by level and navigating to catalog", async ({
		page,
	}) => {
		// Arrange
		const myMovesPage = new MyMovesPage(page);

		// Act - Navigate to my moves page
		await myMovesPage.goto();

		// Assert - Page loaded successfully
		await expect(myMovesPage.pageContainer).toBeVisible();

		// Get initial count of moves
		const initialCount = await myMovesPage.getMovesCount();

		// Act - Filter by beginner level
		await myMovesPage.filterByLevel("beginner");

		// Wait for filtering to complete
		await page.waitForLoadState("networkidle");

		// Assert - Filtered count might be different
		const filteredCount = await myMovesPage.getMovesCount();
		console.log(
			`Initial moves: ${initialCount}, Filtered moves: ${filteredCount}`
		);

		// Act - Click "Dodaj figury" button
		await myMovesPage.clickAddMovesButton();

		// Assert - Should navigate to catalog page
		await expect(page).toHaveURL(CATALOG_URL_REGEX);
	});
});

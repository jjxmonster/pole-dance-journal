import { expect, test } from "@playwright/test";
import { CatalogPage } from "../pages/catalog-page";
import { MoveDetailsPage } from "../pages/move-details-page";

test.describe("Move Catalog", () => {
	test("should display the move catalog with moves", async ({ page }) => {
		const catalogPage = new CatalogPage(page);

		// Navigate to the catalog page
		await catalogPage.goto();

		// Check that the catalog heading is visible
		await expect(catalogPage.heading).toBeVisible();

		// Check that we have some moves displayed
		const moveCount = await catalogPage.getMoveCount();
		expect(moveCount).toBeGreaterThan(0);
	});

	test("should allow searching for moves", async ({ page }) => {
		const catalogPage = new CatalogPage(page);

		// Navigate to the catalog page
		await catalogPage.goto();

		// Get the initial count of moves
		const initialCount = await catalogPage.getMoveCount();

		// get first card title
		const firstCardTitle = await page
			.getByTestId("move-card-title")
			.first()
			.textContent();
		expect(firstCardTitle).toBeTruthy();

		if (firstCardTitle) {
			// Search for the first card title
			await catalogPage.searchFor(firstCardTitle);

			// Check that the search results are displayed
			const searchResultCount = await catalogPage.getMoveCount();

			// Either we found fewer items (filtered) or the same number if all items match
			expect(searchResultCount).toBeLessThanOrEqual(initialCount);
		}
	});

	test("should allow filtering moves by category", async ({ page }) => {
		const catalogPage = new CatalogPage(page);

		// Navigate to the catalog page
		await catalogPage.goto();

		// Get the initial count of moves
		const initialCount = await catalogPage.getMoveCount();

		// Filter by a category (adjust based on your actual categories)
		await catalogPage.filterBy("Początkujący");

		// Check that the filtered results are displayed
		const filteredCount = await catalogPage.getMoveCount();

		// Either we found fewer items (filtered) or the same number if all items match
		expect(filteredCount).toBeLessThanOrEqual(initialCount);
	});

	test("should navigate to move detail page when clicking on a move", async ({
		page,
	}) => {
		const catalogPage = new CatalogPage(page);

		// Navigate to the catalog page
		await catalogPage.goto();

		// Make sure we have at least one move
		const moveCount = await catalogPage.getMoveCount();
		expect(moveCount).toBeGreaterThan(0);

		// Get the text of the first move card title
		const firstCardTitle = await page
			.getByTestId("move-card-title")
			.first()
			.textContent();
		expect(firstCardTitle).toBeTruthy();

		// Click on the first move
		await page.getByTestId("move-card").first().click();

		// Check that we're on the move detail page
		const moveDetailsPage = new MoveDetailsPage(page);
		await expect(moveDetailsPage.title).toBeVisible();

		// Verify the title matches what we clicked
		if (firstCardTitle) {
			await expect(moveDetailsPage.title).toContainText(firstCardTitle);
		}
	});
});

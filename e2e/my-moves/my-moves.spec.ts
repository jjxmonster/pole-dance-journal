import { expect, test } from "@playwright/test";
import {
	CatalogPage,
	MoveDetailPage,
	MyMovesPage,
} from "../utils/page-objects";

test.use({ storageState: "playwright/.auth/user.json" });

test.describe("My Moves Functionality", () => {
	test("should display the my moves page for authenticated user", async ({
		page,
	}) => {
		const myMovesPage = new MyMovesPage(page);

		// Navigate to the my moves page
		await myMovesPage.goto();

		// Check that the my moves heading is visible
		await expect(myMovesPage.heading).toBeVisible();
	});

	test("should allow filtering moves by status", async ({ page }) => {
		const myMovesPage = new MyMovesPage(page);

		// Navigate to the my moves page
		await myMovesPage.goto();

		// Filter by "In Progress" status
		await myMovesPage.filterByStatus("In Progress");

		// Check that the filtered results are displayed
		await expect(page.url()).toContain("status=in-progress");
	});

	test("should allow adding a move to My Moves from catalog", async ({
		page,
	}) => {
		// First, go to the catalog
		const catalogPage = new CatalogPage(page);
		await catalogPage.goto();

		// Make sure we have at least one move
		const moveCount = await catalogPage.getMoveCount();
		expect(moveCount).toBeGreaterThan(0);

		// Click on the first move
		await page.locator(".move-card").first().click();

		// On the move detail page, add to My Moves with "To Do" status
		const moveDetailPage = new MoveDetailPage(page);
		await moveDetailPage.updateStatus("To Do");

		// Check for success notification
		await expect(page.getByText("Status updated")).toBeVisible();

		// Go to My Moves page
		const myMovesPage = new MyMovesPage(page);
		await myMovesPage.goto();

		// Filter by "To Do" status
		await myMovesPage.filterByStatus("To Do");

		// Check that we have at least one move in the list
		const myMovesCount = await myMovesPage.getMoveCount();
		expect(myMovesCount).toBeGreaterThan(0);
	});

	test("should allow adding notes to a move", async ({ page }) => {
		// Go to My Moves page
		const myMovesPage = new MyMovesPage(page);
		await myMovesPage.goto();

		// Click on the first move
		await page.locator(".move-item").first().click();

		// On the move detail page, add a note
		const moveDetailPage = new MoveDetailPage(page);
		const noteText = `Test note created by Playwright ${Date.now()}`;
		await moveDetailPage.addNote(noteText);

		// Check that the note was added
		await expect(page.getByText(noteText)).toBeVisible();
	});

	test("should allow updating move status", async ({ page }) => {
		// Go to My Moves page
		const myMovesPage = new MyMovesPage(page);
		await myMovesPage.goto();

		// Click on the first move
		await page.locator(".move-item").first().click();

		// On the move detail page, update status to "Completed"
		const moveDetailPage = new MoveDetailPage(page);
		await moveDetailPage.updateStatus("Completed");

		// Check for success notification
		await expect(page.getByText("Status updated")).toBeVisible();

		// Go back to My Moves and filter by "Completed"
		await myMovesPage.goto();
		await myMovesPage.filterByStatus("Completed");

		// Check that we have at least one completed move
		const completedCount = await myMovesPage.getMoveCount();
		expect(completedCount).toBeGreaterThan(0);
	});
});

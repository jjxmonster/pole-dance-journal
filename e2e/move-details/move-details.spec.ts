import { expect, test } from "@playwright/test";
import { CatalogPage } from "../pages/catalog-page";
import { MoveDetailsPage } from "../pages/move-details-page";

// Use authentication setup for tests requiring login
test.use({ storageState: "playwright/.auth/user.json" });

test.describe("Move Details", () => {
	let catalogPage: CatalogPage;
	let moveDetailsPage: MoveDetailsPage;

	// biome-ignore lint/suspicious/useAwait: we don't need to await this
	test.beforeEach(async ({ page }) => {
		catalogPage = new CatalogPage(page);
		moveDetailsPage = new MoveDetailsPage(page);
	});

	test("should allow changing move status", async ({ page }) => {
		// 1. Navigate to catalog and select a move
		await catalogPage.goto();

		const firstMoveCardTitle = await page
			.getByTestId("move-card-title")
			.first()
			.textContent();
		expect(firstMoveCardTitle).toBeTruthy();

		if (firstMoveCardTitle) {
			await catalogPage.clickOnMove(firstMoveCardTitle);
		}

		// Verify we're on the move details page
		await expect(moveDetailsPage.title).toBeVisible();

		// 2. Change the move status to "in-progress"
		await moveDetailsPage.updateStatus("DONE");

		// Verify the status was updated (button should have active state)
		const inProgressButton = page.getByTestId("status-button-DONE-active");
		await expect(inProgressButton).toBeVisible();
	});

	test("should allow adding a note", async ({ page }) => {
		// 1. Navigate to catalog and select a move
		await catalogPage.goto();
		const firstMoveCardTitle = await page
			.getByTestId("move-card-title")
			.first()
			.textContent();
		expect(firstMoveCardTitle).toBeTruthy();
		if (firstMoveCardTitle) {
			await catalogPage.clickOnMove(firstMoveCardTitle);
		}

		// Verify we're on the move details page
		await expect(moveDetailsPage.title).toBeVisible();

		// 3. Add a new note
		const noteText = "This is a test note created by e2e";
		await moveDetailsPage.addNote(noteText);

		// Verify the note was added
		const noteContent = await moveDetailsPage.getNoteContent();
		expect(noteContent).toContain(noteText);
	});
});

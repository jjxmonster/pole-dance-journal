import type { Locator, Page } from "@playwright/test";
import { BasePage } from "../utils/page-objects";

export class MoveDetailsPage extends BasePage {
	readonly title: Locator;
	readonly description: Locator;
	readonly statusButtons: Locator;
	readonly noteTextarea: Locator;
	readonly addNoteButton: Locator;
	readonly stepsList: Locator;
	readonly noteHistory: Locator;

	constructor(page: Page) {
		super(page);
		this.title = page.getByTestId("move-title");
		this.description = page.getByTestId("move-description");
		this.statusButtons = page.getByTestId("status-buttons-container");
		this.noteTextarea = page.getByTestId("note-textarea");
		this.addNoteButton = page.getByTestId("add-note-button");
		this.stepsList = page.getByTestId("steps-list");
		this.noteHistory = page.getByTestId("notes-history");
	}

	async updateStatus(status: string): Promise<void> {
		// Wait for the status button to be visible first
		const statusButton = this.page.getByTestId(
			`status-button-${status}-inactive`
		);
		await statusButton.waitFor({ state: "visible", timeout: 5000 });

		// Click the button and wait for network request to complete
		await statusButton.click();
		await this.page.waitForLoadState("networkidle");
	}

	async addNote(note: string): Promise<void> {
		await this.noteTextarea.click();
		await this.noteTextarea.fill(note);
		await this.addNoteButton.click();
		await this.page.waitForLoadState("networkidle");
	}

	async getNoteContent(): Promise<string | null> {
		// First check if the note content is visible with a shorter timeout
		try {
			await this.page.getByTestId("note-content").waitFor({
				state: "visible",
				timeout: 5000,
			});
		} catch {
			// Continue silently if timeout occurs
		}

		// Get the text content regardless of the previous step
		const content = await this.page
			.getByTestId("note-content")
			.first()
			.textContent();

		return content;
	}
}

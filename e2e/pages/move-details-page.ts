import type { Locator, Page } from "@playwright/test";
import { BasePage } from "../utils/page-objects";

export class MoveDetailsPage extends BasePage {
	readonly title: Locator;
	readonly description: Locator;
	readonly statusButtons: Locator;
	readonly noteEditor: Locator;
	readonly stepsList: Locator;

	constructor(page: Page) {
		super(page);
		this.title = page.getByRole("heading").first();
		this.description = page.locator(".move-description");
		this.statusButtons = page.locator(".status-buttons button");
		this.noteEditor = page.locator(".note-editor");
		this.stepsList = page.locator(".steps-list");
	}

	async updateStatus(status: string): Promise<void> {
		await this.page.getByRole("button", { name: status }).click();
		await this.page.waitForLoadState("networkidle");
	}

	async addNote(note: string): Promise<void> {
		await this.noteEditor.click();
		await this.page.keyboard.type(note);
		await this.page.getByRole("button", { name: "Save" }).click();
		await this.page.waitForLoadState("networkidle");
	}
}

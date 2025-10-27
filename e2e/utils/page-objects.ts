import { expect, type Locator, type Page } from "@playwright/test";

/**
 * Base Page Object class that other page objects will extend
 */
const DEBOUNCE_TIME = 300;

export class BasePage {
	readonly page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	async goto(path: string): Promise<void> {
		await this.page.goto(path);
		await this.page.waitForLoadState("networkidle");
	}
}

/**
 * Page Object for the Catalog page
 */
export class CatalogPage extends BasePage {
	readonly heading: Locator;
	readonly searchInput: Locator;
	readonly moveCards: Locator;

	constructor(page: Page) {
		super(page);
		this.heading = page.getByTestId("catalog-header");
		this.searchInput = page.getByTestId("search-moves-input");
		this.moveCards = page.getByTestId("move-card");
	}

	async goto(): Promise<void> {
		await super.goto("/catalog");
		await expect(this.heading).toBeVisible();
	}

	async searchFor(term: string): Promise<void> {
		await this.searchInput.fill(term);
		await this.page.waitForTimeout(DEBOUNCE_TIME); // Wait for debounce
		await this.page.waitForLoadState("networkidle");
	}

	async filterBy(option: string): Promise<void> {
		await this.page
			.getByTestId("level-filter-badge")
			.filter({ hasText: option })
			.click();
		await this.page.waitForTimeout(DEBOUNCE_TIME); // Wait for debounce
		await this.page.waitForLoadState("networkidle");
	}

	async getMoveCount(): Promise<number> {
		return await this.moveCards.count();
	}

	async clickOnMove(name: string): Promise<void> {
		await this.page.getByRole("link", { name }).click();
		await this.page.waitForLoadState("networkidle");
	}
}

/**
 * Page Object for the Move Detail page
 */
export class MoveDetailPage extends BasePage {
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

/**
 * Page Object for the My Moves page
 */
export class MyMovesPage extends BasePage {
	readonly heading: Locator;
	readonly movesList: Locator;
	readonly filterTabs: Locator;

	constructor(page: Page) {
		super(page);
		this.heading = page.getByRole("heading", { name: "My Moves" });
		this.movesList = page.locator(".my-moves-list");
		this.filterTabs = page.locator(".filter-tabs button");
	}

	async goto(): Promise<void> {
		await super.goto("/my-moves");
		await expect(this.heading).toBeVisible();
	}

	async filterByStatus(status: string): Promise<void> {
		await this.page.getByRole("tab", { name: status }).click();
		await this.page.waitForLoadState("networkidle");
	}

	async getMoveCount(): Promise<number> {
		return await this.movesList.locator(".move-item").count();
	}
}

/**
 * Page Object for the Admin Dashboard
 */
export class AdminDashboardPage extends BasePage {
	readonly heading: Locator;
	readonly createMoveButton: Locator;
	readonly movesList: Locator;

	constructor(page: Page) {
		super(page);
		this.heading = page.getByRole("heading", { name: "Admin Dashboard" });
		this.createMoveButton = page.getByRole("button", { name: "Create Move" });
		this.movesList = page.locator(".admin-moves-list");
	}

	async goto(): Promise<void> {
		await super.goto("/admin");
		await expect(this.heading).toBeVisible();
	}

	async createNewMove(): Promise<void> {
		await this.createMoveButton.click();
		await this.page.waitForLoadState("networkidle");
	}

	async editMove(name: string): Promise<void> {
		await this.page
			.getByRole("row", { name })
			.getByRole("button", { name: "Edit" })
			.click();
		await this.page.waitForLoadState("networkidle");
	}

	async deleteMove(name: string): Promise<void> {
		await this.page
			.getByRole("row", { name })
			.getByRole("button", { name: "Delete" })
			.click();
		await this.page.getByRole("button", { name: "Confirm" }).click();
		await this.page.waitForLoadState("networkidle");
	}
}

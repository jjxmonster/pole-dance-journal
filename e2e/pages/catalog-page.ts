import { expect, type Locator, type Page } from "@playwright/test";
import { BasePage, DEBOUNCE_TIME } from "../utils/page-objects";

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
		await this.page.waitForTimeout(DEBOUNCE_TIME);
		await this.page.waitForLoadState("networkidle");
	}

	async filterBy(option: string): Promise<void> {
		await this.page
			.getByTestId("level-filter-badge")
			.filter({ hasText: option })
			.click();
		await this.page.waitForTimeout(DEBOUNCE_TIME);
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

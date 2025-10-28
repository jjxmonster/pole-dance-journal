// No need to import Page type as it's already available from BasePage
import { BasePage } from "../utils/page-objects";

export class MyMovesPage extends BasePage {
	// Locators
	get pageContainer() {
		return this.page.getByTestId("my-moves-page");
	}

	get addMovesButton() {
		return this.page.getByTestId("add-moves-button");
	}

	get levelFilters() {
		return this.page.getByTestId("level-filters");
	}

	// Methods
	async goto() {
		await this.page.goto("/my-moves");
		await this.pageContainer.waitFor();
	}

	async filterByLevel(level: "all" | "beginner" | "intermediate" | "advanced") {
		await this.page.getByTestId(`filter-${level}`).click();
	}

	async clickAddMovesButton() {
		await this.addMovesButton.click();
	}

	getMoveCards() {
		return this.page.locator('[data-testid^="move-card-"]');
	}

	async getMovesCount() {
		const cards = await this.getMoveCards();
		return cards.count();
	}
}

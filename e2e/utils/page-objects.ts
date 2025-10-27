import type { Page } from "@playwright/test";

export const DEBOUNCE_TIME = 300;

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

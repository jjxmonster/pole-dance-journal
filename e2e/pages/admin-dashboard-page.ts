import { expect, type Locator, type Page } from "@playwright/test";
import { BasePage } from "../utils/page-objects";

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

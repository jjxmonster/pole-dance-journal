import { test as teardown } from "@playwright/test";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { moveNotes, userMoveStatuses } from "@/db/schema";

const E2E_USER_ID = process.env.E2E_USER_ID;

if (!E2E_USER_ID) {
	throw new Error("E2E_USER_ID must be set");
}

// Teardown function to clean up all user move statuses and notes for the e2e test user
teardown("cleanup user move data", async () => {
	try {
		// First delete all move notes (due to foreign key constraints)
		await db.delete(moveNotes).where(eq(moveNotes.userId, E2E_USER_ID));

		// Then delete all user move statuses (which also removes the embedded notes)
		await db
			.delete(userMoveStatuses)
			.where(eq(userMoveStatuses.userId, E2E_USER_ID));
	} catch (error) {
		// If there's an error, we want the test to fail
		throw new Error(`Failed to clean up test data: ${error}`);
	}
});

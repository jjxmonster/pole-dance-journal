import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { moveNotes } from "../db/schema";

export async function getMoveNotes(userId: string, moveId: string) {
	const result = await db
		.select({
			id: moveNotes.id,
			content: moveNotes.content,
			createdAt: moveNotes.createdAt,
		})
		.from(moveNotes)
		.where(and(eq(moveNotes.userId, userId), eq(moveNotes.moveId, moveId)))
		.orderBy(moveNotes.createdAt);

	return result;
}

export async function addMoveNote(
	userId: string,
	moveId: string,
	content: string
) {
	const result = await db
		.insert(moveNotes)
		.values({
			userId,
			moveId,
			content,
		})
		.returning();

	return result[0];
}

export async function deleteMoveNote(userId: string, noteId: string) {
	const result = await db
		.delete(moveNotes)
		.where(and(eq(moveNotes.id, noteId), eq(moveNotes.userId, userId)))
		.returning();

	return result.length > 0;
}

import { eq } from "drizzle-orm";
import { db } from "../db";
import { moves, userMoveStatuses } from "../db/schema";

export async function checkMoveExists(moveId: string): Promise<boolean> {
	const result = await db
		.select({ id: moves.id })
		.from(moves)
		.where(eq(moves.id, moveId))
		.limit(1);

	return result.length > 0;
}

export async function getUserMoveStatus(userId: string, moveId: string) {
	const result = await db
		.select({
			status: userMoveStatuses.status,
			note: userMoveStatuses.note,
			updatedAt: userMoveStatuses.updatedAt,
		})
		.from(userMoveStatuses)
		.where(
			eq(userMoveStatuses.userId, userId) && eq(userMoveStatuses.moveId, moveId)
		)
		.limit(1);

	return result.length > 0 ? result[0] : null;
}

export async function upsertUserMoveStatus({
	userId,
	moveId,
	status,
	note,
}: {
	userId: string;
	moveId: string;
	status: "WANT" | "ALMOST" | "DONE";
	note?: string;
}) {
	const now = new Date();

	const result = await db
		.insert(userMoveStatuses)
		.values({
			userId,
			moveId,
			status,
			note,
			createdAt: now,
			updatedAt: now,
		})
		.onConflictDoUpdate({
			target: [userMoveStatuses.userId, userMoveStatuses.moveId],
			set: {
				status,
				note,
				updatedAt: now,
			},
		})
		.returning();

	return result[0];
}

import {
	and,
	asc,
	count,
	desc,
	eq,
	ilike,
	isNotNull,
	isNull,
	or,
	type SQLWrapper,
	sql,
} from "drizzle-orm";
import type { z } from "zod";
import { db } from "../db";
import { moves, steps } from "../db/schema";
import type { MovesListInputSchema } from "../orpc/schema";

type ListPublishedMovesInput = z.infer<typeof MovesListInputSchema>;

export async function listPublishedMoves(input: ListPublishedMovesInput) {
	const conditions = [isNotNull(moves.publishedAt), isNull(moves.deletedAt)];

	if (input.level) {
		conditions.push(eq(moves.level, input.level));
	}

	if (input.query) {
		const searchPattern = `%${input.query}%`;
		const searchCondition = or(
			ilike(moves.name, searchPattern),
			ilike(moves.description, searchPattern)
		);
		if (searchCondition) {
			conditions.push(searchCondition);
		}
	}

	const whereClause = and(...conditions);

	const [totalResult, movesResult] = await Promise.all([
		db.select({ count: count() }).from(moves).where(whereClause),
		db
			.select({
				id: moves.id,
				name: moves.name,
				description: moves.description,
				level: moves.level,
				slug: moves.slug,
				imageUrl: moves.imageUrl,
			})
			.from(moves)
			.where(whereClause)
			.orderBy(desc(moves.publishedAt))
			.limit(input.limit)
			.offset(input.offset),
	]);

	return {
		moves: movesResult,
		total: totalResult[0]?.count ?? 0,
	};
}

export async function getMoveBySlug(slug: string) {
	const move = await db.query.moves.findFirst({
		where: and(
			eq(sql`lower(${moves.slug})`, slug.toLowerCase()),
			isNotNull(moves.publishedAt),
			isNull(moves.deletedAt)
		),
		columns: {
			id: true,
			name: true,
			description: true,
			level: true,
			slug: true,
			imageUrl: true,
		},
		with: {
			steps: {
				columns: {
					orderIndex: true,
					title: true,
					description: true,
				},
				orderBy: [asc(steps.orderIndex)],
			},
		},
	});

	return move ?? null;
}

export async function getMovesForUser(
	userId: string,
	level?: "Beginner" | "Intermediate" | "Advanced"
) {
	const { userMoveStatuses } = await import("../db/schema");

	const conditions = [eq(userMoveStatuses.userId, userId)];

	if (level) {
		conditions.push(eq(moves.level, level));
	}

	const result = await db
		.select({
			id: moves.id,
			name: moves.name,
			level: moves.level,
			slug: moves.slug,
			imageUrl: moves.imageUrl,
			status: userMoveStatuses.status,
			note: userMoveStatuses.note,
			isDeleted: sql<boolean>`${moves.deletedAt} IS NOT NULL`,
		})
		.from(userMoveStatuses)
		.innerJoin(moves, eq(userMoveStatuses.moveId, moves.id))
		.where(and(...conditions))
		.orderBy(desc(userMoveStatuses.updatedAt));

	return result;
}

export async function getAdminStats() {
	const [totalResult, publishedResult, unpublishedResult] = await Promise.all([
		db.select({ count: count() }).from(moves).where(isNull(moves.deletedAt)),
		db
			.select({ count: count() })
			.from(moves)
			.where(and(isNotNull(moves.publishedAt), isNull(moves.deletedAt))),
		db
			.select({ count: count() })
			.from(moves)
			.where(and(isNull(moves.publishedAt), isNull(moves.deletedAt))),
	]);

	return {
		totalMoves: totalResult[0]?.count ?? 0,
		publishedMoves: publishedResult[0]?.count ?? 0,
		unpublishedMoves: unpublishedResult[0]?.count ?? 0,
	};
}

export async function listAdminMoves(input: {
	limit?: number;
	offset?: number;
	level?: string;
	status?: string;
	query?: string;
}) {
	const conditions: (SQLWrapper | undefined)[] = [];

	if (input.level) {
		conditions.push(
			eq(moves.level, input.level as "Beginner" | "Intermediate" | "Advanced")
		);
	}

	if (input.status === "Published") {
		conditions.push(and(isNotNull(moves.publishedAt), isNull(moves.deletedAt)));
	} else if (input.status === "Unpublished") {
		conditions.push(and(isNull(moves.publishedAt), isNull(moves.deletedAt)));
	} else if (input.status === "Deleted") {
		conditions.push(isNotNull(moves.deletedAt));
	}

	if (input.query) {
		const searchPattern = `%${input.query}%`;
		const searchCondition = or(
			ilike(moves.name, searchPattern),
			ilike(moves.description, searchPattern)
		);
		conditions.push(searchCondition);
	}

	const validConditions = conditions.filter(
		(c): c is SQLWrapper => c !== undefined
	);
	const whereClause =
		validConditions.length > 0 ? and(...validConditions) : undefined;

	const DEFAULT_ADMIN_LIMIT = 20;

	const [totalResult, movesResult] = await Promise.all([
		db.select({ count: count() }).from(moves).where(whereClause),
		db
			.select({
				id: moves.id,
				name: moves.name,
				level: moves.level,
				slug: moves.slug,
				publishedAt: moves.publishedAt,
				deletedAt: moves.deletedAt,
				updatedAt: moves.updatedAt,
			})
			.from(moves)
			.where(whereClause)
			.orderBy(desc(moves.updatedAt))
			.limit(input.limit ?? DEFAULT_ADMIN_LIMIT)
			.offset(input.offset ?? 0),
	]);

	const mappedMoves = movesResult.map((move) => {
		let status: "Published" | "Unpublished" | "Deleted";
		if (move.deletedAt) {
			status = "Deleted";
		} else if (move.publishedAt) {
			status = "Published";
		} else {
			status = "Unpublished";
		}

		return {
			id: move.id,
			name: move.name,
			level: move.level,
			slug: move.slug,
			status,
			updatedAt: move.updatedAt,
		};
	});

	return {
		moves: mappedMoves,
		total: totalResult[0]?.count ?? 0,
	};
}

export async function publishMove(moveId: string) {
	const move = await db
		.update(moves)
		.set({ publishedAt: new Date() })
		.where(eq(moves.id, moveId))
		.returning({ publishedAt: moves.publishedAt });

	if (!move[0]) {
		return null;
	}

	return move[0];
}

export async function unpublishMove(moveId: string) {
	await db.update(moves).set({ publishedAt: null }).where(eq(moves.id, moveId));
}

export async function deleteMove(moveId: string) {
	await db
		.update(moves)
		.set({ deletedAt: new Date() })
		.where(eq(moves.id, moveId));
}

export async function restoreMove(moveId: string) {
	await db.update(moves).set({ deletedAt: null }).where(eq(moves.id, moveId));
}

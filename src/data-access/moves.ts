import {
	and,
	count,
	desc,
	eq,
	ilike,
	isNotNull,
	isNull,
	or,
} from "drizzle-orm";
import type { z } from "zod";
import { db } from "../db";
import { moves } from "../db/schema";
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

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

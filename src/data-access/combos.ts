import {
	and,
	asc,
	count,
	desc,
	eq,
	ilike,
	inArray,
	isNotNull,
	isNull,
	type SQLWrapper,
	sql,
} from "drizzle-orm";
import type { z } from "zod";
import { db } from "../db";
import { comboMoves, combos, moves, userComboFavorites } from "../db/schema";
import type { CombosListInputSchema } from "../orpc/schema";

type ListPublishedCombosInput = z.infer<typeof CombosListInputSchema>;

export async function listPublishedCombos(
	input: ListPublishedCombosInput,
	userId?: string
) {
	const conditions = [isNotNull(combos.publishedAt), isNull(combos.deletedAt)];

	if (input.level) {
		conditions.push(eq(combos.level, input.level));
	}

	if (input.moveId) {
		const combosWithMove = db
			.select({ comboId: comboMoves.comboId })
			.from(comboMoves)
			.where(eq(comboMoves.moveId, input.moveId));

		conditions.push(inArray(combos.id, combosWithMove));
	}

	const whereClause = and(...conditions);

	const [totalResult, combosResult] = await Promise.all([
		db.select({ count: count() }).from(combos).where(whereClause),
		db.query.combos.findMany({
			where: whereClause,
			columns: {
				id: true,
				name: true,
				level: true,
				slug: true,
			},
			with: {
				comboMoves: {
					columns: {
						orderIndex: true,
					},
					orderBy: [asc(comboMoves.orderIndex)],
					with: {
						move: {
							columns: {
								id: true,
								name: true,
								imageUrl: true,
							},
						},
					},
				},
			},
			orderBy: [desc(combos.publishedAt)],
			limit: input.limit,
			offset: input.offset,
		}),
	]);

	let userFavorites: Set<string> = new Set();
	if (userId) {
		const favorites = await db
			.select({ comboId: userComboFavorites.comboId })
			.from(userComboFavorites)
			.where(eq(userComboFavorites.userId, userId));
		userFavorites = new Set(favorites.map((f) => f.comboId));
	}

	const mappedCombos = combosResult.map((combo) => ({
		id: combo.id,
		name: combo.name,
		level: combo.level,
		slug: combo.slug,
		moves: combo.comboMoves.map((cm) => ({
			id: cm.move.id,
			name: cm.move.name,
			imageUrl: cm.move.imageUrl,
			orderIndex: cm.orderIndex,
		})),
		isFavorite: userFavorites.has(combo.id),
	}));

	return {
		combos: mappedCombos,
		total: totalResult[0]?.count ?? 0,
	};
}

export async function getComboBySlug(slug: string, userId?: string) {
	const combo = await db.query.combos.findFirst({
		where: and(
			eq(sql`lower(${combos.slug})`, slug.toLowerCase()),
			isNotNull(combos.publishedAt),
			isNull(combos.deletedAt)
		),
		columns: {
			id: true,
			name: true,
			level: true,
			slug: true,
		},
		with: {
			comboMoves: {
				columns: {
					orderIndex: true,
				},
				orderBy: [asc(comboMoves.orderIndex)],
				with: {
					move: {
						columns: {
							id: true,
							name: true,
							slug: true,
							level: true,
							imageUrl: true,
						},
					},
				},
			},
		},
	});

	if (!combo) {
		return null;
	}

	let isFavorite = false;
	if (userId) {
		const favorite = await db.query.userComboFavorites.findFirst({
			where: and(
				eq(userComboFavorites.userId, userId),
				eq(userComboFavorites.comboId, combo.id)
			),
		});
		isFavorite = !!favorite;
	}

	return {
		id: combo.id,
		name: combo.name,
		level: combo.level,
		slug: combo.slug,
		moves: combo.comboMoves.map((cm) => ({
			id: cm.move.id,
			name: cm.move.name,
			slug: cm.move.slug,
			level: cm.move.level,
			imageUrl: cm.move.imageUrl,
			orderIndex: cm.orderIndex,
		})),
		isFavorite,
	};
}

export async function toggleComboFavorite(userId: string, comboId: string) {
	const existing = await db.query.userComboFavorites.findFirst({
		where: and(
			eq(userComboFavorites.userId, userId),
			eq(userComboFavorites.comboId, comboId)
		),
	});

	if (existing) {
		await db
			.delete(userComboFavorites)
			.where(
				and(
					eq(userComboFavorites.userId, userId),
					eq(userComboFavorites.comboId, comboId)
				)
			);
		return { isFavorite: false };
	}

	await db.insert(userComboFavorites).values({
		userId,
		comboId,
		createdAt: new Date(),
	});
	return { isFavorite: true };
}

export async function getUserComboFavorites(userId: string) {
	const favorites = await db
		.select({ comboId: userComboFavorites.comboId })
		.from(userComboFavorites)
		.where(eq(userComboFavorites.userId, userId));

	return favorites.map((f) => f.comboId);
}

export async function listAdminCombos(input: {
	limit?: number;
	offset?: number;
	level?: string;
	status?: string;
	query?: string;
}) {
	const conditions: (SQLWrapper | undefined)[] = [];

	if (input.level) {
		conditions.push(
			eq(combos.level, input.level as "Beginner" | "Intermediate" | "Advanced")
		);
	}

	if (input.status === "Published") {
		conditions.push(
			and(isNotNull(combos.publishedAt), isNull(combos.deletedAt))
		);
	} else if (input.status === "Unpublished") {
		conditions.push(and(isNull(combos.publishedAt), isNull(combos.deletedAt)));
	} else if (input.status === "Deleted") {
		conditions.push(isNotNull(combos.deletedAt));
	}

	if (input.query) {
		const searchPattern = `%${input.query}%`;
		conditions.push(ilike(combos.name, searchPattern));
	}

	const validConditions = conditions.filter(
		(c): c is SQLWrapper => c !== undefined
	);
	const whereClause =
		validConditions.length > 0 ? and(...validConditions) : undefined;

	const DEFAULT_ADMIN_LIMIT = 20;

	const [totalResult, combosResult] = await Promise.all([
		db.select({ count: count() }).from(combos).where(whereClause),
		db.query.combos.findMany({
			where: whereClause,
			columns: {
				id: true,
				name: true,
				level: true,
				slug: true,
				publishedAt: true,
				deletedAt: true,
				updatedAt: true,
			},
			with: {
				comboMoves: {
					columns: {
						id: true,
					},
				},
			},
			orderBy: [desc(combos.updatedAt)],
			limit: input.limit ?? DEFAULT_ADMIN_LIMIT,
			offset: input.offset ?? 0,
		}),
	]);

	const mappedCombos = combosResult.map((combo) => {
		let status: "Published" | "Unpublished" | "Deleted";
		if (combo.deletedAt) {
			status = "Deleted";
		} else if (combo.publishedAt) {
			status = "Published";
		} else {
			status = "Unpublished";
		}

		return {
			id: combo.id,
			name: combo.name,
			level: combo.level,
			slug: combo.slug,
			status,
			movesCount: combo.comboMoves.length,
			updatedAt: combo.updatedAt,
		};
	});

	return {
		combos: mappedCombos,
		total: totalResult[0]?.count ?? 0,
	};
}

function generateSlug(name: string): string {
	return name
		.toLowerCase()
		.trim()
		.normalize("NFD")
		.replaceAll(/[\u0300-\u036f]/g, "")
		.replaceAll(/[^a-z0-9\s-]/g, "")
		.replaceAll(/\s+/g, "-")
		.replaceAll(/-+/g, "-")
		.replace(/^-|-$/g, "");
}

export async function createCombo(data: {
	name: string;
	level: "Beginner" | "Intermediate" | "Advanced";
	moveIds: string[];
}) {
	const comboId = crypto.randomUUID();
	const slug = generateSlug(data.name);

	await db.transaction(async (tx) => {
		await tx.insert(combos).values({
			id: comboId,
			name: data.name,
			level: data.level,
			slug,
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		const comboMovesToInsert = data.moveIds.map((moveId, index) => ({
			comboId,
			moveId,
			orderIndex: index + 1,
			createdAt: new Date(),
		}));

		await tx.insert(comboMoves).values(comboMovesToInsert);
	});

	return { id: comboId, slug };
}

export async function updateCombo(data: {
	id: string;
	name: string;
	level: "Beginner" | "Intermediate" | "Advanced";
	moveIds: string[];
}) {
	const slug = generateSlug(data.name);

	await db.transaction(async (tx) => {
		await tx
			.update(combos)
			.set({
				name: data.name,
				level: data.level,
				slug,
				updatedAt: new Date(),
			})
			.where(eq(combos.id, data.id));

		await tx.delete(comboMoves).where(eq(comboMoves.comboId, data.id));

		const comboMovesToInsert = data.moveIds.map((moveId, index) => ({
			comboId: data.id,
			moveId,
			orderIndex: index + 1,
			createdAt: new Date(),
		}));

		await tx.insert(comboMoves).values(comboMovesToInsert);
	});

	return { id: data.id, slug };
}

export async function publishCombo(comboId: string) {
	const combo = await db
		.update(combos)
		.set({ publishedAt: new Date() })
		.where(eq(combos.id, comboId))
		.returning({ publishedAt: combos.publishedAt });

	if (!combo[0]) {
		return null;
	}

	return combo[0];
}

export async function unpublishCombo(comboId: string) {
	await db
		.update(combos)
		.set({ publishedAt: null })
		.where(eq(combos.id, comboId));
}

export async function deleteCombo(comboId: string) {
	await db
		.update(combos)
		.set({ deletedAt: new Date() })
		.where(eq(combos.id, comboId));
}

export async function restoreCombo(comboId: string) {
	await db
		.update(combos)
		.set({ deletedAt: null })
		.where(eq(combos.id, comboId));
}

export async function getComboByIdForAdmin(comboId: string) {
	const combo = await db.query.combos.findFirst({
		where: and(eq(combos.id, comboId), isNull(combos.deletedAt)),
		columns: {
			id: true,
			name: true,
			level: true,
			slug: true,
		},
		with: {
			comboMoves: {
				columns: {
					moveId: true,
					orderIndex: true,
				},
				orderBy: [asc(comboMoves.orderIndex)],
			},
		},
	});

	if (!combo) {
		return null;
	}

	return {
		id: combo.id,
		name: combo.name,
		level: combo.level,
		slug: combo.slug,
		moveIds: combo.comboMoves.map((cm) => cm.moveId),
	};
}

export async function getPublishedMovesForComboSelection() {
	return await db
		.select({
			id: moves.id,
			name: moves.name,
			level: moves.level,
			imageUrl: moves.imageUrl,
		})
		.from(moves)
		.where(and(isNotNull(moves.publishedAt), isNull(moves.deletedAt)))
		.orderBy(asc(moves.name));
}

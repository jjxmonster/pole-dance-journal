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
import { getSupabaseServerClient } from "@/integrations/supabase/server";
import { CACHE_CONTROL_SECONDS } from "@/utils/constants";
import { db } from "../db";
import { moves, moveTranslations, steps, stepTranslations } from "../db/schema";
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

export async function getMoveBySlugWithTranslations(
	slug: string,
	language: "en" | "pl" = "pl"
) {
	const move = await db.query.moves.findFirst({
		where: and(
			eq(sql`lower(${moves.slug})`, slug.toLowerCase()),
			isNotNull(moves.publishedAt),
			isNull(moves.deletedAt)
		),
		columns: {
			id: true,
			slug: true,
			imageUrl: true,
		},
		with: {
			translations: {
				where: eq(moveTranslations.language, language),
				columns: {
					moveId: true,
					name: true,
					description: true,
					level: true,
				},
				limit: 1,
			},
			steps: {
				columns: {
					orderIndex: true,
				},
				orderBy: [asc(steps.orderIndex)],
				with: {
					translations: {
						where: eq(stepTranslations.language, language),
						columns: {
							title: true,
							description: true,
						},
						limit: 1,
					},
				},
			},
		},
	});

	let usedFallback = false;

	if (!move?.translations[0] && language !== "pl") {
		const fallbackMove = await db.query.moves.findFirst({
			where: and(
				eq(sql`lower(${moves.slug})`, slug.toLowerCase()),
				isNotNull(moves.publishedAt),
				isNull(moves.deletedAt)
			),
			columns: {
				id: true,
				slug: true,
				imageUrl: true,
			},
			with: {
				translations: {
					where: eq(moveTranslations.language, "pl"),
					columns: {
						moveId: true,
						name: true,
						description: true,
						level: true,
					},
					limit: 1,
				},
				steps: {
					columns: {
						orderIndex: true,
					},
					orderBy: [asc(steps.orderIndex)],
					with: {
						translations: {
							where: eq(stepTranslations.language, "pl"),
							columns: {
								title: true,
								description: true,
							},
							limit: 1,
						},
					},
				},
			},
		});

		if (fallbackMove?.translations[0]) {
			usedFallback = true;
			const translation = fallbackMove.translations[0];
			return {
				id: translation.moveId,
				name: translation.name,
				description: translation.description,
				level: translation.level,
				slug: fallbackMove.slug,
				imageUrl: fallbackMove.imageUrl,
				steps: fallbackMove.steps.map((step) => ({
					orderIndex: step.orderIndex,
					title: step.translations[0]?.title ?? "",
					description: step.translations[0]?.description ?? "",
				})),
				translationFallback: usedFallback,
			};
		}

		return null;
	}

	if (!move?.translations[0]) {
		return null;
	}

	const translation = move.translations[0];
	return {
		id: translation.moveId,
		name: translation.name,
		description: translation.description,
		level: translation.level,
		slug: move.slug,
		imageUrl: move.imageUrl,
		steps: move.steps.map((step) => ({
			orderIndex: step.orderIndex,
			title: step.translations[0]?.title ?? "",
			description: step.translations[0]?.description ?? "",
		})),
		translationFallback: usedFallback,
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

export async function getRandomPublishedMove() {
	const result = await db
		.select({
			slug: moves.slug,
		})
		.from(moves)
		.where(and(isNotNull(moves.publishedAt), isNull(moves.deletedAt)))
		.orderBy(sql`random()`)
		.limit(1);

	return result[0]?.slug ?? null;
}

export async function getRandomMovesForWheel(limit = 10) {
	const result = await db
		.select({
			id: moves.id,
			name: moves.name,
			slug: moves.slug,
			level: moves.level,
			imageUrl: moves.imageUrl,
		})
		.from(moves)
		.where(and(isNotNull(moves.publishedAt), isNull(moves.deletedAt)))
		.orderBy(sql`random()`)
		.limit(limit);

	return result;
}

export async function getMovesForUser(
	userId: string,
	level?: "Beginner" | "Intermediate" | "Advanced",
	status?: "WANT" | "ALMOST" | "DONE"
) {
	const { userMoveStatuses } = await import("../db/schema");

	const conditions = [eq(userMoveStatuses.userId, userId)];

	if (level) {
		conditions.push(eq(moves.level, level));
	}

	if (status) {
		conditions.push(eq(userMoveStatuses.status, status));
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

export async function createMove(data: {
	name: string;
	descriptionEn: string;
	descriptionPl: string;
	level: "Beginner" | "Intermediate" | "Advanced";
	slug: string;
	steps: Array<{
		titleEn: string;
		titlePl: string;
		descriptionEn: string;
		descriptionPl: string;
	}>;
}) {
	const moveId = crypto.randomUUID();

	const stepsWithIds = data.steps.map((step) => ({
		id: crypto.randomUUID(),
		titleEn: step.titleEn,
		titlePl: step.titlePl,
		descriptionEn: step.descriptionEn,
		descriptionPl: step.descriptionPl,
	}));

	await db.transaction(async (tx) => {
		await tx.insert(moves).values({
			id: moveId,
			name: data.name,
			description: data.descriptionPl,
			level: data.level,
			slug: data.slug,
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		await tx.insert(moveTranslations).values([
			{
				moveId,
				language: "en",
				name: data.name,
				description: data.descriptionEn,
				level: data.level,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				moveId,
				language: "pl",
				name: data.name,
				description: data.descriptionPl,
				level: data.level,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		]);

		const stepsToInsert = stepsWithIds.map((step, index) => ({
			id: step.id,
			moveId,
			orderIndex: index + 1,
			title: step.titlePl,
			description: step.descriptionPl,
			createdAt: new Date(),
			updatedAt: new Date(),
		}));

		await tx.insert(steps).values(stepsToInsert);

		const stepTranslationsToInsert = stepsWithIds.flatMap((step) => [
			{
				stepId: step.id,
				language: "en" as const,
				title: step.titleEn,
				description: step.descriptionEn,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				stepId: step.id,
				language: "pl" as const,
				title: step.titlePl,
				description: step.descriptionPl,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		]);

		await tx.insert(stepTranslations).values(stepTranslationsToInsert);
	});

	return { id: moveId, slug: data.slug };
}

export async function acceptMoveImage(moveId: string, imageUrl: string) {
	try {
		const response = await fetch(imageUrl);
		if (!response.ok) {
			throw new Error(`Failed to fetch image: ${response.statusText}`);
		}

		const buffer = await response.arrayBuffer();
		const filename = `moves/${moveId}/image.jpg`;

		const supabase = getSupabaseServerClient();
		const { data, error } = await supabase.storage
			.from("moves-images")
			.upload(filename, buffer, {
				cacheControl: CACHE_CONTROL_SECONDS.toString(),
				upsert: true,
				contentType: "image/jpeg",
			});

		if (error) {
			throw new Error(`Storage upload failed: ${error.message}`);
		}

		if (!data) {
			throw new Error("No data returned from storage upload");
		}

		const { data: publicUrlData } = supabase.storage
			.from("moves-images")
			.getPublicUrl(filename);

		if (!publicUrlData?.publicUrl) {
			throw new Error("Failed to get public URL for image");
		}

		await db
			.update(moves)
			.set({ imageUrl: publicUrlData.publicUrl })
			.where(eq(moves.id, moveId));
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Unknown error occurred";
		throw new Error(`Failed to accept move image: ${message}`);
	}
}

export async function updateMove(data: {
	id: string;
	name: string;
	descriptionEn: string;
	descriptionPl: string;
	level: "Beginner" | "Intermediate" | "Advanced";
	slug: string;
	steps: Array<{
		titleEn: string;
		titlePl: string;
		descriptionEn: string;
		descriptionPl: string;
	}>;
}) {
	const stepsWithIds = data.steps.map((step) => ({
		id: crypto.randomUUID(),
		titleEn: step.titleEn,
		titlePl: step.titlePl,
		descriptionEn: step.descriptionEn,
		descriptionPl: step.descriptionPl,
	}));

	await db.transaction(async (tx) => {
		await tx
			.update(moves)
			.set({
				name: data.name,
				description: data.descriptionPl,
				level: data.level,
				slug: data.slug,
				updatedAt: new Date(),
			})
			.where(eq(moves.id, data.id));

		await tx
			.update(moveTranslations)
			.set({
				name: data.name,
				description: data.descriptionEn,
				level: data.level,
				updatedAt: new Date(),
			})
			.where(
				and(
					eq(moveTranslations.moveId, data.id),
					eq(moveTranslations.language, "en")
				)
			);

		await tx
			.update(moveTranslations)
			.set({
				name: data.name,
				description: data.descriptionPl,
				level: data.level,
				updatedAt: new Date(),
			})
			.where(
				and(
					eq(moveTranslations.moveId, data.id),
					eq(moveTranslations.language, "pl")
				)
			);

		await tx.delete(steps).where(eq(steps.moveId, data.id));

		const stepsToInsert = stepsWithIds.map((step, index) => ({
			id: step.id,
			moveId: data.id,
			orderIndex: index + 1,
			title: step.titlePl,
			description: step.descriptionPl,
			createdAt: new Date(),
			updatedAt: new Date(),
		}));

		await tx.insert(steps).values(stepsToInsert);

		const stepTranslationsToInsert = stepsWithIds.flatMap((step) => [
			{
				stepId: step.id,
				language: "en" as const,
				title: step.titleEn,
				description: step.descriptionEn,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				stepId: step.id,
				language: "pl" as const,
				title: step.titlePl,
				description: step.descriptionPl,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		]);

		await tx.insert(stepTranslations).values(stepTranslationsToInsert);
	});

	return { id: data.id, slug: data.slug };
}

export async function getMoveByIdForAdmin(moveId: string) {
	const move = await db.query.moves.findFirst({
		where: and(eq(moves.id, moveId), isNull(moves.deletedAt)),
		columns: {
			id: true,
			name: true,
			level: true,
			slug: true,
			imageUrl: true,
		},
		with: {
			translations: {
				columns: {
					language: true,
					description: true,
				},
			},
			steps: {
				columns: {
					orderIndex: true,
				},
				orderBy: [asc(steps.orderIndex)],
				with: {
					translations: {
						columns: {
							language: true,
							title: true,
							description: true,
						},
					},
				},
			},
		},
	});

	if (!move) {
		return null;
	}

	const enTranslation = move.translations.find((t) => t.language === "en");
	const plTranslation = move.translations.find((t) => t.language === "pl");

	return {
		id: move.id,
		name: move.name,
		descriptionEn: enTranslation?.description ?? "",
		descriptionPl: plTranslation?.description ?? "",
		level: move.level,
		slug: move.slug,
		imageUrl: move.imageUrl,
		steps: move.steps.map((step) => {
			const enStepTranslation = step.translations.find(
				(t) => t.language === "en"
			);
			const plStepTranslation = step.translations.find(
				(t) => t.language === "pl"
			);
			return {
				orderIndex: step.orderIndex,
				titleEn: enStepTranslation?.title ?? "",
				titlePl: plStepTranslation?.title ?? "",
				descriptionEn: enStepTranslation?.description ?? "",
				descriptionPl: plStepTranslation?.description ?? "",
			};
		}),
	};
}

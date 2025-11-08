import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { moveTranslations, stepTranslations } from "../db/schema";

type Language = "en" | "pl";

export async function getMoveTranslation(
	moveId: string,
	language: Language = "pl"
) {
	return await db.query.moveTranslations.findFirst({
		where: and(
			eq(moveTranslations.moveId, moveId),
			eq(moveTranslations.language, language)
		),
	});
}

export async function getMoveWithTranslation(
	moveId: string,
	language: Language = "pl"
) {
	return await db.query.moves.findFirst({
		where: eq(moveTranslations.moveId, moveId),
		with: {
			translations: {
				where: eq(moveTranslations.language, language),
				limit: 1,
			},
		},
	});
}

export async function updateMoveTranslation(
	moveId: string,
	language: Language,
	data: {
		name?: string;
		description?: string;
		slug?: string;
		level?: "Beginner" | "Intermediate" | "Advanced";
	}
) {
	return await db
		.update(moveTranslations)
		.set({
			...data,
			updatedAt: new Date(),
		})
		.where(
			and(
				eq(moveTranslations.moveId, moveId),
				eq(moveTranslations.language, language)
			)
		)
		.returning();
}

export async function createMoveTranslation(
	moveId: string,
	language: Language,
	data: {
		name: string;
		description: string;
		slug: string;
		level: "Beginner" | "Intermediate" | "Advanced";
	}
) {
	return await db
		.insert(moveTranslations)
		.values({
			moveId,
			language,
			...data,
		})
		.returning();
}

export async function getStepTranslation(
	stepId: string,
	language: Language = "pl"
) {
	return await db.query.stepTranslations.findFirst({
		where: and(
			eq(stepTranslations.stepId, stepId),
			eq(stepTranslations.language, language)
		),
	});
}

export async function getStepWithTranslation(
	stepId: string,
	language: Language = "pl"
) {
	return await db.query.steps.findFirst({
		where: eq(stepTranslations.stepId, stepId),
		with: {
			translations: {
				where: eq(stepTranslations.language, language),
				limit: 1,
			},
		},
	});
}

export async function updateStepTranslation(
	stepId: string,
	language: Language,
	data: {
		title?: string;
		description?: string;
	}
) {
	return await db
		.update(stepTranslations)
		.set({
			...data,
			updatedAt: new Date(),
		})
		.where(
			and(
				eq(stepTranslations.stepId, stepId),
				eq(stepTranslations.language, language)
			)
		)
		.returning();
}

export async function createStepTranslation(
	stepId: string,
	language: Language,
	data: {
		title: string;
		description: string;
	}
) {
	return await db
		.insert(stepTranslations)
		.values({
			stepId,
			language,
			...data,
		})
		.returning();
}

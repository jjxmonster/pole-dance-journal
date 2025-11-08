/** biome-ignore-all lint/suspicious/noConsole: run in console */
import { db } from "@/db";
import { moves, moveTranslations, steps, stepTranslations } from "@/db/schema";

type MigrationStatus = {
	success: boolean;
	message: string;
	movesMigrated: number;
	stepsMigrated: number;
	errors: string[];
};

async function migrateMoves(errors: string[]): Promise<number> {
	let movesMigrated = 0;
	console.log("Getting all moves...");
	const allMoves = await db
		.select({
			id: moves.id,
			name: moves.name,
			description: moves.description,
			slug: moves.slug,
			level: moves.level,
		})
		.from(moves);

	if (allMoves.length === 0) {
		return 0;
	}

	try {
		console.log("Mapping moves to move translation data...");
		const moveTranslationData = allMoves.map((move) => ({
			moveId: move.id,
			language: "pl" as const,
			name: move.name,
			description: move.description,
			slug: move.slug,
			level: move.level,
		}));

		await db.insert(moveTranslations).values(moveTranslationData);
		movesMigrated = moveTranslationData.length;
	} catch (error) {
		console.error("Failed to migrate moves:", error);
		const errorMsg = error instanceof Error ? error.message : String(error);
		errors.push(`Failed to migrate moves: ${errorMsg}`);
	}

	return movesMigrated;
}

async function migrateSteps(errors: string[]): Promise<number> {
	let stepsMigrated = 0;
	const allSteps = await db
		.select({
			id: steps.id,
			title: steps.title,
			description: steps.description,
		})
		.from(steps);

	if (allSteps.length === 0) {
		return 0;
	}

	try {
		const stepTranslationData = allSteps.map((step) => ({
			stepId: step.id,
			language: "pl" as const,
			title: step.title,
			description: step.description,
		}));

		await db.insert(stepTranslations).values(stepTranslationData);
		stepsMigrated = stepTranslationData.length;
	} catch (error) {
		const errorMsg = error instanceof Error ? error.message : String(error);
		errors.push(`Failed to migrate steps: ${errorMsg}`);
	}

	return stepsMigrated;
}

/**
 * Migrates data from old schema (name/description/title in moves/steps tables)
 * to new translation tables with language = 'pl'
 *
 * This function is idempotent - it can be run multiple times safely
 */
export async function migrateToTranslations(): Promise<MigrationStatus> {
	const errors: string[] = [];

	try {
		const existingMoveTranslations = await db.query.moveTranslations
			.findMany({ limit: 1 })
			.catch(() => []);

		if (existingMoveTranslations.length > 0) {
			return {
				success: true,
				message: "Migration already completed. Move translations exist.",
				movesMigrated: 0,
				stepsMigrated: 0,
				errors: [],
			};
		}
		console.log("Migrating moves...");
		const movesMigrated = await migrateMoves(errors);
		console.log("Migrating steps...");
		const stepsMigrated = await migrateSteps(errors);

		return {
			success: errors.length === 0,
			message:
				errors.length === 0
					? "Migration completed successfully"
					: "Migration completed with errors",
			movesMigrated,
			stepsMigrated,
			errors,
		};
	} catch (error) {
		console.error("Failed to migrate to translations:", error);
		const errorMsg = error instanceof Error ? error.message : String(error);
		return {
			success: false,
			message: "Migration failed",
			movesMigrated: 0,
			stepsMigrated: 0,
			errors: [errorMsg],
		};
	}
}
const result = await migrateToTranslations();
console.log(result);

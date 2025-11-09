import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/env";
import {
	moveNotes,
	moveNotesRelations,
	moves,
	movesRelations,
	moveTranslations,
	moveTranslationsRelations,
	profiles,
	steps,
	stepsRelations,
	stepTranslations,
	stepTranslationsRelations,
	userMoveStatuses,
	userMoveStatusesRelations,
} from "./schema";

const client = postgres(env.POSTGRES_URL, {
	prepare: false,
});
export const db = drizzle({
	client,
	schema: {
		moves,
		movesRelations,
		moveNotes,
		moveNotesRelations,
		moveTranslations,
		moveTranslationsRelations,
		profiles,
		steps,
		stepsRelations,
		stepTranslations,
		stepTranslationsRelations,
		userMoveStatuses,
		userMoveStatusesRelations,
	},
});

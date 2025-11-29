import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/env";
import {
	moveNotes,
	moveNotesRelations,
	moves,
	movesRelations,
	moveTransitionReferences,
	moveTransitionReferencesRelations,
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
		moveTransitionReferences,
		moveTransitionReferencesRelations,
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

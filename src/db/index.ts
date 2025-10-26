import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/env";
import {
	moves,
	movesRelations,
	profiles,
	steps,
	stepsRelations,
	userMoveStatuses,
} from "./schema";

const client = postgres(env.POSTGRES_URL, {
	prepare: false,
});
export const db = drizzle({
	client,
	schema: {
		moves,
		movesRelations,
		profiles,
		steps,
		stepsRelations,
		userMoveStatuses,
	},
});

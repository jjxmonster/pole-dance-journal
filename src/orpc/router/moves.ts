import { ORPCError, os } from "@orpc/server";
import { getSupabaseServerClient } from "@/integrations/supabase/server";
import {
	getRandomMovesForWheel as fetchRandomMovesForWheel,
	getMoveBySlug,
	getMovesForUser,
	getRandomPublishedMove,
	listPublishedMoves,
} from "../../data-access/moves";
import { authMiddleware } from "../auth";
import {
	MoveGetBySlugInputSchema,
	MoveGetBySlugOutputSchema,
	MoveGetRandomForWheelInputSchema,
	MoveGetRandomForWheelOutputSchema,
	MoveGetRandomOutputSchema,
	MovesGetForUserInputSchema,
	MovesGetForUserOutputSchema,
	MovesListInputSchema,
	MovesListOutputSchema,
} from "../schema";

export const listMoves = os
	.input(MovesListInputSchema)
	.output(MovesListOutputSchema)
	.use(authMiddleware)
	.handler(async ({ input }) => {
		const result = await listPublishedMoves(input);
		return result;
	});

export const getBySlug = os
	.input(MoveGetBySlugInputSchema)
	.output(MoveGetBySlugOutputSchema)
	.use(authMiddleware)
	.handler(async ({ input }) => {
		const move = await getMoveBySlug(input.slug);
		if (!move) {
			throw new ORPCError("NOT_FOUND", {
				message: `Move with slug "${input.slug}" not found`,
			});
		}
		return move;
	});

export const getForUser = os
	.input(MovesGetForUserInputSchema)
	.output(MovesGetForUserOutputSchema)
	.use(authMiddleware)
	.handler(async ({ input }) => {
		const supabase = getSupabaseServerClient();
		const data = await supabase.auth.getUser();

		if (!data.data.user) {
			throw new ORPCError("UNAUTHORIZED", {
				message: "You must be signed in to view your moves.",
			});
		}

		const userId = data.data.user.id;

		try {
			const moves = await getMovesForUser(userId, input.level);
			return { moves };
		} catch {
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Failed to get user moves",
			});
		}
	});

export const getRandomMove = os
	.output(MoveGetRandomOutputSchema)
	.use(authMiddleware)
	.handler(async () => {
		const slug = await getRandomPublishedMove();

		if (!slug) {
			throw new ORPCError("NOT_FOUND", {
				message: "No published moves available",
			});
		}

		return { slug };
	});

export const getRandomMovesForWheel = os
	.input(MoveGetRandomForWheelInputSchema)
	.output(MoveGetRandomForWheelOutputSchema)
	.use(authMiddleware)
	.handler(async ({ input }) => {
		const moves = await fetchRandomMovesForWheel(input.count);

		if (moves.length === 0) {
			throw new ORPCError("NOT_FOUND", {
				message: "No published moves available",
			});
		}

		return { moves };
	});

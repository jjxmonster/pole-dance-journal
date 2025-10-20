import { ORPCError, os } from "@orpc/server";
import {
	checkMoveExists,
	upsertUserMoveStatus,
} from "../../data-access/user-move-statuses";
import {
	UserMoveStatusSetInputSchema,
	UserMoveStatusSetOutputSchema,
} from "../schema";
import type { SupabaseClient } from "../types";

export const set = os
	.input(UserMoveStatusSetInputSchema)
	.output(UserMoveStatusSetOutputSchema)
	.handler(async ({ input, context }) => {
		const supabase = (context as Record<string, SupabaseClient>).supabase;

		const response = await supabase.auth.getSession();

		if (!response.data.session?.user) {
			throw new ORPCError("UNAUTHORIZED", {
				message: "You must be signed in to update move status.",
			});
		}

		const userId = response.data.session.user.id;

		const moveExists = await checkMoveExists(input.moveId);
		if (!moveExists) {
			throw new ORPCError("NOT_FOUND", {
				message: `Move with ID ${input.moveId} not found`,
			});
		}

		try {
			const result = await upsertUserMoveStatus({
				userId,
				moveId: input.moveId,
				status: input.status,
				note: input.note,
			});

			return {
				success: true as const,
				updatedAt: result.updatedAt,
			};
		} catch (_) {
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Failed to update user move status",
			});
		}
	});

import { ORPCError, os } from "@orpc/server";
import { getSupabaseServerClient } from "@/integrations/supabase/server";
import {
	checkMoveExists,
	getUserMoveStatus,
	upsertUserMoveStatus,
} from "../../data-access/user-move-statuses";
import {
	UserMoveStatusGetInputSchema,
	UserMoveStatusGetOutputSchema,
	UserMoveStatusSetInputSchema,
	UserMoveStatusSetOutputSchema,
} from "../schema";

export const get = os
	.input(UserMoveStatusGetInputSchema)
	.output(UserMoveStatusGetOutputSchema)
	.handler(async ({ input }) => {
		const supabase = getSupabaseServerClient();
		const data = await supabase.auth.getUser();

		if (!data.data.user) {
			throw new ORPCError("UNAUTHORIZED", {
				message: "You must be signed in to get move status.",
			});
		}

		const userId = data.data.user.id;

		const moveExists = await checkMoveExists(input.moveId);
		if (!moveExists) {
			throw new ORPCError("NOT_FOUND", {
				message: `Move with ID ${input.moveId} not found`,
			});
		}

		try {
			const result = await getUserMoveStatus({
				userId,
				moveId: input.moveId,
			});

			return result;
		} catch (_) {
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Failed to get user move status",
			});
		}
	});

export const set = os
	.input(UserMoveStatusSetInputSchema)
	.output(UserMoveStatusSetOutputSchema)
	.handler(async ({ input }) => {
		const supabase = getSupabaseServerClient();

		const data = await supabase.auth.getUser();

		if (!data.data.user) {
			throw new ORPCError("UNAUTHORIZED", {
				message: "You must be signed in to update move status.",
			});
		}

		const userId = data.data.user.id;

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

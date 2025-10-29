import { ORPCError, os } from "@orpc/server";
import {
	checkMoveExists,
	getUserMoveStatus,
	upsertUserMoveStatus,
} from "../../data-access/user-move-statuses";
import { authMiddleware } from "../auth";
import {
	UserMoveStatusGetInputSchema,
	UserMoveStatusGetOutputSchema,
	UserMoveStatusSetInputSchema,
	UserMoveStatusSetOutputSchema,
} from "../schema";

export const get = os
	.input(UserMoveStatusGetInputSchema)
	.output(UserMoveStatusGetOutputSchema)
	.use(authMiddleware)
	.handler(async ({ input, context }) => {
		const userId = context.user.id;

		const moveExists = await checkMoveExists(input.moveId);
		if (!moveExists) {
			throw new ORPCError("NOT_FOUND", {
				message: `Move with ID ${input.moveId} not found`,
			});
		}

		try {
			const result = await getUserMoveStatus(userId, input.moveId);

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
	.use(authMiddleware)
	.handler(async ({ input, context }) => {
		const userId = context.user.id;

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

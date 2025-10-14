import { ORPCError, os } from "@orpc/server";
import { SAMPLE_USER } from "@/utils/constants";
import {
	checkMoveExists,
	upsertUserMoveStatus,
} from "../../data-access/user-move-statuses";
import {
	UserMoveStatusSetInputSchema,
	UserMoveStatusSetOutputSchema,
} from "../schema";

export const set = os
	.input(UserMoveStatusSetInputSchema)
	.output(UserMoveStatusSetOutputSchema)
	.handler(async ({ input }) => {
		const moveExists = await checkMoveExists(input.moveId);
		if (!moveExists) {
			throw new ORPCError("NOT_FOUND", {
				message: `Move with ID ${input.moveId} not found`,
			});
		}

		try {
			const result = await upsertUserMoveStatus({
				userId: SAMPLE_USER,
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

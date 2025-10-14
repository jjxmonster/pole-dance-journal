import { os } from "@orpc/server";
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
			throw new Error("NOT_FOUND");
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
			throw new Error("INTERNAL_SERVER_ERROR");
		}
	});

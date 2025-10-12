import { os } from "@orpc/server";
import { listPublishedMoves } from "../../data-access/moves";
import { MovesListInputSchema, MovesListOutputSchema } from "../schema";

export const listMoves = os
	.input(MovesListInputSchema)
	.output(MovesListOutputSchema)
	.handler(async ({ input }) => {
		const result = await listPublishedMoves(input);
		return result;
	});

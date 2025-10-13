import { os } from "@orpc/server";
import { getMoveBySlug, listPublishedMoves } from "../../data-access/moves";
import {
	MoveGetBySlugInputSchema,
	MoveGetBySlugOutputSchema,
	MovesListInputSchema,
	MovesListOutputSchema,
} from "../schema";

export const listMoves = os
	.input(MovesListInputSchema)
	.output(MovesListOutputSchema)
	.handler(async ({ input }) => {
		const result = await listPublishedMoves(input);
		return result;
	});

export const getBySlug = os
	.input(MoveGetBySlugInputSchema)
	.output(MoveGetBySlugOutputSchema.nullable())
	.handler(async ({ input }) => {
		const move = await getMoveBySlug(input.slug);
		return move;
	});

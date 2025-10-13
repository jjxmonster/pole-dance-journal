import { z } from "zod";
import { moveLevelEnum } from "../db/schema";

export const TodoSchema = z.object({
	id: z.number().int().min(1),
	name: z.string(),
});

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const DEFAULT_OFFSET = 0;

export const MovesListInputSchema = z.object({
	limit: z
		.number()
		.int()
		.positive()
		.max(MAX_LIMIT)
		.optional()
		.default(DEFAULT_LIMIT),
	offset: z.number().int().nonnegative().optional().default(DEFAULT_OFFSET),
	level: z.enum(moveLevelEnum.enumValues).optional(),
	query: z.string().trim().min(1).optional(),
});

export const MoveListItemSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	description: z.string(),
	level: z.enum(moveLevelEnum.enumValues),
	slug: z.string(),
	imageUrl: z.string().nullable(),
});

export const MovesListOutputSchema = z.object({
	moves: z.array(MoveListItemSchema),
	total: z.number().int().nonnegative(),
});

export const MoveGetBySlugInputSchema = z.object({
	slug: z.string().trim().min(1, "Slug is required"),
});

export const MoveStepSchema = z.object({
	orderIndex: z.number().int().positive(),
	title: z.string(),
	description: z.string(),
});

export const MoveDetailSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	description: z.string(),
	level: z.enum(moveLevelEnum.enumValues),
	slug: z.string(),
	imageUrl: z.string().nullable(),
	steps: z.array(MoveStepSchema),
});

export const MoveGetBySlugOutputSchema = MoveDetailSchema;

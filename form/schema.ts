import { z } from "zod";
import {
	COMBO_DESCRIPTION_MAX_LENGTH,
	COMBO_DESCRIPTION_MIN_LENGTH,
	COMBO_MOVES_MAX_COUNT,
	COMBO_MOVES_MIN_COUNT,
	COMBO_NAME_MAX_LENGTH,
	COMBO_NAME_MIN_LENGTH,
	MAX_TRANSITION_REFERENCES_COUNT,
	MOVE_DESCRIPTION_MAX_LENGTH,
	MOVE_DESCRIPTION_MIN_LENGTH,
	MOVE_NAME_MAX_LENGTH,
	MOVE_NAME_MIN_LENGTH,
	MOVE_STEP_DESCRIPTION_MAX_LENGTH,
	MOVE_STEP_DESCRIPTION_MIN_LENGTH,
	MOVE_STEP_TITLE_MAX_LENGTH,
	MOVE_STEP_TITLE_MIN_LENGTH,
	MOVE_STEPS_MAX_COUNT,
	MOVE_STEPS_MIN_COUNT,
} from "@/utils/constants";

export const comboFormSchema = z.object({
	name: z
		.string()
		.min(
			COMBO_NAME_MIN_LENGTH,
			`Name must be at least ${COMBO_NAME_MIN_LENGTH} characters`
		)
		.max(
			COMBO_NAME_MAX_LENGTH,
			`Name must be at most ${COMBO_NAME_MAX_LENGTH} characters`
		),
	descriptionEn: z
		.string()
		.min(
			COMBO_DESCRIPTION_MIN_LENGTH,
			`English description must be at least ${COMBO_DESCRIPTION_MIN_LENGTH} characters`
		)
		.max(
			COMBO_DESCRIPTION_MAX_LENGTH,
			`English description must be at most ${COMBO_DESCRIPTION_MAX_LENGTH} characters`
		),
	descriptionPl: z
		.string()
		.min(
			COMBO_DESCRIPTION_MIN_LENGTH,
			`Polish description must be at least ${COMBO_DESCRIPTION_MIN_LENGTH} characters`
		)
		.max(
			COMBO_DESCRIPTION_MAX_LENGTH,
			`Polish description must be at most ${COMBO_DESCRIPTION_MAX_LENGTH} characters`
		),
	level: z.enum(["Beginner", "Intermediate", "Advanced"]),
	moveIds: z
		.array(z.string().uuid("Invalid move ID"))
		.min(
			COMBO_MOVES_MIN_COUNT,
			`At least ${COMBO_MOVES_MIN_COUNT} moves are required`
		)
		.max(
			COMBO_MOVES_MAX_COUNT,
			`Maximum ${COMBO_MOVES_MAX_COUNT} moves allowed`
		),
});

export type ComboFormValues = z.infer<typeof comboFormSchema>;

export const moveStepSchema = z.object({
	id: z.string().optional(),
	titleEn: z
		.string()
		.min(
			MOVE_STEP_TITLE_MIN_LENGTH,
			`English step title must be at least ${MOVE_STEP_TITLE_MIN_LENGTH} characters`
		)
		.max(
			MOVE_STEP_TITLE_MAX_LENGTH,
			`English step title must be at most ${MOVE_STEP_TITLE_MAX_LENGTH} characters`
		),
	titlePl: z
		.string()
		.min(
			MOVE_STEP_TITLE_MIN_LENGTH,
			`Polish step title must be at least ${MOVE_STEP_TITLE_MIN_LENGTH} characters`
		)
		.max(
			MOVE_STEP_TITLE_MAX_LENGTH,
			`Polish step title must be at most ${MOVE_STEP_TITLE_MAX_LENGTH} characters`
		),
	descriptionEn: z
		.string()
		.min(
			MOVE_STEP_DESCRIPTION_MIN_LENGTH,
			`English step description must be at least ${MOVE_STEP_DESCRIPTION_MIN_LENGTH} characters`
		)
		.max(
			MOVE_STEP_DESCRIPTION_MAX_LENGTH,
			`English step description must be at most ${MOVE_STEP_DESCRIPTION_MAX_LENGTH} characters`
		),
	descriptionPl: z
		.string()
		.min(
			MOVE_STEP_DESCRIPTION_MIN_LENGTH,
			`Polish step description must be at least ${MOVE_STEP_DESCRIPTION_MIN_LENGTH} characters`
		)
		.max(
			MOVE_STEP_DESCRIPTION_MAX_LENGTH,
			`Polish step description must be at most ${MOVE_STEP_DESCRIPTION_MAX_LENGTH} characters`
		),
});

export const moveFormSchema = z.object({
	name: z
		.string()
		.min(
			MOVE_NAME_MIN_LENGTH,
			`Name must be at least ${MOVE_NAME_MIN_LENGTH} characters`
		)
		.max(
			MOVE_NAME_MAX_LENGTH,
			`Name must be at most ${MOVE_NAME_MAX_LENGTH} characters`
		),
	descriptionEn: z
		.string()
		.min(
			MOVE_DESCRIPTION_MIN_LENGTH,
			`English description must be at least ${MOVE_DESCRIPTION_MIN_LENGTH} characters`
		)
		.max(
			MOVE_DESCRIPTION_MAX_LENGTH,
			`English description must be at most ${MOVE_DESCRIPTION_MAX_LENGTH} characters`
		),
	descriptionPl: z
		.string()
		.min(
			MOVE_DESCRIPTION_MIN_LENGTH,
			`Polish description must be at least ${MOVE_DESCRIPTION_MIN_LENGTH} characters`
		)
		.max(
			MOVE_DESCRIPTION_MAX_LENGTH,
			`Polish description must be at most ${MOVE_DESCRIPTION_MAX_LENGTH} characters`
		),
	level: z.enum(["Beginner", "Intermediate", "Advanced"]),
	steps: z
		.array(moveStepSchema)
		.min(
			MOVE_STEPS_MIN_COUNT,
			`At least ${MOVE_STEPS_MIN_COUNT} steps are required`
		)
		.max(MOVE_STEPS_MAX_COUNT, `Maximum ${MOVE_STEPS_MAX_COUNT} steps allowed`),
});

export type MoveFormValues = z.infer<typeof moveFormSchema>;
export type MoveStepValues = z.infer<typeof moveStepSchema>;

export const editMoveFormSchema = moveFormSchema.extend({
	id: z.string().uuid(),
	transitionReferences: z
		.array(z.string().uuid("Invalid move ID"))
		.max(
			MAX_TRANSITION_REFERENCES_COUNT,
			`Maximum ${MAX_TRANSITION_REFERENCES_COUNT} transition references allowed`
		),
});

export type EditMoveFormValues = z.infer<typeof editMoveFormSchema>;

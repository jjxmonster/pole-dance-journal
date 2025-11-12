import { z } from "zod";
import { moveLevelEnum, moveStatusEnum } from "../db/schema";
import {
	ALLOWED_MIME_TYPES,
	MAX_FILE_SIZE,
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
	NOTE_MAX_LENGTH,
} from "../utils/constants";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const DEFAULT_OFFSET = 0;

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 72;

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
	level: z.enum(moveLevelEnum.enumValues),
	slug: z.string(),
	imageUrl: z.string().nullable(),
});

export const MovesListOutputSchema = z.object({
	moves: z.array(MoveListItemSchema),
	total: z.number().int().nonnegative(),
});

export const MovesListTrialOutputSchema = MovesListOutputSchema;

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
	translationFallback: z.boolean().optional(),
});

export const MoveGetBySlugOutputSchema = MoveDetailSchema;

export const MoveGetRandomOutputSchema = z.object({
	slug: z.string(),
});

const WHEEL_MIN_SEGMENTS = 6;
const WHEEL_MAX_SEGMENTS = 12;
const WHEEL_DEFAULT_SEGMENTS = 10;

export const WheelMoveItemSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	slug: z.string(),
	level: z.enum(moveLevelEnum.enumValues),
	imageUrl: z.string().nullable(),
});

export const MoveGetRandomForWheelInputSchema = z.object({
	count: z
		.number()
		.int()
		.min(WHEEL_MIN_SEGMENTS)
		.max(WHEEL_MAX_SEGMENTS)
		.optional()
		.default(WHEEL_DEFAULT_SEGMENTS),
});

export const MoveGetRandomForWheelOutputSchema = z.object({
	moves: z.array(WheelMoveItemSchema),
});

export const MovesGetForUserInputSchema = z.object({
	level: z.enum(moveLevelEnum.enumValues).optional(),
	status: z.enum(moveStatusEnum.enumValues).optional(),
});

export const MyMoveItemSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	level: z.enum(moveLevelEnum.enumValues),
	slug: z.string(),
	imageUrl: z.string().nullable(),
	status: z.enum(moveStatusEnum.enumValues),
	note: z.string().nullable(),
	isDeleted: z.boolean(),
});

export const MovesGetForUserOutputSchema = z.object({
	moves: z.array(MyMoveItemSchema),
});

export const UserMoveStatusSetInputSchema = z.object({
	moveId: z.string().uuid(),
	status: z.enum(moveStatusEnum.enumValues),
	note: z.string().max(NOTE_MAX_LENGTH).optional(),
});

export const UserMoveStatusSetOutputSchema = z.object({
	success: z.literal(true),
	updatedAt: z.date(),
});

export const UserMoveStatusGetInputSchema = z.object({
	moveId: z.string().uuid(),
});

export const UserMoveStatusGetOutputSchema = z
	.object({
		status: z.enum(moveStatusEnum.enumValues),
		note: z.string().nullable(),
		updatedAt: z.date(),
	})
	.nullable();

// New schemas for move notes
export const MoveNoteSchema = z.object({
	id: z.string().uuid(),
	content: z.string(),
	createdAt: z.date(),
});

export const MoveNotesGetInputSchema = z.object({
	moveId: z.string().uuid(),
});

export const MoveNotesGetOutputSchema = z.array(MoveNoteSchema);

export const MoveNoteAddInputSchema = z.object({
	moveId: z.string().uuid(),
	content: z.string().min(1).max(NOTE_MAX_LENGTH),
});

export const MoveNoteAddOutputSchema = MoveNoteSchema;

export const MoveNoteDeleteInputSchema = z.object({
	noteId: z.string().uuid(),
});

export const MoveNoteDeleteOutputSchema = z.object({
	success: z.boolean(),
});

export const AuthEmailSchema = z.string().trim().email("Invalid email address");

export const PasswordSchema = z
	.string()
	.min(
		PASSWORD_MIN_LENGTH,
		`Password must be at least ${PASSWORD_MIN_LENGTH} characters`
	)
	.max(
		PASSWORD_MAX_LENGTH,
		`Password must be at most ${PASSWORD_MAX_LENGTH} characters`
	)
	.regex(
		/^(?=.*[A-Za-z])(?=.*\d).+$/,
		"Password must contain at least one letter and one number"
	);

export const AuthRegisterInputSchema = z.object({
	email: AuthEmailSchema,
	password: PasswordSchema,
});

export const AuthLoginInputSchema = z.object({
	email: AuthEmailSchema,
	password: z.string().min(1, "Password is required"),
});

export const AuthForgotPasswordInputSchema = z.object({
	email: AuthEmailSchema,
});

export const AuthResetPasswordInputSchema = z.object({
	accessToken: z.string().min(1, "Reset token is required"),
	newPassword: PasswordSchema,
});

export const AuthSuccessSchema = z.object({
	success: z.literal(true),
});

export const AuthSessionOutputSchema = z.object({
	userId: z.string().uuid().nullable(),
	email: z.string().email().nullable(),
	isAdmin: z.boolean().default(false),
	expiresAt: z.number().int().nullable(),
});

export const AuthOAuthProviderSchema = z.enum(["google"]);

export const AuthOAuthStartInputSchema = z.object({
	provider: AuthOAuthProviderSchema,
	redirectTo: z.string().url().optional(),
});

export const AuthOAuthStartOutputSchema = z.object({
	url: z.string().url(),
});

export const AuthOAuthCallbackInputSchema = z.object({
	code: z.string().min(1, "Authorization code is required"),
});

export const AuthDeleteAccountInputSchema = z.object({
	confirm: z.literal(true),
});

export const UploadReferenceImageInputSchema = z.object({
	file: z.instanceof(File),
	moveId: z.string().uuid().optional(),
});

export type UploadReferenceImageInput = z.infer<
	typeof UploadReferenceImageInputSchema
>;

export const UploadReferenceImageResponseSchema = z.object({
	referenceImageUrl: z.string().url(),
	uploadedAt: z.date(),
	expiresAt: z.date(),
});

export type UploadReferenceImageResponse = z.infer<
	typeof UploadReferenceImageResponseSchema
>;

export const UPLOAD_REFERENCE_IMAGE_VALIDATION = {
	MAX_FILE_SIZE,
	ALLOWED_MIME_TYPES,
} as const;

export const GENERATE_IMAGE_VALIDATION = {
	PROMPT_MIN_LENGTH: 10,
	PROMPT_MAX_LENGTH: 500,
	RATE_LIMIT_PER_24H: 5,
} as const;

export const GenerateImageInputSchema = z.object({
	moveId: z.string().uuid("Invalid move ID format"),
	referenceImageUrl: z
		.string()
		.url("Invalid URL format")
		.startsWith("https://", "Must use HTTPS"),
	sessionId: z.string().uuid("Invalid session ID format").optional(),
});

export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

export const GenerateImageOutputSchema = z.object({
	previewUrl: z.string().url(),
});

export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

export const AdminGetStatsOutputSchema = z.object({
	totalMoves: z.number().int().nonnegative(),
	publishedMoves: z.number().int().nonnegative(),
	unpublishedMoves: z.number().int().nonnegative(),
});

export type AdminGetStatsOutput = z.infer<typeof AdminGetStatsOutputSchema>;

export const AdminListMovesInputSchema = z.object({
	limit: z
		.number()
		.int()
		.positive()
		.max(MAX_LIMIT)
		.optional()
		.default(DEFAULT_LIMIT),
	offset: z.number().int().nonnegative().optional().default(DEFAULT_OFFSET),
	level: z.enum(moveLevelEnum.enumValues).optional(),
	status: z.enum(["Published", "Unpublished", "Deleted"]).optional(),
	query: z.string().trim().optional(),
});

export type AdminListMovesInput = z.infer<typeof AdminListMovesInputSchema>;

export const AdminMoveItemSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	level: z.enum(moveLevelEnum.enumValues),
	slug: z.string(),
	status: z.enum(["Published", "Unpublished", "Deleted"]),
	updatedAt: z.date(),
});

export type AdminMoveItem = z.infer<typeof AdminMoveItemSchema>;

export const AdminListMovesOutputSchema = z.object({
	moves: z.array(AdminMoveItemSchema),
	total: z.number().int().nonnegative(),
});

export type AdminListMovesOutput = z.infer<typeof AdminListMovesOutputSchema>;

export const AdminMoveIdInputSchema = z.object({
	id: z.string().uuid(),
});

export type AdminMoveIdInput = z.infer<typeof AdminMoveIdInputSchema>;

export const AdminPublishMoveOutputSchema = z.object({
	success: z.literal(true),
	publishedAt: z.date(),
});

export type AdminPublishMoveOutput = z.infer<
	typeof AdminPublishMoveOutputSchema
>;

export const AdminActionOutputSchema = z.object({
	success: z.literal(true),
});

export type AdminActionOutput = z.infer<typeof AdminActionOutputSchema>;

export const AdminCreateMoveInputSchema = z.object({
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
	level: z.enum(moveLevelEnum.enumValues),
	steps: z
		.array(
			z.object({
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
			})
		)
		.min(
			MOVE_STEPS_MIN_COUNT,
			`At least ${MOVE_STEPS_MIN_COUNT} steps are required`
		)
		.max(MOVE_STEPS_MAX_COUNT, `Maximum ${MOVE_STEPS_MAX_COUNT} steps allowed`),
});

export type AdminCreateMoveInput = z.infer<typeof AdminCreateMoveInputSchema>;

export const AdminCreateMoveOutputSchema = z.object({
	id: z.string().uuid(),
	slug: z.string(),
});

export type AdminCreateMoveOutput = z.infer<typeof AdminCreateMoveOutputSchema>;

export const AdminAcceptImageInputSchema = z.object({
	moveId: z.string().uuid(),
	imageUrl: z.string().url(),
});

export type AdminAcceptImageInput = z.infer<typeof AdminAcceptImageInputSchema>;

export const AdminAcceptImageOutputSchema = z.object({
	success: z.literal(true),
});

export type AdminAcceptImageOutput = z.infer<
	typeof AdminAcceptImageOutputSchema
>;

export const AdminEditMoveInputSchema = z.object({
	id: z.string().uuid(),
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
	level: z.enum(moveLevelEnum.enumValues),
	steps: z
		.array(
			z.object({
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
			})
		)
		.min(
			MOVE_STEPS_MIN_COUNT,
			`At least ${MOVE_STEPS_MIN_COUNT} steps are required`
		)
		.max(MOVE_STEPS_MAX_COUNT, `Maximum ${MOVE_STEPS_MAX_COUNT} steps allowed`),
});

export type AdminEditMoveInput = z.infer<typeof AdminEditMoveInputSchema>;

export const AdminEditMoveOutputSchema = z.object({
	id: z.string().uuid(),
	slug: z.string(),
});

export type AdminEditMoveOutput = z.infer<typeof AdminEditMoveOutputSchema>;

export const AdminGetMoveInputSchema = z.object({
	id: z.string().uuid(),
});

export type AdminGetMoveInput = z.infer<typeof AdminGetMoveInputSchema>;

export const AdminGetMoveOutputSchema = z.object({
	move: z.object({
		id: z.string().uuid(),
		name: z.string(),
		descriptionEn: z.string(),
		descriptionPl: z.string(),
		level: z.enum(moveLevelEnum.enumValues),
		slug: z.string(),
		imageUrl: z.string().nullable(),
		steps: z.array(
			z.object({
				orderIndex: z.number().int().positive(),
				titleEn: z.string(),
				titlePl: z.string(),
				descriptionEn: z.string(),
				descriptionPl: z.string(),
			})
		),
	}),
});

export type AdminGetMoveOutput = z.infer<typeof AdminGetMoveOutputSchema>;

import { z } from "zod";
import { moveLevelEnum, moveStatusEnum } from "../db/schema";
import {
	ALLOWED_MIME_TYPES,
	MAX_FILE_SIZE,
	NOTE_MAX_LENGTH,
} from "../utils/constants";

export const TodoSchema = z.object({
	id: z.number().int().min(1),
	name: z.string(),
});

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

export const MovesGetForUserInputSchema = z.object({
	level: z.enum(moveLevelEnum.enumValues).optional(),
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

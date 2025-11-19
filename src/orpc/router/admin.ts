import { ORPCError, os } from "@orpc/server";
import {
	deleteMove,
	getAdminStats,
	listAdminMoves,
	publishMove,
	restoreMove,
	unpublishMove,
} from "@/data-access/moves";
import { validateUserIsAdmin } from "@/data-access/profiles";
import { generateImageWithReplicate } from "@/services/image-generation";
import { uploadReferenceImage } from "@/services/image-upload";
import { GENERATE_IMAGE_PROMPT } from "@/utils/prompts";
import { validateInputFile } from "@/utils/utils";
import { authMiddleware } from "../auth";
import {
	AdminAcceptImageInputSchema,
	AdminAcceptImageOutputSchema,
	AdminActionOutputSchema,
	AdminCreateMoveInputSchema,
	AdminCreateMoveOutputSchema,
	AdminEditMoveInputSchema,
	AdminEditMoveOutputSchema,
	AdminGetMoveInputSchema,
	AdminGetMoveOutputSchema,
	AdminGetStatsOutputSchema,
	AdminListMovesInputSchema,
	AdminListMovesOutputSchema,
	AdminMoveIdInputSchema,
	AdminPublishMoveOutputSchema,
	GenerateImageInputSchema,
	GenerateImageOutputSchema,
	UploadReferenceImageInputSchema,
	UploadReferenceImageResponseSchema,
} from "../schema";

export const uploadReferenceImageProcedure = os
	.input(UploadReferenceImageInputSchema)
	.output(UploadReferenceImageResponseSchema)
	.use(authMiddleware)
	.handler(async ({ input, context }) => {
		const userId = context.user.id;

		const isAdmin = await validateUserIsAdmin(userId);
		if (!isAdmin) {
			throw new ORPCError("UNAUTHORIZED", {
				message: "User is not an administrator.",
			});
		}

		validateInputFile(input.file);

		try {
			const result = await uploadReferenceImage(input.file, userId);
			return result;
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred";

			if (
				errorMessage ===
				"Invalid file format. Only JPEG, PNG, and WebP are supported."
			) {
				throw new ORPCError("BAD_REQUEST", {
					message: errorMessage,
				});
			}

			if (errorMessage === "File size exceeds maximum limit of 10MB.") {
				throw new ORPCError("BAD_REQUEST", {
					message: errorMessage,
				});
			}

			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Failed to upload image to storage. Please try again.",
			});
		}
	});

async function performImageGeneration(
	prompt: string,
	referenceImageUrl: string
): Promise<{ imageUrl: string }> {
	let generatedImageUrl: string;
	try {
		generatedImageUrl = await generateImageWithReplicate(
			prompt,
			referenceImageUrl
		);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : "API error";
		throw new ORPCError("INTERNAL_SERVER_ERROR", {
			message: `Image generation service error: ${errorMessage}`,
		});
	}

	return { imageUrl: generatedImageUrl };
}

export const generateImageProcedure = os
	.input(GenerateImageInputSchema)
	.output(GenerateImageOutputSchema)
	.use(authMiddleware)
	.handler(async ({ input, context }) => {
		const userId = context.user.id;

		const isAdmin = await validateUserIsAdmin(userId);
		if (!isAdmin) {
			throw new ORPCError("UNAUTHORIZED", {
				message: "Admin access required",
			});
		}

		const finalPrompt = input.customPromptAddition
			? `${GENERATE_IMAGE_PROMPT}\n\nADDITIONAL REQUIREMENTS: ${input.customPromptAddition}`
			: GENERATE_IMAGE_PROMPT;

		const { imageUrl } = await performImageGeneration(
			finalPrompt,
			input.referenceImageUrl
		);
		return { previewUrl: imageUrl };
	});

export const getStatsProcedure = os
	.output(AdminGetStatsOutputSchema)
	.use(authMiddleware)
	.handler(async ({ context }) => {
		const userId = context.user.id;

		const isAdmin = await validateUserIsAdmin(userId);
		if (!isAdmin) {
			throw new ORPCError("UNAUTHORIZED", {
				message: "User is not an administrator.",
			});
		}

		const stats = await getAdminStats();
		return stats;
	});

export const listMovesProcedure = os
	.input(AdminListMovesInputSchema)
	.output(AdminListMovesOutputSchema)
	.use(authMiddleware)
	.handler(async ({ input, context }) => {
		const userId = context.user.id;

		const isAdmin = await validateUserIsAdmin(userId);
		if (!isAdmin) {
			throw new ORPCError("UNAUTHORIZED", {
				message: "User is not an administrator.",
			});
		}

		const result = await listAdminMoves(input);
		return result;
	});

export const publishMoveProcedure = os
	.input(AdminMoveIdInputSchema)
	.output(AdminPublishMoveOutputSchema)
	.use(authMiddleware)
	.handler(async ({ input, context }) => {
		const userId = context.user.id;

		const isAdmin = await validateUserIsAdmin(userId);
		if (!isAdmin) {
			throw new ORPCError("UNAUTHORIZED", {
				message: "User is not an administrator.",
			});
		}

		const result = await publishMove(input.id);
		if (!result) {
			throw new ORPCError("NOT_FOUND", {
				message: "Move not found.",
			});
		}

		return {
			success: true,
			publishedAt: result.publishedAt ?? new Date(),
		};
	});

export const unpublishMoveProcedure = os
	.input(AdminMoveIdInputSchema)
	.output(AdminActionOutputSchema)
	.use(authMiddleware)
	.handler(async ({ input, context }) => {
		const userId = context.user.id;

		const isAdmin = await validateUserIsAdmin(userId);
		if (!isAdmin) {
			throw new ORPCError("UNAUTHORIZED", {
				message: "User is not an administrator.",
			});
		}

		await unpublishMove(input.id);
		return { success: true };
	});

export const deleteMoveProcedure = os
	.input(AdminMoveIdInputSchema)
	.output(AdminActionOutputSchema)
	.use(authMiddleware)
	.handler(async ({ input, context }) => {
		const userId = context.user.id;

		const isAdmin = await validateUserIsAdmin(userId);
		if (!isAdmin) {
			throw new ORPCError("UNAUTHORIZED", {
				message: "User is not an administrator.",
			});
		}

		await deleteMove(input.id);
		return { success: true };
	});

export const restoreMoveProcedure = os
	.input(AdminMoveIdInputSchema)
	.output(AdminActionOutputSchema)
	.use(authMiddleware)
	.handler(async ({ input, context }) => {
		const userId = context.user.id;

		const isAdmin = await validateUserIsAdmin(userId);
		if (!isAdmin) {
			throw new ORPCError("UNAUTHORIZED", {
				message: "User is not an administrator.",
			});
		}

		await restoreMove(input.id);
		return { success: true };
	});

export const createMoveProcedure = os
	.input(AdminCreateMoveInputSchema)
	.output(AdminCreateMoveOutputSchema)
	.use(authMiddleware)
	.handler(async ({ input, context }) => {
		const userId = context.user.id;

		const isAdmin = await validateUserIsAdmin(userId);
		if (!isAdmin) {
			throw new ORPCError("UNAUTHORIZED", {
				message: "User is not an administrator.",
			});
		}

		const { createMove } = await import("@/data-access/moves");
		const { generateSlug } = await import("@/utils/utils");

		const slug = generateSlug(input.name);

		try {
			const result = await createMove({
				name: input.name,
				descriptionEn: input.descriptionEn,
				descriptionPl: input.descriptionPl,
				level: input.level,
				slug,
				steps: input.steps.map((step) => ({
					titleEn: step.titleEn,
					titlePl: step.titlePl,
					descriptionEn: step.descriptionEn,
					descriptionPl: step.descriptionPl,
				})),
			});

			return result;
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Failed to create move";

			throw new ORPCError("BAD_REQUEST", {
				message: errorMessage,
			});
		}
	});

export const editMoveProcedure = os
	.input(AdminEditMoveInputSchema)
	.output(AdminEditMoveOutputSchema)
	.use(authMiddleware)
	.handler(async ({ input, context }) => {
		const userId = context.user.id;

		const isAdmin = await validateUserIsAdmin(userId);
		if (!isAdmin) {
			throw new ORPCError("UNAUTHORIZED", {
				message: "User is not an administrator.",
			});
		}

		const { updateMove } = await import("@/data-access/moves");
		const { generateSlug } = await import("@/utils/utils");

		const slug = generateSlug(input.name);

		if (input.comboReferences?.includes(input.id)) {
			throw new ORPCError("BAD_REQUEST", {
				message: "A move cannot reference itself as a combo reference.",
			});
		}

		const uniqueReferences = new Set(input.comboReferences);
		if (
			input.comboReferences &&
			uniqueReferences.size !== input.comboReferences.length
		) {
			throw new ORPCError("BAD_REQUEST", {
				message: "Combo references must be unique.",
			});
		}

		try {
			const result = await updateMove({
				id: input.id,
				name: input.name,
				descriptionEn: input.descriptionEn,
				descriptionPl: input.descriptionPl,
				level: input.level,
				slug,
				steps: input.steps.map((step) => ({
					titleEn: step.titleEn,
					titlePl: step.titlePl,
					descriptionEn: step.descriptionEn,
					descriptionPl: step.descriptionPl,
				})),
				comboReferences: input.comboReferences,
			});

			return result;
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Failed to edit move";

			throw new ORPCError("BAD_REQUEST", {
				message: errorMessage,
			});
		}
	});

export const acceptImageProcedure = os
	.input(AdminAcceptImageInputSchema)
	.output(AdminAcceptImageOutputSchema)
	.use(authMiddleware)
	.handler(async ({ input, context }) => {
		const userId = context.user.id;

		const isAdmin = await validateUserIsAdmin(userId);
		if (!isAdmin) {
			throw new ORPCError("UNAUTHORIZED", {
				message: "User is not an administrator.",
			});
		}

		const { acceptMoveImage } = await import("@/data-access/moves");

		try {
			await acceptMoveImage(input.moveId, input.imageUrl);
			return { success: true };
		} catch {
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Failed to accept image",
			});
		}
	});

export const getMoveProcedure = os
	.input(AdminGetMoveInputSchema)
	.output(AdminGetMoveOutputSchema)
	.use(authMiddleware)
	.handler(async ({ input, context }) => {
		const userId = context.user.id;

		const isAdmin = await validateUserIsAdmin(userId);
		if (!isAdmin) {
			throw new ORPCError("UNAUTHORIZED", {
				message: "User is not an administrator.",
			});
		}

		const { getMoveByIdForAdmin } = await import("@/data-access/moves");

		try {
			const move = await getMoveByIdForAdmin(input.id);
			if (!move) {
				throw new ORPCError("NOT_FOUND", {
					message: "Move not found.",
				});
			}
			return { move };
		} catch (error) {
			if (error instanceof ORPCError) {
				throw error;
			}
			const errorMessage =
				error instanceof Error ? error.message : "Failed to get move";
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: errorMessage,
			});
		}
	});

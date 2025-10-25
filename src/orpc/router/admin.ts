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
import { getSupabaseServerClient } from "@/integrations/supabase/server";
import {
	generateImageWithReplicate,
	getSessionId,
} from "@/services/image-generation";
import { uploadReferenceImage } from "@/services/image-upload";
import { GENERATE_IMAGE_PROMPT } from "@/utils/prompts";
import { validateInputFile } from "@/utils/utils";
import {
	AdminAcceptImageInputSchema,
	AdminAcceptImageOutputSchema,
	AdminActionOutputSchema,
	AdminCreateMoveInputSchema,
	AdminCreateMoveOutputSchema,
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
	.handler(async ({ input }) => {
		const supabase = getSupabaseServerClient();
		const authData = await supabase.auth.getUser();

		if (!authData.data.user) {
			throw new ORPCError("UNAUTHORIZED", {
				message: "User is not authenticated.",
			});
		}

		const userId = authData.data.user.id;

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

async function validateAndAuthenticateAdmin(userId: string): Promise<boolean> {
	const isAdmin = await validateUserIsAdmin(userId);
	return isAdmin;
}

async function performImageGeneration(
	moveId: string,
	prompt: string,
	referenceImageUrl: string
): Promise<{ imageUrl: string; sessionId: string }> {
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

	const sessionId = getSessionId(moveId);
	return { imageUrl: generatedImageUrl, sessionId };
}

export const generateImageProcedure = os
	.input(GenerateImageInputSchema)
	.output(GenerateImageOutputSchema)
	.handler(async ({ input }) => {
		const supabase = getSupabaseServerClient();
		const authData = await supabase.auth.getUser();

		if (!authData.data.user) {
			throw new ORPCError("UNAUTHORIZED", {
				message: "Authentication required",
			});
		}

		const userId = authData.data.user.id;

		const isAdmin = await validateAndAuthenticateAdmin(userId);
		if (!isAdmin) {
			throw new ORPCError("UNAUTHORIZED", {
				message: "Admin access required",
			});
		}

		const { imageUrl, sessionId } = await performImageGeneration(
			input.moveId,
			GENERATE_IMAGE_PROMPT,
			input.referenceImageUrl
		);

		// const previewUrl = await storeAndSignPreviewImage(
		// 	imageUrl,
		// 	input.moveId,
		// 	sessionId
		// );

		return {
			previewUrl: imageUrl,
			sessionId,
			generatedAt: new Date(),
		};
	});

export const getStatsProcedure = os
	.output(AdminGetStatsOutputSchema)
	.handler(async () => {
		const supabase = getSupabaseServerClient();
		const authData = await supabase.auth.getUser();

		if (!authData.data.user) {
			throw new ORPCError("UNAUTHORIZED", {
				message: "User is not authenticated.",
			});
		}

		const userId = authData.data.user.id;

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
	.handler(async ({ input }) => {
		const supabase = getSupabaseServerClient();
		const authData = await supabase.auth.getUser();

		if (!authData.data.user) {
			throw new ORPCError("UNAUTHORIZED", {
				message: "User is not authenticated.",
			});
		}

		const userId = authData.data.user.id;

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
	.handler(async ({ input }) => {
		const supabase = getSupabaseServerClient();
		const authData = await supabase.auth.getUser();

		if (!authData.data.user) {
			throw new ORPCError("UNAUTHORIZED", {
				message: "User is not authenticated.",
			});
		}

		const userId = authData.data.user.id;

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
	.handler(async ({ input }) => {
		const supabase = getSupabaseServerClient();
		const authData = await supabase.auth.getUser();

		if (!authData.data.user) {
			throw new ORPCError("UNAUTHORIZED", {
				message: "User is not authenticated.",
			});
		}

		const userId = authData.data.user.id;

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
	.handler(async ({ input }) => {
		const supabase = getSupabaseServerClient();
		const authData = await supabase.auth.getUser();

		if (!authData.data.user) {
			throw new ORPCError("UNAUTHORIZED", {
				message: "User is not authenticated.",
			});
		}

		const userId = authData.data.user.id;

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
	.handler(async ({ input }) => {
		const supabase = getSupabaseServerClient();
		const authData = await supabase.auth.getUser();

		if (!authData.data.user) {
			throw new ORPCError("UNAUTHORIZED", {
				message: "User is not authenticated.",
			});
		}

		const userId = authData.data.user.id;

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
	.handler(async ({ input }) => {
		const supabase = getSupabaseServerClient();
		const authData = await supabase.auth.getUser();

		if (!authData.data.user) {
			throw new ORPCError("UNAUTHORIZED", {
				message: "User is not authenticated.",
			});
		}

		const userId = authData.data.user.id;

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
				description: input.description,
				level: input.level,
				slug,
				steps: input.steps,
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

export const acceptImageProcedure = os
	.input(AdminAcceptImageInputSchema)
	.output(AdminAcceptImageOutputSchema)
	.handler(async ({ input }) => {
		const supabase = getSupabaseServerClient();
		const authData = await supabase.auth.getUser();

		if (!authData.data.user) {
			throw new ORPCError("UNAUTHORIZED", {
				message: "User is not authenticated.",
			});
		}

		const userId = authData.data.user.id;

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

import { ORPCError, os } from "@orpc/server";
import { validateUserIsAdmin } from "@/data-access/profiles";
import { getSupabaseServerClient } from "@/integrations/supabase/server";
import {
	createSignedUrl,
	generateImageWithReplicate,
	getSessionId,
	uploadPreviewImage,
} from "@/services/image-generation";
import { uploadReferenceImage } from "@/services/image-upload";
import { GENERATE_IMAGE_PROMPT } from "@/utils/prompts";
import { validateInputFile, validateMoveId } from "@/utils/utils";
import {
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
		validateMoveId(input.moveId);

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

async function _storeAndSignPreviewImage(
	imageUrl: string,
	moveId: string,
	sessionId: string
): Promise<string> {
	let storagePath: string;
	try {
		storagePath = await uploadPreviewImage(imageUrl, moveId, sessionId);
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Upload failed";
		throw new ORPCError("INTERNAL_SERVER_ERROR", {
			message: `Failed to store preview image: ${errorMessage}`,
		});
	}

	let previewUrl: string;
	try {
		previewUrl = await createSignedUrl(storagePath, 24);
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Signed URL creation failed";
		throw new ORPCError("INTERNAL_SERVER_ERROR", {
			message: `Failed to create preview URL: ${errorMessage}`,
		});
	}

	return previewUrl;
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

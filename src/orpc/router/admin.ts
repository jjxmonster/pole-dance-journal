import { ORPCError, os } from "@orpc/server";
import { validateUserIsAdmin } from "@/data-access/profiles";
import { getSupabaseServerClient } from "@/integrations/supabase/server";
import { uploadReferenceImage } from "@/services/image-upload";
import { validateInputFile, validateMoveId } from "@/utils/utils";
import {
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

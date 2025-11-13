import { ORPCError, os } from "@orpc/server";
import {
	getProfileByUserId,
	updateProfileAvatar,
	updateProfileName,
} from "@/data-access/profiles";
import { getSupabaseServerClient } from "@/integrations/supabase/server";
import { uploadAvatarToStorage } from "@/services/avatar-upload";
import { authMiddleware } from "../auth";
import {
	ProfileChangePasswordInputSchema,
	ProfileChangePasswordOutputSchema,
	ProfileGetOutputSchema,
	ProfileUpdateAvatarInputSchema,
	ProfileUpdateAvatarOutputSchema,
	ProfileUpdateNameInputSchema,
	ProfileUpdateNameOutputSchema,
	ProfileUploadAvatarInputSchema,
	ProfileUploadAvatarOutputSchema,
} from "../schema";

export const getProfile = os
	.output(ProfileGetOutputSchema)
	.use(authMiddleware)
	.handler(async ({ context }) => {
		const userId = context.user.id;

		try {
			const profile = await getProfileByUserId(userId);
			return profile;
		} catch (error) {
			if (error instanceof ORPCError) {
				throw error;
			}

			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Failed to retrieve profile.",
			});
		}
	});

export const updateName = os
	.input(ProfileUpdateNameInputSchema)
	.output(ProfileUpdateNameOutputSchema)
	.use(authMiddleware)
	.handler(async ({ input, context }) => {
		const userId = context.user.id;

		try {
			const profile = await updateProfileName(userId, input.name);
			return {
				success: true,
				name: profile.name ?? "",
				updatedAt: profile.updatedAt,
			};
		} catch (error) {
			if (error instanceof ORPCError) {
				throw error;
			}

			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Failed to update profile name.",
			});
		}
	});

export const updateAvatar = os
	.input(ProfileUpdateAvatarInputSchema)
	.output(ProfileUpdateAvatarOutputSchema)
	.use(authMiddleware)
	.handler(async ({ input, context }) => {
		const userId = context.user.id;

		try {
			const profile = await updateProfileAvatar(userId, input.avatarUrl);
			return {
				success: true,
				avatarUrl: profile.avatarUrl ?? "",
				updatedAt: profile.updatedAt,
			};
		} catch (error) {
			if (error instanceof ORPCError) {
				throw error;
			}

			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Failed to update profile avatar.",
			});
		}
	});

export const uploadAvatar = os
	.input(ProfileUploadAvatarInputSchema)
	.output(ProfileUploadAvatarOutputSchema)
	.use(authMiddleware)
	.handler(async ({ input, context }) => {
		const userId = context.user.id;

		try {
			const existingProfile = await getProfileByUserId(userId);

			if (existingProfile.avatarUrl) {
				const supabase = getSupabaseServerClient();
				const url = new URL(existingProfile.avatarUrl);
				const pathParts = url.pathname.split("/");
				const bucketIndex = pathParts.indexOf("avatars");

				if (bucketIndex !== -1) {
					const filePath = pathParts.slice(bucketIndex + 1).join("/");
					await supabase.storage.from("avatars").remove([filePath]);
				}
			}

			const result = await uploadAvatarToStorage(input.file, userId);
			const profile = await updateProfileAvatar(userId, result.avatarUrl);

			return {
				success: true,
				avatarUrl: profile.avatarUrl ?? "",
				updatedAt: profile.updatedAt,
			};
		} catch {
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Failed to upload avatar.",
			});
		}
	});

export const changePassword = os
	.input(ProfileChangePasswordInputSchema)
	.output(ProfileChangePasswordOutputSchema)
	.use(authMiddleware)
	.handler(async ({ input, context }) => {
		const supabase = getSupabaseServerClient();
		const userEmail = context.user.email;

		if (!userEmail) {
			throw new ORPCError("UNAUTHORIZED", {
				message: "User email not found",
			});
		}

		try {
			const { error: signInError } = await supabase.auth.signInWithPassword({
				email: userEmail,
				password: input.currentPassword,
			});

			if (signInError) {
				throw new ORPCError("UNAUTHORIZED", {
					message: "Current password is incorrect",
				});
			}

			const { error: updateError } = await supabase.auth.updateUser({
				password: input.newPassword,
			});

			if (updateError) {
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Failed to update password",
				});
			}

			return {
				success: true,
				updatedAt: new Date(),
			};
		} catch (error) {
			if (error instanceof ORPCError) {
				throw error;
			}

			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Failed to change password.",
			});
		}
	});

import { ORPCError, os } from "@orpc/server";
import {
	getProfileByUserId,
	updateProfileAvatar,
	updateProfileName,
} from "@/data-access/profiles";
import { uploadAvatarToStorage } from "@/services/avatar-upload";
import { authMiddleware } from "../auth";
import {
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
			const result = await uploadAvatarToStorage(input.file, userId);
			const profile = await updateProfileAvatar(userId, result.avatarUrl);

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
				message: "Failed to upload avatar.",
			});
		}
	});

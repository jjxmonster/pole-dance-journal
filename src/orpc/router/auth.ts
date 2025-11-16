import { ORPCError, os } from "@orpc/server";
import { eq } from "drizzle-orm";
import {
	getProfileByUserId,
	validateUserIsAdmin,
} from "@/data-access/profiles";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { getSupabaseServerClient } from "@/integrations/supabase/server";
import {
	AuthForgotPasswordInputSchema,
	AuthLoginInputSchema,
	AuthOAuthCallbackInputSchema,
	AuthOAuthStartInputSchema,
	AuthOAuthStartOutputSchema,
	AuthRegisterInputSchema,
	AuthResetPasswordInputSchema,
	AuthSessionOutputSchema,
	AuthSuccessSchema,
} from "@/orpc/schema";
import type { SupabaseClient } from "@/orpc/types";
import { ERROR_MESSAGE_KEYS } from "@/utils/constants";

export const register = os
	.input(AuthRegisterInputSchema)
	.output(AuthSuccessSchema)
	.handler(async ({ input, context }) => {
		const supabase = (context as Record<string, SupabaseClient>).supabase;

		try {
			const { error, data } = await supabase.auth.signUp({
				email: input.email,
				password: input.password,
			});

			if (error) {
				if (error.message.includes("already registered")) {
					throw new ORPCError("CONFLICT", {
						message: ERROR_MESSAGE_KEYS.EMAIL_ALREADY_REGISTERED,
					});
				}

				throw new ORPCError("BAD_REQUEST", {
					message: ERROR_MESSAGE_KEYS.REGISTER_FAILED,
				});
			}

			await db.insert(profiles).values({
				userId: data.user.id,
				isAdmin: false,
				createdAt: new Date(),
				updatedAt: new Date(),
			});

			return { success: true };
		} catch (error) {
			if (error instanceof ORPCError) {
				throw error;
			}

			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: ERROR_MESSAGE_KEYS.REGISTRATION_FAILED,
			});
		}
	});

export const login = os
	.input(AuthLoginInputSchema)
	.output(AuthSuccessSchema)
	.handler(async ({ input, context }) => {
		const supabase = (context as Record<string, SupabaseClient>).supabase;

		try {
			const { error } = await supabase.auth.signInWithPassword({
				email: input.email,
				password: input.password,
			});
			if (error) {
				if (error.message.includes("Email not confirmed")) {
					throw new ORPCError("UNAUTHORIZED", {
						message: ERROR_MESSAGE_KEYS.EMAIL_NOT_CONFIRMED,
					});
				}

				throw new ORPCError("UNAUTHORIZED", {
					message: ERROR_MESSAGE_KEYS.INVALID_CREDENTIALS,
				});
			}

			return { success: true };
		} catch (error) {
			if (error instanceof ORPCError) {
				throw error;
			}

			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: ERROR_MESSAGE_KEYS.SIGNIN_FAILED,
			});
		}
	});

export const logout = os
	.output(AuthSuccessSchema)
	.handler(async ({ context }) => {
		const supabase = (context as Record<string, SupabaseClient>).supabase;

		try {
			const { error } = await supabase.auth.signOut();

			if (error) {
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: ERROR_MESSAGE_KEYS.SIGNOUT_FAILED,
				});
			}

			return { success: true };
		} catch (error) {
			if (error instanceof ORPCError) {
				throw error;
			}

			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: ERROR_MESSAGE_KEYS.SIGNOUT_FAILED,
			});
		}
	});

export const getSession = os
	.output(AuthSessionOutputSchema)
	.handler(async () => {
		const supabase = getSupabaseServerClient();
		try {
			const data = await supabase.auth.getUser();
			const userId = data.data.user?.id ?? null;

			if (!userId) {
				return {
					userId: null,
					email: null,
					isAdmin: false,
					expiresAt: null,
					avatarUrl: null,
					name: null,
				};
			}

			const isAdmin = await validateUserIsAdmin(userId);

			const profile = await getProfileByUserId(userId);

			return {
				userId,
				email: data.data.user?.email ?? null,
				isAdmin,
				expiresAt: null,
				avatarUrl: profile.avatarUrl ?? null,
				name: profile.name ?? null,
			};
		} catch {
			return {
				userId: null,
				email: null,
				isAdmin: false,
				expiresAt: null,
				avatarUrl: null,
				name: null,
			};
		}
	});

export const forgotPassword = os
	.input(AuthForgotPasswordInputSchema)
	.output(AuthSuccessSchema)
	.handler(async ({ input, context }) => {
		const supabase = (context as Record<string, SupabaseClient>).supabase;

		try {
			await supabase.auth.resetPasswordForEmail(input.email, {
				redirectTo: `${process.env.APP_URL || "http://localhost:3000"}/auth/reset-password`,
			});

			return { success: true };
		} catch {
			return { success: true };
		}
	});

export const resetPassword = os
	.input(AuthResetPasswordInputSchema)
	.output(AuthSuccessSchema)
	.handler(async ({ input, context }) => {
		const supabase = (context as Record<string, SupabaseClient>).supabase;

		try {
			const { error } = await supabase.auth.exchangeCodeForSession(
				input.accessToken
			);

			if (error) {
				throw new ORPCError("BAD_REQUEST", {
					message: ERROR_MESSAGE_KEYS.RESET_LINK_INVALID,
				});
			}

			const { error: updateError } = await supabase.auth.updateUser({
				password: input.newPassword,
			});

			if (updateError) {
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: ERROR_MESSAGE_KEYS.PASSWORD_UPDATE_FAILED,
				});
			}

			return { success: true };
		} catch (error) {
			if (error instanceof ORPCError) {
				throw error;
			}

			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: ERROR_MESSAGE_KEYS.RESET_PASSWORD_FAILED,
			});
		}
	});

export const oauthStart = os
	.input(AuthOAuthStartInputSchema)
	.output(AuthOAuthStartOutputSchema)
	.handler(async ({ input, context }) => {
		const supabase = (context as Record<string, SupabaseClient>).supabase;

		try {
			const { data, error } = await supabase.auth.signInWithOAuth({
				provider: input.provider,
				options: {
					redirectTo:
						input.redirectTo ||
						`${process.env.APP_URL || "http://localhost:3000"}/auth/oauth-callback`,
				},
			});

			if (error || !data?.url) {
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: ERROR_MESSAGE_KEYS.OAUTH_START_FAILED,
				});
			}

			return { url: data.url };
		} catch (error) {
			if (error instanceof ORPCError) {
				throw error;
			}

			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: ERROR_MESSAGE_KEYS.OAUTH_START_FAILED,
			});
		}
	});

export const oauthCallback = os
	.input(AuthOAuthCallbackInputSchema)
	.output(AuthSuccessSchema)
	.handler(async ({ input }) => {
		const supabase = getSupabaseServerClient();

		try {
			const { error } = await supabase.auth.exchangeCodeForSession(input.code);

			if (error) {
				throw new ORPCError("BAD_REQUEST", {
					message: ERROR_MESSAGE_KEYS.OAUTH_LINK_INVALID,
				});
			}

			const { data: sessionData } = await supabase.auth.getSession();
			const userId = sessionData?.session?.user?.id;

			if (!userId) {
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: ERROR_MESSAGE_KEYS.USER_INFO_FAILED,
				});
			}

			const existingProfile = await db
				.select()
				.from(profiles)
				.where(eq(profiles.userId, userId))
				.limit(1);

			if (existingProfile.length === 0) {
				try {
					const userData = sessionData?.session?.user;
					const name = userData?.user_metadata?.full_name ?? null;
					const avatarUrl = userData?.user_metadata?.avatar_url ?? null;

					await db.insert(profiles).values({
						userId,
						isAdmin: false,
						name,
						avatarUrl,
						createdAt: new Date(),
						updatedAt: new Date(),
					});
				} catch (dbError) {
					if (
						dbError instanceof Error &&
						dbError.message.includes("unique constraint")
					) {
						return { success: true };
					}
					throw dbError;
				}
			}

			return { success: true };
		} catch (error) {
			if (error instanceof ORPCError) {
				throw error;
			}

			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: ERROR_MESSAGE_KEYS.OAUTH_FAILED,
			});
		}
	});

import { ORPCError, os } from "@orpc/server";
import { eq } from "drizzle-orm";
import { validateUserIsAdmin } from "@/data-access/profiles";
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
						message: "This email is already registered.",
					});
				}

				throw new ORPCError("BAD_REQUEST", {
					message: "Failed to register. Please check your email and password.",
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
				message: "Registration failed. Please try again.",
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
						message:
							"Konto nie zostało potwierdzone. Sprawdź swoją pocztę i kliknij w link w celu potwierdzenia konta.",
					});
				}

				throw new ORPCError("UNAUTHORIZED", {
					message: "Invalid email or password.",
				});
			}

			return { success: true };
		} catch (error) {
			if (error instanceof ORPCError) {
				throw error;
			}

			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Unable to sign in. Please try again.",
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
					message: "Failed to sign out. Please try again.",
				});
			}

			return { success: true };
		} catch (error) {
			if (error instanceof ORPCError) {
				throw error;
			}

			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Failed to sign out. Please try again.",
			});
		}
	});

export const getSession = os
	.output(AuthSessionOutputSchema)
	.handler(async () => {
		const supabase = getSupabaseServerClient();
		try {
			const data = await supabase.auth.getUser();

			const isAdmin = await validateUserIsAdmin(data.data.user?.id ?? "");

			return {
				userId: data.data.user?.id ?? null,
				email: data.data.user?.email ?? null,
				isAdmin,
				expiresAt: null,
			};
		} catch {
			return {
				userId: null,
				email: null,
				isAdmin: false,
				expiresAt: null,
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
					message: "Reset link is invalid or expired.",
				});
			}

			const { error: updateError } = await supabase.auth.updateUser({
				password: input.newPassword,
			});

			if (updateError) {
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Failed to update password. Please try again.",
				});
			}

			return { success: true };
		} catch (error) {
			if (error instanceof ORPCError) {
				throw error;
			}

			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Failed to reset password. Please try again.",
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
					message: "Unable to start OAuth sign-in. Please try again.",
				});
			}

			return { url: data.url };
		} catch (error) {
			if (error instanceof ORPCError) {
				throw error;
			}

			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Unable to start OAuth sign-in. Please try again.",
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
					message: "Google sign-in link is invalid or expired.",
				});
			}

			const { data: sessionData } = await supabase.auth.getSession();
			const userId = sessionData?.session?.user?.id;

			if (!userId) {
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Failed to retrieve user information.",
				});
			}

			const existingProfile = await db
				.select()
				.from(profiles)
				.where(eq(profiles.userId, userId))
				.limit(1);

			if (existingProfile.length === 0) {
				try {
					await db.insert(profiles).values({
						userId,
						isAdmin: false,
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
				message: "Failed to complete Google sign-in. Please try again.",
			});
		}
	});

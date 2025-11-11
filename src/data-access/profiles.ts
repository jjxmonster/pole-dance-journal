import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { getSupabaseServerClient } from "@/integrations/supabase/server";

export async function validateUserIsAdmin(userId: string): Promise<boolean> {
	const supabase = getSupabaseServerClient();
	const { data, error } = await supabase
		.from("profiles")
		.select("is_admin")
		.eq("user_id", userId)
		.single();

	if (error || !data) {
		throw new ORPCError("UNAUTHORIZED", {
			message: "User profile not found.",
		});
	}

	return data.is_admin;
}

export async function getProfileByUserId(userId: string) {
	const profile = await db
		.select()
		.from(profiles)
		.where(eq(profiles.userId, userId))
		.limit(1);

	if (profile.length === 0) {
		throw new ORPCError("NOT_FOUND", {
			message: "Profile not found.",
		});
	}

	return profile[0];
}

export async function updateProfileName(userId: string, name: string) {
	const result = await db
		.update(profiles)
		.set({
			name,
			updatedAt: new Date(),
		})
		.where(eq(profiles.userId, userId))
		.returning();

	if (result.length === 0) {
		throw new ORPCError("NOT_FOUND", {
			message: "Profile not found.",
		});
	}

	return result[0];
}

export async function updateProfileAvatar(userId: string, avatarUrl: string) {
	const result = await db
		.update(profiles)
		.set({
			avatarUrl,
			updatedAt: new Date(),
		})
		.where(eq(profiles.userId, userId))
		.returning();

	if (result.length === 0) {
		throw new ORPCError("NOT_FOUND", {
			message: "Profile not found.",
		});
	}

	return result[0];
}

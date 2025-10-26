import { ORPCError } from "@orpc/server";
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

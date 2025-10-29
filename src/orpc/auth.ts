import { ORPCError, os } from "@orpc/server";
import { getSupabaseServerClient } from "@/integrations/supabase/server";

export const authMiddleware = os.$context().middleware(async ({ next }) => {
	const supabase = getSupabaseServerClient();
	const data = await supabase.auth.getUser();
	if (!data.data.user) {
		throw new ORPCError("UNAUTHORIZED", {
			message: "Please sign in to continue.",
		});
	}

	return next({
		context: {
			user: data.data.user,
		},
	});
});

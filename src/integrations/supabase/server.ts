import { createServerClient } from "@supabase/ssr";
import { getCookies, setCookie } from "@tanstack/react-start/server";
import { env } from "@/env";

export function getSupabaseServerClient() {
	return createServerClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
		cookies: {
			getAll() {
				return Object.entries(getCookies()).map(([name, value]) => ({
					name,
					value,
				}));
			},
			setAll(cookies) {
				for (const cookie of cookies) {
					setCookie(cookie.name, cookie.value);
				}
			},
		},
	});
}

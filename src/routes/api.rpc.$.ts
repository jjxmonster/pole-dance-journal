import "@/polyfill";

import { RPCHandler } from "@orpc/server/fetch";
import { createFileRoute } from "@tanstack/react-router";
import { getCookies } from "@tanstack/react-start/server";
import { getSupabaseServerClient } from "@/integrations/supabase/server";
import router from "@/orpc/router";

const handler = new RPCHandler(router);

async function handle({ request }: { request: Request }) {
	const supabase = getSupabaseServerClient();
	const cookies = getCookies();
	const locale = (cookies.PARAGLIDE_LOCALE as "en" | "pl") ?? "pl";

	const { response } = await handler.handle(request, {
		prefix: "/api/rpc",
		context: {
			supabase,
			locale,
		},
	});

	return response ?? new Response("Not Found", { status: 404 });
}

export const Route = createFileRoute("/api/rpc/$")({
	server: {
		handlers: {
			HEAD: handle,
			GET: handle,
			POST: handle,
			PUT: handle,
			PATCH: handle,
			DELETE: handle,
		},
	},
});

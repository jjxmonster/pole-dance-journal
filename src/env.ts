import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		POSTGRES_URL: z.string().url(),
		SUPABASE_KEY: z.string(),
		SUPABASE_URL: z.string().url(),
		SUPABASE_ANON_KEY: z.string(),
	},
	clientPrefix: "VITE_",
	client: {},
	runtimeEnv: {
		POSTGRES_URL: process.env.POSTGRES_URL,
		SUPABASE_KEY: process.env.SUPABASE_KEY,
		SUPABASE_URL: process.env.SUPABASE_URL,
		SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
	},
	emptyStringAsUndefined: true,
});

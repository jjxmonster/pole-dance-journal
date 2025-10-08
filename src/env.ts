import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		SERVER_URL: z.string().url().optional(),
		SUPABASE_URL: z.string().url(),
		SUPABASE_KEY: z.string(),
	},
	clientPrefix: "VITE_",
	client: {},
	runtimeEnv: import.meta.env,
	emptyStringAsUndefined: true,
});

import netlify from "@netlify/vite-plugin-tanstack-start";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

const config = defineConfig({
	plugins: [
		// this is the plugin that enables path aliases
		viteTsConfigPaths({
			projects: ["./tsconfig.json"],
		}),
		netlify(),
		tailwindcss(),
		tanstackStart({
			prerender: {
				enabled: true,
				autoSubfolderIndex: true,
				crawlLinks: true,
				concurrency: 8,
			},
		}),
		viteReact(),
	],
});

export default config;

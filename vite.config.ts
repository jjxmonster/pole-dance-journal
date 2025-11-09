import { paraglideVitePlugin } from "@inlang/paraglide-js";
import netlify from "@netlify/vite-plugin-tanstack-start";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

const config = defineConfig({
	plugins: [
		paraglideVitePlugin({
			project: "./project.inlang",
			outdir: "./src/paraglide",
			outputStructure: "message-modules",
			cookieName: "PARAGLIDE_LOCALE",
			strategy: ["cookie", "preferredLanguage", "baseLocale"],
		}),
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

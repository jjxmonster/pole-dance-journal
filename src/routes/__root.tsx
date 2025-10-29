import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { Toaster } from "sonner";
import { Footer } from "../components/footer";
import { Nav } from "../components/nav";
import { NotFound } from "../components/not-found";
import { useAuth } from "../hooks/use-auth";
import { client } from "../orpc/client";
import appCss from "../styles.css?url";

type MyRouterContext = {
	queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Spinella - Your Pole Dance Journey Tracker",
			},
			{
				name: "description",
				content:
					"Track your pole dance progress, discover new moves, and achieve your fitness goals with Spinella. Your comprehensive pole dance companion.",
			},
			{
				property: "og:title",
				content: "Spinella - Your Pole Dance Journey Tracker",
			},
			{
				property: "og:description",
				content:
					"Track your pole dance progress, discover new moves, and achieve your fitness goals with Spinella.",
			},
			{
				property: "og:type",
				content: "website",
			},
			{
				name: "twitter:card",
				content: "summary_large_image",
			},
			{
				name: "twitter:title",
				content: "Spinella - Your Pole Dance Journey Tracker",
			},
			{
				name: "twitter:description",
				content:
					"Track your pole dance progress, discover new moves, and achieve your fitness goals.",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),

	notFoundComponent: NotFound,
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	const { setAuth } = useAuth();

	useEffect(() => {
		const syncSession = async () => {
			try {
				const session = await client.auth.getSession();
				setAuth({
					userId: session.userId,
					email: session.email,
					isAdmin: session.isAdmin,
					expiresAt: session.expiresAt,
				});
			} catch {
				setAuth({
					userId: null,
					email: null,
					isAdmin: false,
					expiresAt: null,
				});
			}
		};

		syncSession();
	}, [setAuth]);

	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<div className="flex min-h-screen flex-col bg-background">
					<Nav />
					<main className="flex-1">{children}</main>
					<Footer />
				</div>
				<Toaster position="top-right" richColors />
				<Scripts />
			</body>
		</html>
	);
}

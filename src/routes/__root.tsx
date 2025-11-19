import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
	useLoaderData,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { Toaster } from "sonner";
import { getLocale } from "@/paraglide/runtime";
import { Footer } from "../components/footer";
import { Nav } from "../components/nav";
import { NotFound } from "../components/not-found";
import { useAuth } from "../hooks/use-auth";
import { sessionQueryOptions } from "../query-options/auth";
import appCss from "../styles.css?url";

type MyRouterContext = {
	queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<MyRouterContext>()({
	beforeLoad: async ({ context }) => {
		const session = await context.queryClient.ensureQueryData(
			sessionQueryOptions()
		);
		return {
			session,
		};
	},
	loader: ({ context }) => ({
		session: context.session,
	}),
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
				title: "Spinella: Śledź swój postęp w Pole Dance",
			},
			{
				name: "description",
				content:
					"Śledź swoje postępy w pole dance, odkrywaj nowe figury i osiągaj swoje cele fitness z Spinella. Twój kompleksowy partner w pole dance.",
			},
			{
				property: "og:title",
				title: "Spinella: Śledź swój postęp w Pole Dance",
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
				title: "Spinella: Śledź swój postęp w Pole Dance",
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
	const { session } = useLoaderData({ from: "__root__" });

	useEffect(() => {
		if (session) {
			setAuth({
				userId: session.userId,
				email: session.email,
				isAdmin: session.isAdmin,
				expiresAt: session.expiresAt,
				avatarUrl: session.avatarUrl,
				name: session.name,
			});
		} else {
			setAuth({
				userId: null,
				email: null,
				isAdmin: false,
				expiresAt: null,
				avatarUrl: null,
				name: null,
			});
		}
	}, [session, setAuth]);

	return (
		<html lang={getLocale()}>
			<head>
				<HeadContent />
				<script src="https://tweakcn.com/live-preview.min.js" />
			</head>
			<body>
				<div className="flex min-h-screen flex-col overflow-x-hidden bg-background">
					<Nav />
					<main className="flex-1 px-4 pt-20">{children}</main>
					<Footer />
				</div>
				<Toaster
					position="top-right"
					richColors
					toastOptions={{
						classNames: {
							info: "!bg-primary !text-primary-foreground !border-primary",
						},
					}}
				/>
				<Scripts />
			</body>
		</html>
	);
}

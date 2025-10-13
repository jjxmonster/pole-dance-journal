import { TanstackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Footer } from "../components/footer";
import { Nav } from "../components/nav";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import StoreDevtools from "../lib/demo-store-devtools";
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

	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<div className="min-h-screen bg-background">
					<Nav />
					<main>{children}</main>
					<Footer />
				</div>
				<TanstackDevtools
					config={{
						position: "bottom-left",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
						TanStackQueryDevtools,
						StoreDevtools,
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}

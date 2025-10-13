import { createFileRoute } from "@tanstack/react-router";
import { Benefits } from "../components/homepage/benefits";
import { Cta } from "../components/homepage/cta";
import { Features } from "../components/homepage/features";
import { Hero } from "../components/homepage/hero";

export const Route = createFileRoute("/")({
	component: HomePage,
	head: () => ({
		meta: [
			{
				title: "Spinella - Track Your Pole Dance Journey",
			},
			{
				name: "description",
				content:
					"Master pole dance with Spinella. Track your progress, discover moves, set goals, and connect with a community of pole dancers worldwide.",
			},
			{
				property: "og:title",
				content: "Spinella - Track Your Pole Dance Journey",
			},
			{
				property: "og:description",
				content:
					"Master pole dance with Spinella. Track your progress, discover moves, and achieve your fitness goals.",
			},
			{
				name: "twitter:card",
				content: "summary_large_image",
			},
		],
	}),
});

function HomePage() {
	return (
		<>
			<Hero />
			<Features />
			<Benefits />
			<Cta />
		</>
	);
}

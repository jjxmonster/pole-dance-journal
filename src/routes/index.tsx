import { createFileRoute } from "@tanstack/react-router";
import { Benefits } from "../components/homepage/benefits";
import { Cta } from "../components/homepage/cta";
import { Features } from "../components/homepage/features";
import { Hero } from "../components/homepage/hero";
import { m } from "../paraglide/messages";

export const Route = createFileRoute("/")({
	component: HomePage,
	head: () => ({
		meta: [
			{
				title: m.homepage_meta_title(),
			},
			{
				name: "description",
				content: m.homepage_meta_description(),
			},
			{
				property: "og:title",
				content: m.homepage_meta_og_title(),
			},
			{
				property: "og:description",
				content: m.homepage_meta_og_description(),
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

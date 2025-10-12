import { createFileRoute } from "@tanstack/react-router";
import { Benefits } from "../components/homepage/benefits";
import { Cta } from "../components/homepage/cta";
import { Features } from "../components/homepage/features";
import { Hero } from "../components/homepage/hero";

export const Route = createFileRoute("/")({
	component: HomePage,
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

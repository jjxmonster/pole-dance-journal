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
				title: "Spinella: Śledź swój postęp w Pole Dance",
			},
			{
				name: "description",
				content:
					"Zmień chaos w progres. Spinella to Twoje miejsce, gdzie śledzisz naukę figur pole dance, notujesz triki i świętujesz postępy. Dołącz i zobacz, jak szybko rośniesz w siłę!",
			},
			{
				property: "og:title",
				content: "Spinella: Twój Dziennik Pole Dance - Opanuj Każdą Figurę",
			},
			{
				property: "og:description",
				content:
					"Zmień chaos w progres. Spinella to Twoje miejsce, gdzie śledzisz naukę figur pole dance, notujesz triki i świętujesz postępy. Dołącz i zobacz, jak szybko rośniesz w siłę!",
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

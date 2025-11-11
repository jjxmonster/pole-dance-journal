import { db } from "./index";
import { moves, moveTranslations, steps, stepTranslations } from "./schema";

const IMAGE_URL =
	"http://127.0.0.1:54321/storage/v1/object/sign/moves-images/move.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtb3Zlcy1pbWFnZXMvbW92ZS5qcGciLCJpYXQiOjE3NjAyODkwMTcsImV4cCI6MTc2MDg5MzgxN30.BZKhRDTIqEwvRAt-JruqkypgVPw8fIJLFlYT4AKgo1c";

const movesData = [
	{
		name: "Podstawowy Spin",
		description:
			"Podstawowy obrót wokół drążka wykonywany z pozycji stojącej. To fundamentalny ruch dla początkujących, który uczy kontroli i balansu podczas obrotu. Wykonywany jest z wewnętrznej ręki jako punktu podparcia.",
		level: "Beginner" as const,
		slug: "podstawowy-spin",
		steps: [
			{
				title: "Postaw stopy blisko drążka",
				description:
					"Stań bokiem do drążka, wewnętrzna ręka na wysokości ramienia, stopy razem przy drążku.",
			},
			{
				title: "Rozpocznij obrót",
				description:
					"Odbij się zewnętrzną nogą i obróć biodra wokół drążka, trzymając ciało blisko.",
			},
			{
				title: "Zakończ gracją",
				description:
					"Wyląduj miękko na stopach, kontrolując zakończenie ruchu z wyprostowaną postawą.",
			},
		],
	},
	{
		name: "Fireman Spin",
		description:
			"Dynamiczny obrót z zeskoku, w którym ciało obraca się wokół drążka trzymając go wewnętrzną ręką i kolanem. Ruch ten rozwija koordynację i siłę chwytu, będąc świetnym przejściem do bardziej zaawansowanych obrotów.",
		level: "Beginner" as const,
		slug: "fireman-spin",
		steps: [
			{
				title: "Chwyć drążek i unieś kolano",
				description:
					"Stań bokiem, chwyć drążek wewnętrzną ręką wysoko, unieś wewnętrzne kolano do drążka.",
			},
			{
				title: "Odbij się i złap drążek kolanem",
				description:
					"Odbij się zewnętrzną nogą, przytrzymując drążek między wewnętrznym kolanem a stopą.",
			},
			{
				title: "Obróć się i wyląduj",
				description:
					"Pozwól ciału wykonać pełny obrót kontrolując prędkość, wyląduj z gracją na stopach.",
			},
		],
	},
	{
		name: "Chairspin",
		description:
			"Elegancki obrót w pozycji siedzącej na drążku. Wymaga dobrej kontroli core i elastyczności bioder. Ten ruch jest często wykorzystywany w choreografiach jako element przejściowy i może być wykonany w wielu wariantach.",
		level: "Intermediate" as const,
		slug: "chairspin",
		steps: [
			{
				title: "Wejdź w pozycję krzesła",
				description:
					"Z pozycji stojącej, chwyć drążek, unieś nogi i usiądź na drążku z jedną nogą zgiętą.",
			},
			{
				title: "Ustabilizuj pozycję",
				description:
					"Trzymaj tułów prosto, druga noga wyprostowana do przodu, ręce mocno na drążku.",
			},
			{
				title: "Wykonaj kontrolowany obrót",
				description:
					"Wykorzystaj momentum i mięśnie core do wykonania pełnego obrotu w pozycji siedzącej.",
			},
			{
				title: "Zejdź bezpiecznie",
				description:
					"Po zakończeniu obrotu, kontrolowane zejście najpierw jedną nogą, potem drugą.",
			},
		],
	},
	{
		name: "Invert",
		description:
			"Podstawowe wywrócenie do góry nogami na drążku. To kluczowy ruch otwierający drzwi do wielu zaawansowanych figur. Wymaga znacznej siły core, rąk i elastyczności bioder. Bezpieczne wykonanie wymaga odpowiedniej matry pod drążkiem.",
		level: "Intermediate" as const,
		slug: "invert",
		steps: [
			{
				title: "Przygotuj mocny chwyt",
				description:
					"Stań przed drążkiem, obie ręce chwytem na wysokości głowy, łokcie lekko ugięte.",
			},
			{
				title: "Podciągnij nogi w górę",
				description:
					"Zaangażuj mięśnie brzucha i podciągnij ugięte kolana do klatki piersiowej blisko drążka.",
			},
			{
				title: "Wyprostu nogi nad sobą",
				description:
					"Gdy biodra są powyżej głowy, wyprostuj nogi pionowo w górę, trzymając się mocno drążka.",
			},
			{
				title: "Utrzymaj pozycję",
				description:
					"Stabilizuj pozycję do góry nogami przez kilka sekund, zanim bezpiecznie zejdziesz.",
			},
		],
	},
	{
		name: "Basic Climb",
		description:
			"Wspinaczka jest fundamentalnym elementem pozwalającym dostać się wyżej na drążku. Wymaga siły ramion, nóg i koordynacji. To podstawa do wykonywania figur na wyższych poziomach drążka oraz buduje niezbędną siłę do bardziej zaawansowanych ruchów.",
		level: "Beginner" as const,
		slug: "basic-climb",
		steps: [
			{
				title: "Złap drążek obiema rękami",
				description:
					"Stań przodem do drążka, chwyć go obiema rękami powyżej głowy, łokcie ugięte.",
			},
			{
				title: "Unieś nogi i zaciśnij drążek",
				description:
					"Podciągnij nogi i zaciśnij drążek między wewnętrzną stroną stóp i kolanami.",
			},
			{
				title: "Przesuwaj ręce wyżej",
				description:
					"Trzymając drążek nogami, przesuwaj najpierw jedną rękę wyżej, potem drugą naprzemiennie.",
			},
			{
				title: "Powtarzaj sekwencję",
				description:
					"Kontynuuj przemieszczanie nóg i rąk w górę, aż osiągniesz pożądaną wysokość.",
			},
		],
	},
	{
		name: "Cupid",
		description:
			"Romantyczna figura wykonywana bokiem do drążka z jedną nogą zahaczoną, druga wyprostowana, ciało wygięte w łuk. Ten ruch wymaga elastyczności pleców, siły nóg i dobrej kontroli balansu. Jest często wykorzystywany w choreografiach ze względu na swoją estetykę.",
		level: "Advanced" as const,
		slug: "cupid",
		steps: [
			{
				title: "Wejdź w pozycję wyjściową",
				description:
					"Z pozycji stojącej, zahaczyć jedną nogę wokół drążka na wysokości biodra, ręce na drążku.",
			},
			{
				title: "Wyprostuj drugą nogę",
				description:
					"Wyprostuj drugą nogę przed sobą, utrzymując balans i równowagę ciała bokiem do drążka.",
			},
			{
				title: "Wygięcie ciała w łuk",
				description:
					"Puść górną rękę, wyginając ciało do tyłu, druga ręka trzyma drążek za sobą dla balansu.",
			},
			{
				title: "Utrzymaj pozę",
				description:
					"Stabilizuj figurę przez kilka sekund, kontrolując oddech i napięcie mięśni.",
			},
			{
				title: "Wyjście z figury",
				description:
					"Chwyć drążek obiema rękami, kontrolowanie wyprostuj ciało i zejdź bezpiecznie.",
			},
		],
	},
	{
		name: "Shoulder Mount",
		description:
			"Zaawansowane wejście na drążek z poziomu podłogi do pozycji odwróconej, opierając się na ramieniu. Wymaga wyjątkowej siły ramion, core i górnej części ciała. Jest to kluczowy element dla wielu zaawansowanych kombinacji i przejść.",
		level: "Advanced" as const,
		slug: "shoulder-mount",
		steps: [
			{
				title: "Przygotuj chwyt i pozycję",
				description:
					"Stań bokiem do drążka, obie ręce chwytem wysoko, ramię wewnętrzne przyciśnięte do drążka.",
			},
			{
				title: "Podciągnij nogi z skokiem",
				description:
					"Wykonaj mały podskok i podciągnij nogi zgięte w kolanach do klatki, opierając ramię na drążku.",
			},
			{
				title: "Przewróć biodra nad głową",
				description:
					"Wykorzystując momentum i siłę core, przewróć biodra ponad głowę, opierając się na ramieniu.",
			},
			{
				title: "Wyprostuj ciało pionowo",
				description:
					"Gdy biodra są nad głową, wyprostuj nogi pionowo w górę, stabilizując pozycję.",
			},
			{
				title: "Stabilizacja i wyjście",
				description:
					"Utrzymaj pozycję przez moment, następnie kontrolowanie zejdź lub przejdź w inną figurę.",
			},
		],
	},
	{
		name: "Attitude Spin",
		description:
			"Elegancki obrót z jedną nogą zahaczoną o drążek w pozycji attitude (zgięta w kolanie). Ten pośredni ruch rozwija elastyczność bioder, siłę nóg i kontrolę podczas obrotów. Często wykorzystywany w choreografiach artystycznych.",
		level: "Intermediate" as const,
		slug: "attitude-spin",
		steps: [
			{
				title: "Chwyć drążek i unieś nogę",
				description:
					"Stań bokiem do drążka, wewnętrzna ręka na drążku, unieś zewnętrzną nogę zgiętą w kolanie.",
			},
			{
				title: "Zahaczyć nogę o drążek",
				description:
					"Umieść wewnętrzną stronę kolana na drążku, stopa skierowana do tyłu w pozycji attitude.",
			},
			{
				title: "Odbicie i obrót",
				description:
					"Odbij się drugą nogą od podłogi, pozwalając ciału wykonać kontrolowany obrót wokół drążka.",
			},
			{
				title: "Zakończenie ruchu",
				description:
					"Utrzymuj elegancką postawę podczas całego obrotu, wyląduj miękko na stopach.",
			},
		],
	},
	{
		name: "Jasmine",
		description:
			"Piękna figura wymaga zahaczyć obie nogi na drążku w skręcony sposób, ciało wisi do góry nogami w wygiętej pozycji. Ten zaawansowany ruch wymaga dużej elastyczności bioder i pleców oraz siły nóg do utrzymania pozycji. Spektakularny element choreografii.",
		level: "Advanced" as const,
		slug: "jasmine",
		steps: [
			{
				title: "Wejdź w pozycję odwróconą",
				description:
					"Z pozycji invert lub shoulder mount, zahaczyć obie nogi na drążku powyżej głowy.",
			},
			{
				title: "Skręć biodra i nogi",
				description:
					"Skręć biodra, jedna noga przed drążkiem, druga za, nogi skrzyżowane i zahaczone mocno.",
			},
			{
				title: "Puść ręce i wygnij plecy",
				description:
					"Kontrolowane puścić ręce, pozwalając ciału zawisnąć, wygięcie pleców do tyłu.",
			},
			{
				title: "Utrzymaj pozycję",
				description:
					"Stabilizuj figurę używając mięśni nóg i core, ręce w estetycznej pozycji lub na drążku.",
			},
			{
				title: "Bezpieczne wyjście",
				description:
					"Chwyć drążek rękami, odkręć nogi, kontrolowanie zejdź lub przejdź w inną figurę.",
			},
		],
	},
	{
		name: "Pole Sit",
		description:
			"Podstawowa pozycja siedząca na drążku z nogami zaciśniętymi wokół niego. To fundamentalny element dla początkujących, który uczy stabilnej pozycji siedzenia i jest bazą dla wielu innych figur. Wymaga siły nóg i chwytu.",
		level: "Beginner" as const,
		slug: "pole-sit",
		steps: [
			{
				title: "Chwyć drążek i unieś ciało",
				description:
					"Stań przodem do drążka, chwyć go obiema rękami, podciągnij ciało w górę.",
			},
			{
				title: "Zaciśnij nogi na drążku",
				description:
					"Unieś nogi i zaciśnij drążek między wewnętrzną stroną ud i kolanami mocno.",
			},
			{
				title: "Usiądź na powietrzu",
				description:
					"Puść lekko napięcie rąk, pozwalając ciału usiąść w stabilnej pozycji, ręce przed sobą.",
			},
			{
				title: "Stabilizacja i zejście",
				description:
					"Utrzymaj pozycję przez kilka sekund, następnie chwyć drążek i zejdź kontrolowanie.",
			},
		],
	},
];

async function seed() {
	console.log("🌱 Starting database seeding...");
	console.log("");

	try {
		console.log("🏋️ Seeding pole dance moves...");

		let totalSteps = 0;

		for (const moveData of movesData) {
			const [insertedMove] = await db
				.insert(moves)
				.values({
					name: moveData.name,
					level: moveData.level,
					slug: moveData.slug,
					imageUrl: IMAGE_URL,
					publishedAt: new Date(),
				})
				.returning();

			await db.insert(moveTranslations).values({
				moveId: insertedMove.id,
				language: "pl",
				description: moveData.description,
				createdAt: new Date(),
				updatedAt: new Date(),
			});

			const stepsWithIds = moveData.steps.map((_step, index) => ({
				id: crypto.randomUUID(),
				moveId: insertedMove.id,
				orderIndex: index + 1,
				createdAt: new Date(),
				updatedAt: new Date(),
			}));

			await db.insert(steps).values(stepsWithIds);

			const stepTranslationsToInsert = moveData.steps.map((step, index) => ({
				stepId: stepsWithIds[index].id,
				language: "pl" as const,
				title: step.title,
				description: step.description,
				createdAt: new Date(),
				updatedAt: new Date(),
			}));

			await db.insert(stepTranslations).values(stepTranslationsToInsert);

			totalSteps += moveData.steps.length;

			console.log(
				`  ✅ ${moveData.name} (${moveData.level}) - ${moveData.steps.length} steps`
			);
		}

		console.log("");
		console.log("🎉 Database seeding completed successfully!");
		console.log("");
		console.log("📊 Seeding Summary:");
		console.log(`   • Moves created: ${movesData.length}`);
		console.log(`   • Steps created: ${totalSteps}`);
		console.log(
			`   • Beginner moves: ${movesData.filter((m) => m.level === "Beginner").length}`
		);
		console.log(
			`   • Intermediate moves: ${movesData.filter((m) => m.level === "Intermediate").length}`
		);
		console.log(
			`   • Advanced moves: ${movesData.filter((m) => m.level === "Advanced").length}`
		);
		console.log("");

		return {
			movesCount: movesData.length,
			stepsCount: totalSteps,
		};
	} catch (error) {
		console.error("");
		console.error("❌ Error seeding database:");
		console.error(error);
		console.error("");
		throw error;
	}
}

seed()
	.then(() => {
		console.log("✨ Seed process finished");
		process.exit(0);
	})
	.catch(() => {
		console.error("💥 Seed process failed");
		process.exit(1);
	});

import { BookOpen, ListChecks, StickyNote } from "lucide-react";
import { motion } from "motion/react";
import { Badge } from "../ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../ui/card";

const ANIMATION_STAGGER_DELAY = 0.1;

const fadeInUp = {
	initial: { opacity: 0, y: 60 },
	animate: { opacity: 1, y: 0 },
	transition: { duration: 0.6, ease: "easeOut" },
};

const staggerContainer = {
	animate: {
		transition: {
			staggerChildren: ANIMATION_STAGGER_DELAY,
		},
	},
};

const features = [
	{
		icon: BookOpen,
		title: "Przeglądaj Katalog Figur",
		description:
			"Odkryj setki figur pole dance. Każda z opisem, poziomem trudności i instrukcją krok po kroku. Twoja następna ulubiona figura już tu jest.",
	},
	{
		icon: ListChecks,
		title: "Śledź Swój Progres",
		description:
			"Oznaczaj figury jako 'Chcę zrobić', 'Prawie umiem' lub 'Zrobione'. Obserwuj, jak Twoja lista 'Zrobione' rośnie z każdym treningiem!",
	},
	{
		icon: StickyNote,
		title: "Prywatne Notatki",
		description:
			"Zapisuj swoje przemyślenia, triki i uwagi przy każdej figurze. Twoje notatki są tylko dla Ciebie – bezpieczne i zawsze pod ręką.",
	},
];

export function Features() {
	return (
		<section className="bg-muted/50 px-4 py-20 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-7xl">
				<motion.div
					className="mb-16 text-center"
					initial={{ opacity: 0, y: 40 }}
					transition={{ duration: 0.6 }}
					viewport={{ once: true }}
					whileInView={{ opacity: 1, y: 0 }}
				>
					<Badge className="mb-4" variant="outline">
						Dziennik Postępów
					</Badge>
					<h2 className="mb-4 font-bold text-4xl text-foreground tracking-tight sm:text-5xl">
						Wszystko, czego potrzebujesz, w jednym miejscu
					</h2>
					<p className="mx-auto max-w-2xl text-lg text-muted-foreground">
						Spinella to proste i intuicyjne narzędzie, które zamienia Twój
						trening w świadomą podróż. Twoje wszystkie figury, notatki i postępy
						w jednym miejscu.
					</p>
				</motion.div>

				<motion.div
					className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
					initial="initial"
					variants={staggerContainer}
					viewport={{ once: true }}
					whileInView="animate"
				>
					{features.map((feature) => (
						<motion.div key={feature.title} variants={fadeInUp}>
							<Card className="group relative h-full overflow-hidden border-border/50 transition-all hover:border-primary/50 hover:shadow-lg">
								<div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
								<CardHeader>
									<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
										<feature.icon className="h-6 w-6" />
									</div>
									<CardTitle className="text-xl">{feature.title}</CardTitle>
								</CardHeader>
								<CardContent>
									<CardDescription className="text-base">
										{feature.description}
									</CardDescription>
								</CardContent>
							</Card>
						</motion.div>
					))}
				</motion.div>
			</div>
		</section>
	);
}

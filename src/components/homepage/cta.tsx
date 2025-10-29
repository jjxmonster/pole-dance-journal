import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "../ui/button";

export function Cta() {
	return (
		<section className="relative overflow-hidden bg-gradient-to-br from-primary to-secondary px-4 py-20 text-primary-foreground sm:px-6 lg:px-8">
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:14px_24px]" />
			<div className="relative mx-auto max-w-4xl text-center">
				<motion.div
					initial={{ opacity: 0, y: 40 }}
					transition={{ duration: 0.6 }}
					viewport={{ once: true }}
					whileInView={{ opacity: 1, y: 0 }}
				>
					<h2 className="mb-6 font-bold text-4xl tracking-tight sm:text-5xl">
						Śledź swoje postępy w pole dance – prosto i skutecznie
					</h2>
					<p className="mb-8 text-lg opacity-90">
						Odkrywaj katalog ruchów, ustawiaj statusy i zapisuj prywatne
						notatki. Spinella pomaga Ci wracać do treningów z jasnym planem.
					</p>
					<Button
						className="group shadow-lg hover:shadow-xl"
						size="lg"
						variant="secondary"
					>
						Zacznij za darmo
						<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
					</Button>
				</motion.div>
			</div>
		</section>
	);
}

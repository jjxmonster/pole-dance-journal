import { CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import { Badge } from "../ui/badge";

const ANIMATION_STAGGER_DELAY = 0.1;

const benefits = [
	"Filter moves by difficulty level",
	"Search through the move catalog",
	"Set custom status for each move",
	"Keep private notes with autosave",
	"View all your moves in one place",
	"Track your learning progress",
];

export function Benefits() {
	return (
		<section className="px-4 py-20 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-7xl">
				<div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
					<motion.div
						className="flex flex-col justify-center"
						initial={{ opacity: 0, x: -40 }}
						transition={{ duration: 0.6 }}
						viewport={{ once: true }}
						whileInView={{ opacity: 1, x: 0 }}
					>
						<Badge className="mb-4 w-fit" variant="secondary">
							Your Learning Hub
						</Badge>
						<h2 className="mb-6 font-bold text-4xl text-foreground tracking-tight sm:text-5xl">
							Organize your pole journey with ease
						</h2>
						<p className="mb-8 text-lg text-muted-foreground">
							No more scattered notes or forgotten progress. Keep everything
							organized in one place with your personalized move catalog and
							private workspace.
						</p>
						<div className="grid gap-4 sm:grid-cols-2">
							{benefits.map((benefit, benefitIndex) => (
								<motion.div
									className="flex items-start gap-3"
									initial={{ opacity: 0, x: -20 }}
									key={benefit}
									transition={{
										duration: 0.4,
										delay: benefitIndex * ANIMATION_STAGGER_DELAY,
									}}
									viewport={{ once: true }}
									whileInView={{ opacity: 1, x: 0 }}
								>
									<CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
									<span className="text-foreground text-sm">{benefit}</span>
								</motion.div>
							))}
						</div>
					</motion.div>

					<motion.div
						className="relative"
						initial={{ opacity: 0, x: 40 }}
						transition={{ duration: 0.6 }}
						viewport={{ once: true }}
						whileInView={{ opacity: 1, x: 0 }}
					>
						<div className="-inset-4 absolute rounded-3xl bg-gradient-to-r from-secondary/20 to-primary/20 opacity-75 blur-2xl" />
						<div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
							<img
								alt="Pole dancer achieving goals"
								className="h-full w-full object-cover"
								src="/move.jpg"
							/>
						</div>
					</motion.div>
				</div>
			</div>
		</section>
	);
}

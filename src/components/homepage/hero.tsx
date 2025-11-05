import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { m } from "@/paraglide/messages";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

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

export function Hero() {
	return (
		<section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
			<div className="-z-10 absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
			<div className="-z-10 absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />

			<div className="mx-auto max-w-7xl">
				<div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
					<motion.div
						animate="animate"
						className="flex flex-col justify-center"
						initial="initial"
						variants={staggerContainer}
					>
						<motion.div variants={fadeInUp}>
							<Badge className="mb-4 w-fit" variant="secondary">
								{m.homepage_hero_badge()}
							</Badge>
						</motion.div>
						<motion.h1
							className="mb-6 font-sans font-semibold text-5xl text-foreground tracking-tight sm:text-6xl lg:text-7xl"
							variants={fadeInUp}
						>
							{m.homepage_hero_title()}{" "}
							<span className="font-borel text-primary leading-1">
								{m.homepage_hero_title_highlight()}
							</span>{" "}
						</motion.h1>
						<motion.p
							className="mb-8 text-lg text-muted-foreground sm:text-xl"
							variants={fadeInUp}
						>
							{m.homepage_hero_description()}
						</motion.p>
						<motion.div
							className="flex flex-col gap-4 sm:flex-row"
							variants={fadeInUp}
						>
							<Button asChild className="group" size="lg">
								<Link to="/auth/sign-in">
									{m.homepage_hero_cta()}
									<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
								</Link>
							</Button>
						</motion.div>
					</motion.div>

					<motion.div
						animate={{ opacity: 1, scale: 1, rotateY: 0 }}
						className="relative"
						initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
						transition={{ duration: 0.8, delay: 0.2 }}
					>
						<div className="-inset-4 absolute rounded-3xl bg-gradient-to-r from-primary/20 to-secondary/20 opacity-75 blur-2xl" />
						<div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
							<img
								alt="Pole dance studio"
								className="h-full w-full object-cover"
								src="/hero.jpg"
							/>
						</div>
					</motion.div>
				</div>
			</div>
		</section>
	);
}

import { motion } from "motion/react";
import { Button } from "./ui/button";

export function Nav() {
	return (
		<nav className="border-border/40 border-b bg-background/95 backdrop-blur">
			<div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
				<motion.div
					animate={{ opacity: 1, x: 0 }}
					className="flex items-center gap-0"
					initial={{ opacity: 0, x: -20 }}
					transition={{ duration: 0.5 }}
				>
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-praimary text-primary-foreground">
						<img alt="Spinella logo" src="/logo.svg" />
					</div>
					<span className="font-sans font-semibold text-foreground text-xl">
						Spinella
					</span>
				</motion.div>
				<motion.div
					animate={{ opacity: 1, x: 0 }}
					className="flex items-center gap-4"
					initial={{ opacity: 0, x: 20 }}
					transition={{ duration: 0.5, delay: 0.1 }}
				>
					<a
						className="text-muted-foreground text-sm hover:text-foreground"
						href="#features"
					>
						Features
					</a>
					<a
						className="text-muted-foreground text-sm hover:text-foreground"
						href="#pricing"
					>
						Pricing
					</a>
					<a
						className="text-muted-foreground text-sm hover:text-foreground"
						href="#contact"
					>
						Contact
					</a>
					<Button size="sm" variant="ghost">
						Log In
					</Button>
					<Button size="sm">Sign Up</Button>
				</motion.div>
			</div>
		</nav>
	);
}

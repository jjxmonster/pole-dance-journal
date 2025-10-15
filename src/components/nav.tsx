import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Button } from "./ui/button";

type NavProps = {
	isAuthenticated?: boolean;
	onSignOut?: () => void;
};

export function Nav({ isAuthenticated = false, onSignOut }: NavProps) {
	return (
		<nav className="border-border/40 border-b bg-background/95 backdrop-blur">
			<div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
				<motion.div
					animate={{ opacity: 1, x: 0 }}
					className="flex items-center gap-0"
					initial={{ opacity: 0, x: -20 }}
					transition={{ duration: 0.5 }}
				>
					<Link className="flex items-center gap-0" to="/">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-praimary text-primary-foreground">
							<img alt="Spinella logo" src="/logo.svg" />
						</div>
						<span className="font-sans font-semibold text-foreground text-xl">
							Spinella
						</span>
					</Link>
				</motion.div>
				<motion.div
					animate={{ opacity: 1, x: 0 }}
					className="flex items-center gap-4"
					initial={{ opacity: 0, x: 20 }}
					transition={{ duration: 0.5, delay: 0.1 }}
				>
					<Link
						className="text-muted-foreground text-sm hover:text-foreground"
						to="/catalog"
					>
						Moves
					</Link>

					{isAuthenticated ? (
						<Button onClick={onSignOut} size="sm" variant="ghost">
							Sign out
						</Button>
					) : (
						<>
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
							<Link to="/auth/sign-in">
								<Button size="sm" variant="ghost">
									Sign in
								</Button>
							</Link>
							<Link to="/auth/sign-up">
								<Button size="sm">Sign up</Button>
							</Link>
						</>
					)}
				</motion.div>
			</div>
		</nav>
	);
}

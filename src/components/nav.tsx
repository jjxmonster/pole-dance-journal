import { Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useAuth } from "@/hooks/use-auth";
import { orpc } from "@/orpc/client";
import { Button } from "./ui/button";

export function Nav() {
	const navigate = useNavigate();
	const { isAuthenticated, clearAuth, email, isAdmin } = useAuth();

	const handleSignOut = async () => {
		try {
			await orpc.auth.logout.call();
		} catch {
			// Logout failed, but we still clear auth and navigate
		} finally {
			clearAuth();
			await navigate({ to: "/" });
		}
	};

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
					{isAuthenticated ? (
						<>
							<Link
								className="text-muted-foreground text-sm hover:text-foreground"
								to="/catalog"
							>
								Katalog
							</Link>
							<Link
								className="text-muted-foreground text-sm hover:text-foreground"
								to="/my-moves"
							>
								Moje Figury
							</Link>
							{isAdmin && (
								<Link
									className="text-muted-foreground text-sm hover:text-foreground"
									to="/admin"
								>
									Admin
								</Link>
							)}
							<span className="text-muted-foreground text-sm">
								{email?.split("@")[0]}
							</span>
							<Button onClick={handleSignOut} size="sm" variant="ghost">
								Wyloguj
							</Button>
						</>
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

import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { User } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "@/hooks/use-auth";
import { orpc } from "@/orpc/client";
import { Button } from "./ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function Nav() {
	const navigate = useNavigate();
	const location = useLocation();
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

	const isActive = (path: string) => location.pathname === path;

	const getNavLinkClass = (path: string) => {
		const baseClass = "text-sm transition-colors hover:text-foreground";
		return isActive(path)
			? `${baseClass} text-primary font-medium`
			: `${baseClass} text-muted-foreground`;
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
					className="-translate-x-1/2 absolute left-1/2 flex items-center gap-8"
					initial={{ opacity: 0, x: 0 }}
					transition={{ duration: 0.5, delay: 0.1 }}
				>
					{isAuthenticated && (
						<>
							<Link className={getNavLinkClass("/catalog")} to="/catalog">
								Katalog
							</Link>
							<Link className={getNavLinkClass("/my-moves")} to="/my-moves">
								Moje Figury
							</Link>
							{isAdmin && (
								<Link className={getNavLinkClass("/admin")} to="/admin">
									Admin
								</Link>
							)}
						</>
					)}
				</motion.div>
				<motion.div
					animate={{ opacity: 1, x: 0 }}
					className="flex items-center gap-4"
					initial={{ opacity: 0, x: 20 }}
					transition={{ duration: 0.5, delay: 0.1 }}
				>
					{isAuthenticated ? (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button size="icon-sm" variant="ghost">
									<User className="size-5" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<div className="px-2 py-1.5 font-medium text-sm">
									{email?.split("@")[0]}
								</div>
								<DropdownMenuItem onClick={handleSignOut} variant="destructive">
									Wyloguj
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<>
							<Link to="/auth/sign-in">
								<Button size="sm" variant="ghost">
									Zaloguj się
								</Button>
							</Link>
							<Link to="/auth/sign-up">
								<Button size="sm">Stwórz konto</Button>
							</Link>
						</>
					)}
				</motion.div>
			</div>
		</nav>
	);
}

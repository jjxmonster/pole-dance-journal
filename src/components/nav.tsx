import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Menu, User } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { orpc } from "@/orpc/client";
import { Button } from "./ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

export function Nav() {
	const navigate = useNavigate();
	const location = useLocation();
	const { isAuthenticated, clearAuth, email, isAdmin } = useAuth();
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const handleSignOut = async () => {
		try {
			await orpc.auth.logout.call();
		} catch {
			// Logout failed, but we still clear auth and navigate
		} finally {
			clearAuth();
			await navigate({ to: "/" });
			setIsMenuOpen(false);
		}
	};

	const isActive = (path: string) => location.pathname === path;

	const getNavLinkClass = (path: string) => {
		const baseClass =
			"text-xl md:text-sm md:font-medium transition-colors font-semibold hover:text-foreground";
		return isActive(path)
			? `${baseClass} text-primary font-medium`
			: `${baseClass} text-muted-foreground`;
	};

	const handleNavigation = async (path: string) => {
		await navigate({ to: path });
		setIsMenuOpen(false);
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
					className="-translate-x-1/2 absolute left-1/2 hidden items-center gap-8 md:flex"
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
					className="flex items-center gap-2 md:gap-4"
					initial={{ opacity: 0, x: 20 }}
					transition={{ duration: 0.5, delay: 0.1 }}
				>
					{isAuthenticated && (
						<Sheet onOpenChange={setIsMenuOpen} open={isMenuOpen}>
							<SheetTrigger asChild className="md:hidden">
								<Button size="icon-sm" variant="ghost">
									<Menu className="size-5" />
								</Button>
							</SheetTrigger>
							<SheetContent className="w-full" side="right">
								<div className="flex h-full flex-col items-start justify-start gap-4 px-4 pt-32">
									<button
										className={getNavLinkClass("/catalog")}
										onClick={() => handleNavigation("/catalog")}
										type="button"
									>
										Katalog
									</button>
									<button
										className={getNavLinkClass("/my-moves")}
										onClick={() => handleNavigation("/my-moves")}
										type="button"
									>
										Moje Figury
									</button>
									{isAdmin && (
										<button
											className={getNavLinkClass("/admin")}
											onClick={() => handleNavigation("/admin")}
											type="button"
										>
											Admin
										</button>
									)}
									<Button onClick={handleSignOut} size="sm">
										Wyloguj
									</Button>
								</div>
							</SheetContent>
						</Sheet>
					)}
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
								<DropdownMenuItem
									className="text-primary"
									onClick={handleSignOut}
									variant="default"
								>
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

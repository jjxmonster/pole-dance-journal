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
			"text-xl md:text-base md:font-medium transition-colors font-semibold hover:text-foreground";
		return isActive(path)
			? `${baseClass} text-primary font-medium`
			: `${baseClass} text-muted-foreground`;
	};

	return (
		<nav className="-translate-x-1/2 fixed top-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-7xl rounded-2xl border border-border/40 bg-background/95 shadow-md backdrop-blur">
			<div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
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
									<Link
										className={getNavLinkClass("/catalog")}
										onClick={() => setIsMenuOpen(false)}
										to="/catalog"
										type="button"
									>
										Katalog
									</Link>
									<Link
										className={getNavLinkClass("/my-moves")}
										onClick={() => setIsMenuOpen(false)}
										to="/my-moves"
										type="button"
									>
										Moje Figury
									</Link>
									{isAdmin && (
										<Link
											className={getNavLinkClass("/admin")}
											onClick={() => setIsMenuOpen(false)}
											to="/admin"
											type="button"
										>
											Admin
										</Link>
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
								<Button
									className="cursor-pointer"
									size="icon-sm"
									variant="ghost"
								>
									<User className="size-5" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<div className="px-2 py-1.5 font-medium text-sm">
									{email?.split("@")[0]}
								</div>
								<DropdownMenuItem
									className="cursor-pointer text-primary"
									onClick={handleSignOut}
									variant="default"
								>
									Wyloguj
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<>
							<Button asChild size="sm" variant="ghost">
								<Link to="/auth/sign-in">Zaloguj się</Link>
							</Button>
							<Button asChild size="sm" variant="default">
								<Link to="/auth/sign-up">Stwórz konto</Link>
							</Button>
						</>
					)}
				</motion.div>
			</div>
		</nav>
	);
}

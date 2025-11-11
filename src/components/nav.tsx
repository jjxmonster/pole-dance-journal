import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Menu, User } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { orpc } from "@/orpc/client";
import { m } from "@/paraglide/messages";
import { Button } from "./ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { LanguageSwitcher } from "./ui/language-switcher";
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
						<div className="mr-1 flex h-6 w-6 items-center justify-center rounded-lg bg-praimary text-primary-foreground md:h-7 md:w-7">
							<img alt="Spinella logo" src="/logo.svg" />
						</div>
						<span className="font-sans font-semibold text-base text-foreground md:text-xl">
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
								{m.nav_catalog()}
							</Link>
							<Link className={getNavLinkClass("/my-moves")} to="/my-moves">
								{m.nav_my_moves()}
							</Link>
							{isAdmin && (
								<Link className={getNavLinkClass("/admin")} to="/admin">
									{m.nav_admin()}
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
							<SheetContent className="w-4/5" side="right">
								<div className="flex h-full flex-col items-start justify-start gap-4 px-4 pt-32">
									<Link
										className={getNavLinkClass("/catalog")}
										onClick={() => setIsMenuOpen(false)}
										to="/catalog"
										type="button"
									>
										{m.nav_catalog()}
									</Link>
									<Link
										className={getNavLinkClass("/my-moves")}
										onClick={() => setIsMenuOpen(false)}
										to="/my-moves"
										type="button"
									>
										{m.nav_my_moves()}
									</Link>
									{isAdmin && (
										<Link
											className={getNavLinkClass("/admin")}
											onClick={() => setIsMenuOpen(false)}
											to="/admin"
											type="button"
										>
											{m.nav_admin()}
										</Link>
									)}
									<hr className="my-1" />
									<div>
										<LanguageSwitcher />
									</div>
									<Button onClick={handleSignOut} size="sm">
										{m.nav_sign_out()}
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
									variant="default"
								>
									<Link className="cursor-pointer text-primary" to="/settings">
										{/* {m.nav_settings()} */}
										Settings
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem
									className="cursor-pointer text-primary"
									onClick={handleSignOut}
									variant="default"
								>
									{m.nav_sign_out()}
								</DropdownMenuItem>
								<DropdownMenuSeparator className="hidden md:block" />
								<DropdownMenuItem className="hover:!bg-transparent hidden cursor-pointer text-primary md:block">
									<LanguageSwitcher />
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<>
							<LanguageSwitcher />
							<Button asChild size="sm" variant="ghost">
								<Link to="/auth/sign-in">{m.nav_sign_in()}</Link>
							</Button>
							<Button asChild size="sm" variant="default">
								<Link to="/auth/sign-up">{m.nav_create_account()}</Link>
							</Button>
						</>
					)}
				</motion.div>
			</div>
		</nav>
	);
}

import { useQueryClient } from "@tanstack/react-query";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Menu, User, XIcon } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { orpc } from "@/orpc/client";
import { m } from "@/paraglide/messages";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { LanguageSwitcher } from "./ui/language-switcher";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetHeader,
	SheetTrigger,
} from "./ui/sheet";

export function Nav() {
	const navigate = useNavigate();
	const location = useLocation();
	const { isAuthenticated, clearAuth, email, isAdmin, avatarUrl, name } =
		useAuth();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const queryClient = useQueryClient();

	const handleSignOut = async () => {
		try {
			await orpc.auth.logout.call();
			clearAuth();
			queryClient.setQueryData(["auth", "session"], {
				userId: null,
				email: null,
				isAdmin: false,
				expiresAt: null,
				avatarUrl: null,
				name: null,
			});
			await navigate({ to: "/" });
			setIsMenuOpen(false);
		} catch {
			clearAuth();
			queryClient.setQueryData(["auth", "session"], {
				userId: null,
				email: null,
				isAdmin: false,
				expiresAt: null,
				avatarUrl: null,
				name: null,
			});
			await navigate({ to: "/" });
			setIsMenuOpen(false);
		}
	};

	const isActive = (path: string) => location.pathname === path;

	const getNavLinkClass = (path: string) => {
		const baseClass =
			"text-base md:text-base transition-colors font-medium hover:text-foreground";
		return isActive(path)
			? `${baseClass} text-primary font-medium`
			: `${baseClass} text-muted-foreground`;
	};

	useEffect(() => {
		setIsMenuOpen(false);
	}, [location.pathname]);

	return (
		<nav className="-translate-x-1/2 fixed top-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-7xl rounded-2xl border border-border/40 bg-white shadow-md backdrop-blur">
			<div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
				<motion.div
					animate={{ opacity: 1, x: 0 }}
					className="flex items-center gap-0"
					initial={{ opacity: 0, x: -20 }}
					transition={{ duration: 0.5 }}
				>
					<Link className="flex items-center gap-0" to="/">
						<div className="mr-1 flex h-6 w-6 items-center justify-center rounded-lg bg-praimary text-primary-foreground md:h-7 md:w-7">
							<img alt="Spinella logo" src="/logo.png" />
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
					<Link className={getNavLinkClass("/catalog")} to="/catalog">
						{m.nav_catalog()}
					</Link>
					{isAuthenticated && (
						<>
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
					{isAuthenticated ? (
						<>
							<div className="hidden md:block">
								<LanguageSwitcher />
							</div>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										className="cursor-pointer"
										size="icon-sm"
										variant="ghost"
									>
										{avatarUrl ? (
											<Avatar>
												<AvatarImage
													alt={name || "User avatar"}
													className="size-10 rounded-full object-cover"
													src={avatarUrl}
												/>
												<AvatarFallback>
													<User className="size-5" />
												</AvatarFallback>
											</Avatar>
										) : (
											<User className="size-5" />
										)}
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<div className="px-2 py-1.5 font-medium text-sm">
										{name || email?.split("@")[0]}
									</div>
									<DropdownMenuItem
										className="cursor-pointer text-primary"
										variant="default"
									>
										<Link
											className="cursor-pointer text-primary"
											to="/settings"
										>
											{m.nav_settings()}
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
							<Sheet onOpenChange={setIsMenuOpen} open={isMenuOpen}>
								<SheetTrigger asChild className="md:hidden">
									<Button size="icon-sm" variant="ghost">
										<Menu className="size-5" />
									</Button>
								</SheetTrigger>
								<SheetContent className="w-full" side="right">
									<SheetHeader className="flex flex-row items-center justify-between px-8 pt-8">
										<Link className="flex items-center gap-0" to="/">
											<div className="mr-1 flex h-6 w-6 items-center justify-center rounded-lg bg-praimary text-primary-foreground md:h-7 md:w-7">
												<img alt="Spinella logo" src="/logo.png" />
											</div>
											<span className="font-sans font-semibold text-base text-foreground md:text-xl">
												Spinella
											</span>
										</Link>
										<SheetClose asChild>
											<Button size="icon-sm" variant="ghost">
												<XIcon className="size-5" />
											</Button>
										</SheetClose>
									</SheetHeader>
									<div className="flex h-full flex-col items-start justify-start gap-4 px-4 pt-8">
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
										<Link
											className={getNavLinkClass("/settings")}
											onClick={() => setIsMenuOpen(false)}
											to="/settings"
											type="button"
										>
											{m.nav_settings()}
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

										<div>
											<LanguageSwitcher />
										</div>
										<hr className="my-1 w-full border-primary/20" />
										<div className="w-full">
											<Button
												className="w-full"
												onClick={handleSignOut}
												size="sm"
												variant="default"
											>
												{m.nav_sign_out()}
											</Button>
										</div>
									</div>
								</SheetContent>
							</Sheet>
						</>
					) : (
						<>
							<Sheet onOpenChange={setIsMenuOpen} open={isMenuOpen}>
								<SheetTrigger asChild className="md:hidden">
									<Button size="icon-sm" variant="ghost">
										<Menu className="size-5" />
									</Button>
								</SheetTrigger>
								<SheetContent className="w-full" side="right">
									<SheetHeader className="flex flex-row items-center justify-between px-8 pt-8">
										<Link className="flex items-center gap-0" to="/">
											<div className="mr-1 flex h-6 w-6 items-center justify-center rounded-lg bg-praimary text-primary-foreground md:h-7 md:w-7">
												<img alt="Spinella logo" src="/logo.png" />
											</div>
											<span className="font-sans font-semibold text-base text-foreground md:text-xl">
												Spinella
											</span>
										</Link>
										<SheetClose asChild>
											<Button size="icon-sm" variant="ghost">
												<XIcon className="size-5" />
											</Button>
										</SheetClose>
									</SheetHeader>{" "}
									<div className="flex h-full flex-col items-start justify-start gap-4 px-4 pt-8">
										<Link
											className={getNavLinkClass("/catalog")}
											onClick={() => setIsMenuOpen(false)}
											to="/catalog"
											type="button"
										>
											{m.nav_catalog()}
										</Link>
										<LanguageSwitcher />

										<hr className="my-1 w-full border-primary/20" />
										<div className="w-full">
											<Button
												asChild
												className="w-full"
												size="sm"
												variant="default"
											>
												<Link to="/auth/sign-in">{m.nav_sign_in()}</Link>
											</Button>
										</div>
									</div>
								</SheetContent>
							</Sheet>
							<div className="hidden items-center gap-2 md:flex">
								<LanguageSwitcher />
								<Button asChild size="sm" variant="ghost">
									<Link to="/auth/sign-in">{m.nav_sign_in()}</Link>
								</Button>
								<Button asChild size="sm" variant="default">
									<Link to="/auth/sign-up">{m.nav_create_account()}</Link>
								</Button>
							</div>
						</>
					)}
				</motion.div>
			</div>
		</nav>
	);
}

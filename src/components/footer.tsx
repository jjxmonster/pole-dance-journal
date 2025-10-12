import { Sparkles } from "lucide-react";

export function Footer() {
	return (
		<footer className="border-border border-t bg-muted/30 px-4 py-12 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-7xl">
				<div className="grid gap-8 md:grid-cols-4">
					<div>
						<div className="mb-4 flex items-center gap-2">
							<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
								<Sparkles className="h-4 w-4" />
							</div>
							<span className="font-bold text-foreground">Pole Journal</span>
						</div>
						<p className="text-muted-foreground text-sm">
							Master every move, track your progress.
						</p>
					</div>
					<div>
						<h3 className="mb-4 font-semibold text-foreground">Product</h3>
						<ul className="space-y-2 text-muted-foreground text-sm">
							<li>
								<a className="hover:text-foreground" href="#features">
									Features
								</a>
							</li>
							<li>
								<a className="hover:text-foreground" href="#pricing">
									Pricing
								</a>
							</li>
						</ul>
					</div>
					<div>
						<h3 className="mb-4 font-semibold text-foreground">Company</h3>
						<ul className="space-y-2 text-muted-foreground text-sm">
							<li>
								<a className="hover:text-foreground" href="#about">
									About
								</a>
							</li>
							<li>
								<a className="hover:text-foreground" href="#contact">
									Contact
								</a>
							</li>
						</ul>
					</div>
					<div>
						<h3 className="mb-4 font-semibold text-foreground">Legal</h3>
						<ul className="space-y-2 text-muted-foreground text-sm">
							<li>
								<a className="hover:text-foreground" href="#privacy">
									Privacy Policy
								</a>
							</li>
							<li>
								<a className="hover:text-foreground" href="#terms">
									Terms of Service
								</a>
							</li>
						</ul>
					</div>
				</div>
				<div className="mt-8 border-border border-t pt-8 text-center text-muted-foreground text-sm">
					© 2025 Pole Journal. All rights reserved.
				</div>
			</div>
		</footer>
	);
}

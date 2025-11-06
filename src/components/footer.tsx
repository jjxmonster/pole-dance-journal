import { m } from "@/paraglide/messages";

export function Footer() {
	return (
		<footer className="border-border border-t bg-muted/30 px-4 py-6 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-7xl">
				<div className="flex items-center justify-center">
					<div className="flex flex-col items-center justify-center">
						<div className="mb-4 flex items-center gap-1">
							<div className="flex h-6 w-6 items-center justify-center rounded-lg bg-praimary text-primary-foreground">
								<img alt="Spinella logo" src="/logo.svg" />
							</div>
							<span className="font-bold text-foreground">Spinella</span>
						</div>
						<p className="text-muted-foreground text-sm">
							{m.footer_description()}
						</p>
					</div>
				</div>

				<div className="mt-8 border-border border-t pt-8 text-center text-muted-foreground text-sm">
					{m.footer_created_by()}{" "}
					<a
						href="https://www.instagram.com/wiktoriv_ke/"
						rel="noopener noreferrer"
						target="_blank"
					>
						@wiktoria_ke
					</a>{" "}
					| {new Date().getFullYear()} Spinella
				</div>
			</div>
		</footer>
	);
}

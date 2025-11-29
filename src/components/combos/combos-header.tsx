import { m } from "@/paraglide/messages";

export function CombosHeader() {
	return (
		<div className="mb-8">
			<h1 className="mb-2 font-bold text-3xl tracking-tight md:text-4xl">
				{m.combos_page_title()}
			</h1>
			<p className="text-lg text-muted-foreground">
				{m.combos_page_subtitle()}
			</p>
		</div>
	);
}

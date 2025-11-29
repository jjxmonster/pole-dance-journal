import { m } from "@/paraglide/messages";

export function CombosError() {
	return (
		<div className="py-12 text-center">
			<p className="font-medium text-destructive text-lg">
				{m.combos_error_title()}
			</p>
			<p className="mt-2 text-muted-foreground text-sm">
				{m.combos_error_description()}
			</p>
		</div>
	);
}

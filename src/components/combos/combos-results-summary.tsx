import { m } from "@/paraglide/messages";
import { PLURAL_THRESHOLD } from "@/utils/constants";

type CombosResultsSummaryProps = {
	total: number;
};

export function CombosResultsSummary({ total }: CombosResultsSummaryProps) {
	const itemType =
		total === 1
			? m.combos_results_item_singular()
			: // biome-ignore lint/style/noNestedTernary: needed for pluralization
				total < PLURAL_THRESHOLD
				? m.combos_results_item_plural_few()
				: m.combos_results_item_plural();

	return (
		<p className="mb-4 text-muted-foreground text-sm">
			{m.combos_results_found({ total: total.toString(), itemType })}
		</p>
	);
}

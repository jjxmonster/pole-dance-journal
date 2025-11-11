import { m } from "@/paraglide/messages";

type CatalogResultsSummaryProps = {
	total: number;
};

export function CatalogResultsSummary({ total }: CatalogResultsSummaryProps) {
	const itemType =
		total === 1
			? m.catalog_results_item_singular()
			: m.catalog_results_item_plural();
	return (
		<div className="mb-4 text-muted-foreground text-sm">
			{m.catalog_results_found({ total: total.toString(), itemType })}
		</div>
	);
}

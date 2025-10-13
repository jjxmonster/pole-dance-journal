import { getPluralForm } from "@/utils/utils";

type CatalogResultsSummaryProps = {
	total: number;
};

export function CatalogResultsSummary({ total }: CatalogResultsSummaryProps) {
	return (
		<div className="mb-4 text-muted-foreground text-sm">
			Found {total} {getPluralForm(total)}
		</div>
	);
}

import { m } from "@/paraglide/messages";

type CatalogEmptyStateProps = {
	hasActiveFilters: boolean;
	onReset: () => void;
};

export function CatalogEmptyState({
	hasActiveFilters,
	onReset,
}: CatalogEmptyStateProps) {
	return (
		<div className="py-12 text-center">
			<p className="text-lg text-muted-foreground">{m.catalog_empty_state()}</p>
			{hasActiveFilters && (
				<>
					<p className="mt-2 text-muted-foreground text-sm">
						{m.catalog_empty_state_suggestion()}
					</p>
					<button
						className="mt-4 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground text-sm transition-colors hover:bg-primary/90"
						onClick={onReset}
						type="button"
					>
						{m.catalog_empty_state_reset_button()}
					</button>
				</>
			)}
		</div>
	);
}

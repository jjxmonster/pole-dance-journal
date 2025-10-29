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
			<p className="text-lg text-muted-foreground">Nie znaleziono figur.</p>
			{hasActiveFilters && (
				<>
					<p className="mt-2 text-muted-foreground text-sm">
						Spróbuj zmienić filtry.
					</p>
					<button
						className="mt-4 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground text-sm transition-colors hover:bg-primary/90"
						onClick={onReset}
						type="button"
					>
						Wyczyść wszystkie filtry
					</button>
				</>
			)}
		</div>
	);
}

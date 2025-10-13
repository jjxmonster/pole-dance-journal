export function CatalogLoading() {
	return (
		<div className="py-12 text-center">
			<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent border-solid" />
			<p className="mt-4 text-muted-foreground">Loading moves...</p>
		</div>
	);
}

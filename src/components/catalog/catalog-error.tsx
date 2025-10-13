type CatalogErrorProps = {
	onRetry?: () => void;
};

export function CatalogError({ onRetry }: CatalogErrorProps) {
	return (
		<div className="mb-6 rounded-lg border border-destructive bg-destructive/10 px-4 py-3 text-destructive">
			<p className="font-semibold">Failed to load moves.</p>
			<p className="text-sm">Please try again later.</p>
			{onRetry && (
				<button
					className="mt-2 font-medium text-sm underline hover:no-underline"
					onClick={onRetry}
					type="button"
				>
					Retry
				</button>
			)}
		</div>
	);
}

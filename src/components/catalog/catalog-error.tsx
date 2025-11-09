import { m } from "@/paraglide/messages";

type CatalogErrorProps = {
	onRetry?: () => void;
};

export function CatalogError({ onRetry }: CatalogErrorProps) {
	return (
		<div className="mb-6 rounded-lg border border-destructive bg-destructive/10 px-4 py-3 text-destructive">
			<p className="font-semibold">{m.catalog_error_title()}</p>
			<p className="text-sm">{m.catalog_error_description()}</p>
			{onRetry && (
				<button
					className="mt-2 font-medium text-sm underline hover:no-underline"
					onClick={onRetry}
					type="button"
				>
					{m.catalog_error_retry_button()}
				</button>
			)}
		</div>
	);
}

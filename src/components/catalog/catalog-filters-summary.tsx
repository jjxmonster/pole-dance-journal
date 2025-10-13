import { X } from "lucide-react";
import type { moveLevelEnum } from "../../db/schema";
import { Badge } from "../ui/badge";

type MoveLevel = (typeof moveLevelEnum.enumValues)[number];

type ActiveFilters = {
	query?: string;
	level?: MoveLevel;
};

type CatalogFiltersSummaryProps = {
	activeFilters: ActiveFilters;
	onRemoveFilter: (filterKey: "query" | "level") => void;
};

const LEVEL_LABELS: Record<MoveLevel, string> = {
	Beginner: "Beginner",
	Intermediate: "Intermediate",
	Advanced: "Advanced",
};

export function CatalogFiltersSummary({
	activeFilters,
	onRemoveFilter,
}: CatalogFiltersSummaryProps) {
	const hasFilters = activeFilters.query || activeFilters.level;

	if (!hasFilters) {
		return null;
	}

	return (
		<div className="mb-4 flex flex-wrap items-center gap-2">
			<span className="text-muted-foreground text-sm">Active filters:</span>

			{activeFilters.query && (
				<Badge className="gap-2 pr-1" variant="secondary">
					<span>Search: "{activeFilters.query}"</span>
					<button
						aria-label="Remove search filter"
						className="rounded-full transition-colors hover:bg-destructive/20"
						onClick={() => onRemoveFilter("query")}
						type="button"
					>
						<X className="h-3 w-3" />
					</button>
				</Badge>
			)}

			{activeFilters.level && (
				<Badge className="gap-2 pr-1" variant="secondary">
					<span>Level: {LEVEL_LABELS[activeFilters.level]}</span>
					<button
						aria-label="Remove level filter"
						className="rounded-full transition-colors hover:bg-destructive/20"
						onClick={() => onRemoveFilter("level")}
						type="button"
					>
						<X className="h-3 w-3" />
					</button>
				</Badge>
			)}
		</div>
	);
}

import { X } from "lucide-react";
import { m } from "@/paraglide/messages";
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

const getLevelLabel = (level: MoveLevel): string => {
	switch (level) {
		case "Beginner":
			return m.catalog_level_beginner();
		case "Intermediate":
			return m.catalog_level_intermediate();
		case "Advanced":
			return m.catalog_level_advanced();
		default:
			return level;
	}
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
			<span className="text-muted-foreground text-sm">
				{m.catalog_active_filters()}
			</span>

			{activeFilters.query && (
				<Badge className="gap-2 pr-1" variant="secondary">
					<span>{m.catalog_filter_search({ query: activeFilters.query })}</span>
					<button
						aria-label={m.catalog_filter_remove_aria_label({
							filterType: "search",
						})}
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
					<span>
						{m.catalog_filter_level({
							level: getLevelLabel(activeFilters.level),
						})}
					</span>
					<button
						aria-label={m.catalog_filter_remove_aria_label({
							filterType: "level",
						})}
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

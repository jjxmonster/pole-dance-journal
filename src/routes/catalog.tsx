import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { LevelFilterBadges } from "../components/catalog/level-filter-badges";
import { MoveCard } from "../components/catalog/move-card";
import { SearchBar } from "../components/catalog/search-bar";
import { moveLevelEnum } from "../db/schema";
import { useCatalogFilters } from "../hooks/use-catalog-filters";
import { useDebouncedValue } from "../hooks/use-debounced-value";
import { orpc } from "../orpc/client";

const catalogSearchSchema = z.object({
	query: z.string().optional(),
	level: z.enum(moveLevelEnum.enumValues).optional(),
	page: z.number().int().min(1).optional().default(1),
});

export const Route = createFileRoute("/catalog")({
	validateSearch: catalogSearchSchema,
	component: CatalogView,
});

const PAGE_SIZE = 20;
const DEBOUNCE_DELAY_MS = 250;
const SECONDS_PER_MINUTE = 60;
const MS_PER_SECOND = 1000;
const MINUTES_TO_MS = SECONDS_PER_MINUTE * MS_PER_SECOND;
const STALE_TIME_MINUTES = 5;
const STALE_TIME_MS = STALE_TIME_MINUTES * MINUTES_TO_MS;
const PLURAL_THRESHOLD = 5;

function getPluralForm(count: number): string {
	if (count === 1) {
		return "move";
	}
	if (count < PLURAL_THRESHOLD) {
		return "moves";
	}
	return "moves";
}

function CatalogView() {
	const { filters, updateFilters } = useCatalogFilters();
	const debouncedQuery = useDebouncedValue(filters.query, DEBOUNCE_DELAY_MS);

	const queryInput = {
		limit: PAGE_SIZE,
		offset: (filters.page - 1) * PAGE_SIZE,
		level: filters.level === "All" ? undefined : filters.level,
		query: debouncedQuery.trim() || undefined,
	};

	const { data, isLoading, error, isFetching } = useQuery(
		orpc.moves.list.queryOptions({
			input: queryInput,
			staleTime: STALE_TIME_MS,
		})
	);

	const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

	const handleSearchChange = (value: string) => {
		updateFilters({ query: value.trim() || "" });
	};

	const handleSearchClear = () => {
		updateFilters({ query: "" });
	};

	const handleLevelChange = (level: typeof filters.level) => {
		updateFilters({ level, page: 1 });
	};

	return (
		<div className="container mx-auto max-w-7xl px-4 py-8">
			<div className="mb-8">
				<h1 className="mb-2 font-semibold text-5xl">Pole Dance Moves</h1>
				<p className="text-muted-foreground">
					Explore and track your progress with our comprehensive catalog of
					moves.
				</p>
			</div>

			<div className="mb-6 space-y-4">
				<SearchBar
					onChange={handleSearchChange}
					onClear={handleSearchClear}
					value={filters.query}
				/>
				<LevelFilterBadges
					activeLevel={filters.level}
					onChange={handleLevelChange}
				/>
			</div>

			{error && (
				<div className="mb-6 rounded-lg border border-destructive bg-destructive/10 px-4 py-3 text-destructive">
					<p className="font-semibold">Nie udało się załadować ruchów.</p>
					<p className="text-sm">Spróbuj ponownie później.</p>
				</div>
			)}

			{isLoading && (
				<div className="py-12 text-center">
					<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent border-solid" />
					<p className="mt-4 text-muted-foreground">Ładowanie ruchów...</p>
				</div>
			)}

			{!isLoading && data && (
				<div>
					<div className="mb-4 text-muted-foreground text-sm">
						Found {data.total} {getPluralForm(data.total)}
					</div>
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
						{data.moves.map((move) => (
							<MoveCard key={move.id} move={move} />
						))}
					</div>

					{data.moves.length === 0 && (
						<div className="py-12 text-center">
							<p className="text-lg text-muted-foreground">
								Nie znaleziono ruchów.
							</p>
							<p className="mt-2 text-muted-foreground text-sm">
								Spróbuj zmienić filtry wyszukiwania.
							</p>
						</div>
					)}

					{totalPages > 1 && (
						<div className="mt-8 flex items-center justify-center gap-4">
							<span className="text-muted-foreground text-sm">
								Strona {filters.page} z {totalPages}
							</span>
						</div>
					)}
				</div>
			)}

			{isFetching && !isLoading && (
				<div className="fixed right-4 bottom-4 rounded-lg bg-primary px-4 py-2 text-primary-foreground shadow-lg">
					Aktualizacja...
				</div>
			)}
		</div>
	);
}

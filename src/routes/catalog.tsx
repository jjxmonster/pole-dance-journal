import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { CatalogEmptyState } from "../components/catalog/catalog-empty-state";
import { CatalogError } from "../components/catalog/catalog-error";
import { CatalogFiltersSummary } from "../components/catalog/catalog-filters-summary";
import { CatalogHeader } from "../components/catalog/catalog-header";
import { CatalogPagination } from "../components/catalog/catalog-pagination";
import { CatalogResultsSummary } from "../components/catalog/catalog-results-summary";
import { CatalogSkeletonGrid } from "../components/catalog/catalog-skeleton";
import { MoveCard } from "../components/catalog/move-card";
import { SearchBar } from "../components/catalog/search-bar";
import { LevelFilterBadges } from "../components/shared/level-filter-badges/level-filter-badges";
import { moveLevelEnum } from "../db/schema";
import { useCatalogFilters } from "../hooks/use-catalog-filters";
import { useDebouncedValue } from "../hooks/use-debounced-value";
import { orpc } from "../orpc/client";
import { m } from "../paraglide/messages";
import {
	DEBOUNCE_DELAY_MS,
	PAGE_SIZE,
	STALE_TIME_MS,
} from "../utils/constants";

const catalogSearchSchema = z.object({
	query: z.string().optional(),
	level: z.enum(moveLevelEnum.enumValues).optional(),
	page: z.number().int().min(1).optional().default(1),
});

export const Route = createFileRoute("/catalog")({
	validateSearch: catalogSearchSchema,
	component: CatalogView,
	beforeLoad: async () => {
		const session = await orpc.auth.getSession.call();
		if (!session.userId) {
			throw redirect({ to: "/auth/sign-in" });
		}
	},
	head: () => ({
		meta: [
			{
				title: m.catalog_meta_title(),
			},
			{
				name: "description",
				content: m.catalog_meta_description(),
			},
			{
				property: "og:title",
				content: m.catalog_meta_og_title(),
			},
			{
				property: "og:description",
				content: m.catalog_meta_og_description(),
			},
			{
				name: "twitter:card",
				content: "summary",
			},
			{
				name: "twitter:title",
				content: m.catalog_meta_og_title(),
			},
		],
	}),
});

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

	const handlePageChange = (page: number) => {
		updateFilters({ page });
	};

	const handleResetFilters = () => {
		updateFilters({ query: "", level: "All", page: 1 });
	};

	const handleRemoveFilter = (filterKey: "query" | "level") => {
		if (filterKey === "query") {
			updateFilters({ query: "", page: 1 });
		} else if (filterKey === "level") {
			updateFilters({ level: "All", page: 1 });
		}
	};

	const hasActiveFilters = filters.query !== "" || filters.level !== "All";
	const activeFilters = {
		query: filters.query || undefined,
		level: filters.level !== "All" ? filters.level : undefined,
	};

	return (
		<div className="container mx-auto max-w-7xl py-8">
			<CatalogHeader />

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

			<CatalogFiltersSummary
				activeFilters={activeFilters}
				onRemoveFilter={handleRemoveFilter}
			/>

			{error && <CatalogError />}

			{isLoading && <CatalogSkeletonGrid />}

			{!isLoading && data && (
				<>
					<CatalogResultsSummary total={data.total} />

					{data.moves.length > 0 ? (
						<>
							<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
								{data.moves.map((move) => (
									<MoveCard key={move.id} move={move} />
								))}
							</div>

							<CatalogPagination
								currentPage={filters.page}
								onPageChange={handlePageChange}
								totalPages={totalPages}
							/>
						</>
					) : (
						<CatalogEmptyState
							hasActiveFilters={hasActiveFilters}
							onReset={handleResetFilters}
						/>
					)}
				</>
			)}

			{isFetching && !isLoading && (
				<div className="fixed right-4 bottom-4 rounded-lg bg-primary px-4 py-2 text-primary-foreground shadow-lg">
					Updating...
				</div>
			)}
		</div>
	);
}

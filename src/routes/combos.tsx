import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { z } from "zod";
import { ComboCard } from "../components/combos/combo-card";
import { ComboFilters } from "../components/combos/combo-filters";
import { CombosEmptyState } from "../components/combos/combos-empty-state";
import { CombosError } from "../components/combos/combos-error";
import { CombosHeader } from "../components/combos/combos-header";
import { CombosPagination } from "../components/combos/combos-pagination";
import { CombosResultsSummary } from "../components/combos/combos-results-summary";
import { CombosSkeletonGrid } from "../components/combos/combos-skeleton";
import { moveLevelEnum } from "../db/schema";
import { useCombosFilters } from "../hooks/use-combos-filters";
import { orpc } from "../orpc/client";
import { m } from "../paraglide/messages";
import { COMBOS_PAGE_SIZE, STALE_TIME_MS } from "../utils/constants";

const combosSearchSchema = z.object({
	level: z.enum(moveLevelEnum.enumValues).optional(),
	moveId: z.string().uuid().optional(),
	page: z.number().int().min(1).optional().default(1),
	onlyFavorites: z.boolean().optional(),
});

export const Route = createFileRoute("/combos")({
	validateSearch: combosSearchSchema,
	component: CombosView,

	head: () => ({
		meta: [
			{
				title: m.combos_meta_title(),
			},
			{
				name: "description",
				content: m.combos_meta_description(),
			},
			{
				property: "og:title",
				content: m.combos_meta_og_title(),
			},
			{
				property: "og:description",
				content: m.combos_meta_og_description(),
			},
			{
				name: "twitter:card",
				content: "summary",
			},
			{
				name: "twitter:title",
				content: m.combos_meta_og_title(),
			},
		],
	}),
});

function CombosView() {
	const { session } = useLoaderData({ from: "__root__" });
	const isAuthenticated = !!session?.userId;
	const { filters, updateFilters, resetFilters } = useCombosFilters();

	const queryInput = {
		limit: COMBOS_PAGE_SIZE,
		offset: (filters.page - 1) * COMBOS_PAGE_SIZE,
		level: filters.level === "All" ? undefined : filters.level,
		moveId: filters.moveId,
		onlyFavorites: filters.onlyFavorites || undefined,
	};

	const combosQuery = useQuery(
		orpc.combos.list.queryOptions({
			input: queryInput,
			staleTime: STALE_TIME_MS,
			queryKey: ["combos", queryInput],
		})
	);

	const movesQuery = useQuery(
		orpc.moves.list.queryOptions({
			input: { limit: 100 },
			staleTime: STALE_TIME_MS,
		})
	);

	const { data, isLoading, error } = combosQuery;

	const totalPages = data ? Math.ceil(data.total / COMBOS_PAGE_SIZE) : 0;

	const handleLevelChange = (level: typeof filters.level) => {
		updateFilters({ level, page: 1 });
	};

	const handleMoveChange = (moveId: string | undefined) => {
		updateFilters({ moveId, page: 1 });
	};

	const handleFavoritesToggle = () => {
		updateFilters({ onlyFavorites: !filters.onlyFavorites, page: 1 });
	};

	const handlePageChange = (page: number) => {
		updateFilters({ page });
	};

	const handleResetFilters = () => {
		resetFilters();
	};

	const hasActiveFilters =
		filters.level !== "All" || !!filters.moveId || !!filters.onlyFavorites;

	const availableMoves =
		movesQuery.data?.moves.map((move) => ({
			id: move.id,
			name: move.name,
			level: move.level,
		})) ?? [];

	if (!isAuthenticated) {
		return (
			<div className="container mx-auto max-w-7xl py-8">
				<CombosHeader />
				<div className="py-12 text-center">
					<p className="text-lg text-muted-foreground">
						{m.combos_auth_required()}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto max-w-7xl py-8">
			<CombosHeader />

			<div className="mb-6">
				<ComboFilters
					activeLevel={filters.level}
					moves={availableMoves}
					onFavoritesToggle={handleFavoritesToggle}
					onLevelChange={handleLevelChange}
					onlyFavorites={filters.onlyFavorites}
					onMoveChange={handleMoveChange}
					onResetFilters={handleResetFilters}
					selectedMoveId={filters.moveId}
				/>
			</div>

			{error && <CombosError />}

			{isLoading && <CombosSkeletonGrid />}

			{!isLoading && data && (
				<>
					<CombosResultsSummary total={data.total} />

					{data.combos.length > 0 ? (
						<>
							<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
								{data.combos.map((combo) => (
									<ComboCard combo={combo} key={combo.id} />
								))}
							</div>

							<CombosPagination
								currentPage={filters.page}
								onPageChange={handlePageChange}
								totalPages={totalPages}
							/>
						</>
					) : (
						<CombosEmptyState
							hasActiveFilters={hasActiveFilters}
							onReset={handleResetFilters}
						/>
					)}
				</>
			)}
		</div>
	);
}

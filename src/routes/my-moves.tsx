import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { z } from "zod";
import { LevelFilterBadges } from "@/components/shared/level-filter-badges/level-filter-badges";
import { m } from "@/paraglide/messages";
import { EmptyState } from "../components/my-moves/empty-state";
import { ErrorState } from "../components/my-moves/error-state";
import { LoadingState } from "../components/my-moves/loading-state";
import { MoveCardMyMoves } from "../components/my-moves/move-card-my-moves";
import { StatusFilterBadges } from "../components/my-moves/status-filter-badges";
import { Button } from "../components/ui/button";
import { moveLevelEnum, moveStatusEnum } from "../db/schema";
import { useMyMoves } from "../hooks/use-my-moves";
import { useMyMovesFilters } from "../hooks/use-my-moves-filters";
import { sessionQueryOptions } from "../query-options/auth";

const myMovesSearchSchema = z.object({
	level: z.enum([...moveLevelEnum.enumValues, "All"] as const).optional(),
	status: z.enum([...moveStatusEnum.enumValues, "All"] as const).optional(),
});

export const Route = createFileRoute("/my-moves")({
	validateSearch: myMovesSearchSchema,
	component: MyMovesView,
	beforeLoad: async ({ context }) => {
		const session = await context.queryClient.ensureQueryData(
			sessionQueryOptions()
		);
		if (!session.userId) {
			throw redirect({
				to: "/auth/sign-in",
				search: {
					redirect: "/my-moves",
				},
			});
		}
	},
	head: () => ({
		meta: [
			{
				title: m.my_moves_meta_title(),
			},
			{
				name: "description",
				content: m.my_moves_meta_description(),
			},
			{
				property: "og:title",
				content: m.my_moves_meta_title(),
			},
			{
				property: "og:description",
				content: m.my_moves_meta_description(),
			},
		],
	}),
});

function MyMovesView() {
	const { moves, isLoading, isError, refetch } = useMyMoves();
	const { filters, updateFilters } = useMyMovesFilters();

	const renderContent = () => {
		if (isLoading) {
			return <LoadingState />;
		}

		if (isError) {
			return <ErrorState onRetry={refetch} />;
		}

		if (moves.length === 0) {
			return <EmptyState />;
		}

		return (
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
				{moves.map((move) => (
					<MoveCardMyMoves key={move.id} move={move} />
				))}
			</div>
		);
	};

	return (
		<div
			className="container mx-auto max-w-7xl py-8"
			data-testid="my-moves-page"
		>
			<div className="mb-6 flex items-start justify-between gap-4">
				<div>
					<h1 className="mb-2 font-semibold text-5xl text-foreground">
						{m.my_moves_title()}
					</h1>
					<p className="mt-2 text-muted-foreground">{m.my_moves_subtitle()}</p>
				</div>
				<Button asChild data-testid="add-moves-button" type="button">
					<Link to="/catalog">
						<PlusIcon className="size-4" />
						{m.my_moves_add_button()}
					</Link>
				</Button>
			</div>

			<div className="mb-6 space-y-4">
				<div>
					<h2 className="mb-3 font-semibold text-foreground text-sm">
						{m.my_moves_level_filter_label()}
					</h2>
					<LevelFilterBadges
						activeLevel={filters.level}
						onChange={(level) => updateFilters({ level, status: "All" })}
					/>
				</div>
				<div>
					<h2 className="mb-3 font-semibold text-foreground text-sm">
						{m.my_moves_status_filter_label()}
					</h2>
					<StatusFilterBadges
						activeStatus={filters.status}
						onChange={(status) =>
							updateFilters({ status, level: filters.level })
						}
					/>
				</div>
			</div>

			{renderContent()}
		</div>
	);
}

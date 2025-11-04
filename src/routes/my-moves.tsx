import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { z } from "zod";
import { EmptyState } from "../components/my-moves/empty-state";
import { ErrorState } from "../components/my-moves/error-state";
import { LevelFilterBadges } from "../components/my-moves/level-filter-badges";
import { LoadingState } from "../components/my-moves/loading-state";
import { MoveCardMyMoves } from "../components/my-moves/move-card-my-moves";
import { StatusFilterBadges } from "../components/my-moves/status-filter-badges";
import { Button } from "../components/ui/button";
import { moveLevelEnum, moveStatusEnum } from "../db/schema";
import { useMyMoves } from "../hooks/use-my-moves";
import { useMyMovesFilters } from "../hooks/use-my-moves-filters";
import { orpc } from "../orpc/client";

const myMovesSearchSchema = z.object({
	level: z.enum([...moveLevelEnum.enumValues, "All"] as const).optional(),
	status: z.enum([...moveStatusEnum.enumValues, "All"] as const).optional(),
});

export const Route = createFileRoute("/my-moves")({
	validateSearch: myMovesSearchSchema,
	component: MyMovesView,
	beforeLoad: async () => {
		const session = await orpc.auth.getSession.call();
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
				title: "Moje Figury - Spinella",
			},
			{
				name: "description",
				content:
					"Zobacz i zarządzaj swoją osobistą kolekcją figur pole dance. Śledź swoje postępy i notatki.",
			},
			{
				property: "og:title",
				content: "Moje Figury - Spinella",
			},
			{
				property: "og:description",
				content: "Zobacz i zarządzaj swoją osobistą kolekcją figur pole dance.",
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
			className="container mx-auto max-w-7xl px-4 py-8"
			data-testid="my-moves-page"
		>
			<div className="mb-6 flex items-start justify-between gap-4">
				<div>
					<h1 className="mb-2 font-semibold text-5xl text-foreground">
						Moje Figury
					</h1>
					<p className="mt-2 text-muted-foreground">
						Zobacz i zarządzaj swoją osobistą kolekcją figur pole dance
					</p>
				</div>
				<Button asChild data-testid="add-moves-button" type="button">
					<Link to="/catalog">
						<PlusIcon className="size-4" />
						Dodaj figury
					</Link>
				</Button>
			</div>

			<div className="mb-6 space-y-4">
				<div>
					<h2 className="mb-3 font-semibold text-foreground text-sm">
						Poziom trudności
					</h2>
					<LevelFilterBadges
						activeLevel={filters.level}
						onChange={(level) => updateFilters({ level, status: "All" })}
					/>
				</div>
				<div>
					<h2 className="mb-3 font-semibold text-foreground text-sm">
						Status figury
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

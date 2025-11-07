import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { m } from "@/paraglide/messages";
import type { moveLevelEnum } from "../db/schema";
import { client, orpc } from "../orpc/client";
import type { MoveStatus, MyMoveViewModel } from "../types/my-moves";
import { mapToViewModel } from "../types/my-moves";
import { STALE_TIME_MS } from "../utils/constants";
import { useAuth } from "./use-auth";
import { useMyMovesFilters } from "./use-my-moves-filters";

type MoveLevel = (typeof moveLevelEnum.enumValues)[number];

export function useMyMoves() {
	const navigate = useNavigate({ from: "/my-moves" });
	const { isAuthenticated, userId } = useAuth();
	const queryClient = useQueryClient();
	const { filters } = useMyMovesFilters();

	const queryInput = {
		level: filters.level === "All" ? undefined : filters.level,
		status: filters.status === "All" ? undefined : filters.status,
	};

	const { data, isLoading, isError, error, refetch } = useQuery({
		queryKey: ["my-moves", { level: filters.level, status: filters.status }],
		queryFn: async () => {
			if (!isAuthenticated) {
				return { moves: [] };
			}

			return await orpc.moves.getForUser.call(queryInput);
		},
		enabled: isAuthenticated && !!userId,
		staleTime: STALE_TIME_MS,
	});

	const moves: MyMoveViewModel[] = data?.moves.map(mapToViewModel) || [];

	const updateStatusMutation = useMutation({
		mutationFn: async ({
			moveId,
			newStatus,
		}: {
			moveId: string;
			newStatus: MoveStatus;
		}) => {
			const result = await client.userMoveStatuses.set({
				moveId,
				status: newStatus,
			});
			return result;
		},
		onMutate: async ({ moveId, newStatus }) => {
			await queryClient.cancelQueries({
				queryKey: [
					"my-moves",
					{ level: filters.level, status: filters.status },
				],
			});

			const previousData = queryClient.getQueryData([
				"my-moves",
				{ level: filters.level, status: filters.status },
			]);

			queryClient.setQueryData(
				["my-moves", { level: filters.level, status: filters.status }],
				(old: { moves: MyMoveViewModel[] } | undefined) => {
					if (!old) {
						return old;
					}

					return {
						moves: old.moves.map((move) =>
							move.id === moveId
								? {
										...move,
										status: newStatus,
									}
								: move
						),
					};
				}
			);

			return { previousData };
		},
		onError: (_err, _variables, context) => {
			if (context?.previousData) {
				queryClient.setQueryData(
					["my-moves", { level: filters.level, status: filters.status }],
					context.previousData
				);
			}
			toast.error(m.my_moves_update_status_error());
		},
		onSuccess: () => {
			toast.success(m.my_moves_update_status_success());
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: [
					"my-moves",
					{ level: filters.level, status: filters.status },
				],
			});
		},
	});

	const updateStatus = (moveId: string, newStatus: MoveStatus) => {
		if (!isAuthenticated) {
			toast.error(m.my_moves_must_be_logged_in());
			return;
		}

		updateStatusMutation.mutate({ moveId, newStatus });
	};

	const setFilter = (level: MoveLevel | "All") => {
		navigate({
			search: {
				level: level === "All" ? undefined : level,
			},
		});
	};

	return {
		moves,
		isLoading,
		isError,
		error,
		updateStatus,
		activeFilter: filters.level,
		setFilter,
		refetch,
	};
}

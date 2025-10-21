import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { toast } from "sonner";
import type { moveLevelEnum } from "../db/schema";
import { client, orpc } from "../orpc/client";
import type { MoveStatus, MyMoveViewModel } from "../types/my-moves";
import { mapToViewModel } from "../types/my-moves";
import { STALE_TIME_MS } from "../utils/constants";
import { useAuth } from "./use-auth";

type MoveLevel = (typeof moveLevelEnum.enumValues)[number];

export function useMyMoves() {
	const navigate = useNavigate({ from: "/my-moves" });
	const searchParams = useSearch({ from: "/my-moves" });
	const { isAuthenticated, userId } = useAuth();
	const queryClient = useQueryClient();

	const activeFilter: MoveLevel | "All" = searchParams.level || "All";

	const queryInput = {
		level: activeFilter === "All" ? undefined : activeFilter,
	};

	const { data, isLoading, isError, error, refetch } = useQuery({
		queryKey: ["my-moves", { level: activeFilter }],
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
				queryKey: ["my-moves", { level: activeFilter }],
			});

			const previousData = queryClient.getQueryData([
				"my-moves",
				{ level: activeFilter },
			]);

			queryClient.setQueryData(
				["my-moves", { level: activeFilter }],
				(old: { moves: MyMoveViewModel[] } | undefined) => {
					if (!old) {
						return old;
					}

					const getStatusPolish = (status: MoveStatus): string => {
						if (status === "WANT") {
							return "Chcę zrobić";
						}
						if (status === "ALMOST") {
							return "Prawie";
						}
						return "Zrobione";
					};

					return {
						moves: old.moves.map((move) =>
							move.id === moveId
								? {
										...move,
										status: newStatus,
										statusPolish: getStatusPolish(newStatus),
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
					["my-moves", { level: activeFilter }],
					context.previousData
				);
			}
			toast.error("Nie udało się zaktualizować statusu. Spróbuj ponownie.");
		},
		onSuccess: () => {
			toast.success("Status zaktualizowany");
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: ["my-moves", { level: activeFilter }],
			});
		},
	});

	const updateStatus = (moveId: string, newStatus: MoveStatus) => {
		if (!isAuthenticated) {
			toast.error("Musisz być zalogowany, aby zaktualizować status");
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
		activeFilter,
		setFilter,
		refetch,
	};
}

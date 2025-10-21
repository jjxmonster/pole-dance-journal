import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { client, orpc } from "@/orpc/client";
import type { MoveStatus } from "@/types/move";
import { useAuth } from "./use-auth";

export function useMoveStatus(moveId: string) {
	const { isAuthenticated, userId } = useAuth();

	const {
		data,
		isLoading: isStatusLoading,
		isError: isStatusError,
		refetch,
	} = useQuery({
		queryKey: ["userMoveStatus", moveId, userId],
		queryFn: async () => {
			if (!(isAuthenticated && userId)) {
				return null;
			}

			try {
				return await orpc.userMoveStatuses.get.call({
					moveId,
				});
			} catch (_) {
				// Error is not displayed to user
				return null;
			}
		},
		enabled: !!moveId && isAuthenticated && !!userId,
	});

	const { mutate, isPending } = useMutation({
		mutationFn: async (status: MoveStatus) => {
			const result = await client.userMoveStatuses.set({
				moveId,
				status,
			});
			return result;
		},
		onSuccess: () => {
			toast.success("Status zaktualizowany");
			refetch();
		},
		onError: () => {
			toast.error("Nie udało się zaktualizować statusu. Spróbuj ponownie.");
		},
	});

	const updateStatus = (status: MoveStatus) => {
		if (!isAuthenticated) {
			toast.error("Musisz być zalogowany, aby zaktualizować status");
			return;
		}

		mutate(status);
	};

	return {
		status: data?.status || null,
		updateStatus,
		isLoading: isStatusLoading || isPending,
		isError: isStatusError,
	};
}

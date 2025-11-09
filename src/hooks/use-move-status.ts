import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";
import { client, orpc } from "@/orpc/client";
import { m } from "@/paraglide/messages";
import type { MoveStatus } from "@/types/move";
import { useAuth } from "./use-auth";

export function useMoveStatus(moveId: string) {
	const { isAuthenticated, userId } = useAuth();
	const [, startTransition] = useTransition();
	const queryClient = useQueryClient();

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

	const [optimisticStatus, setOptimisticStatus] = useOptimistic(
		data?.status || null
	);

	const { mutate, isPending } = useMutation({
		mutationFn: async (status: MoveStatus) => {
			const result = await client.userMoveStatuses.set({
				moveId,
				status,
			});
			return result;
		},
		onSuccess: () => {
			toast.success(m.move_status_update_success());
			queryClient.invalidateQueries({ queryKey: ["my-moves"] });
			refetch();
		},
		onError: () => {
			toast.error(m.move_status_update_error());
		},
	});

	const updateStatus = (status: MoveStatus) => {
		if (!isAuthenticated) {
			toast.error(m.move_status_auth_required());
			return;
		}

		startTransition(() => {
			setOptimisticStatus(status);
		});
		mutate(status);
	};

	return {
		status: optimisticStatus,
		updateStatus,
		isLoading: isStatusLoading || isPending,
		isError: isStatusError,
	};
}

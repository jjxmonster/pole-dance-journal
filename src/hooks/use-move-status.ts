import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client, orpc } from "@/orpc/client";
import { m } from "@/paraglide/messages";
import type { MoveStatus } from "@/types/move";
import { useAuth } from "./use-auth";

type UserMoveStatusData = {
	status: MoveStatus;
} | null;

export function useMoveStatus(moveId: string) {
	const { isAuthenticated, userId } = useAuth();
	const queryClient = useQueryClient();
	const queryKey = ["userMoveStatus", moveId, userId];

	const {
		data,
		isLoading: isStatusLoading,
		isError: isStatusError,
	} = useQuery({
		queryKey,
		queryFn: async () => {
			if (!(isAuthenticated && userId)) {
				return null;
			}

			try {
				return await orpc.userMoveStatuses.get.call({
					moveId,
				});
			} catch (_) {
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
		onMutate: async (newStatus) => {
			await queryClient.cancelQueries({ queryKey });
			const previousData =
				queryClient.getQueryData<UserMoveStatusData>(queryKey);
			queryClient.setQueryData<UserMoveStatusData>(queryKey, (old) => ({
				...old,
				status: newStatus,
			}));
			return { previousData };
		},
		onError: (_err, _variables, context) => {
			if (context?.previousData !== undefined) {
				queryClient.setQueryData(queryKey, context.previousData);
			}
			toast.error(m.move_status_update_error());
		},
		onSuccess: () => {
			toast.success(m.move_status_update_success());
			queryClient.invalidateQueries({ queryKey: ["my-moves"] });
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey });
		},
	});

	const updateStatus = (status: MoveStatus) => {
		if (!isAuthenticated) {
			toast.error(m.move_status_auth_required());
			return;
		}
		mutate(status);
	};

	return {
		status: data?.status ?? null,
		updateStatus,
		isLoading: isStatusLoading || isPending,
		isError: isStatusError,
	};
}

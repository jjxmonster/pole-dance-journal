import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/orpc/client";

type MutationOptions = {
	onError?: (error: Error) => void;
	onSuccess?: () => void;
};

export function usePublishMoveMutation(options?: MutationOptions) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (moveId: string) =>
			orpc.admin.moves.publishMove.call({ id: moveId }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin", "moves"] });
			options?.onSuccess?.();
		},
		onError: (error) => {
			options?.onError?.(
				error instanceof Error ? error : new Error(String(error))
			);
		},
	});
}

export function useUnpublishMoveMutation(options?: MutationOptions) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (moveId: string) =>
			orpc.admin.moves.unpublishMove.call({ id: moveId }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin", "moves"] });
			options?.onSuccess?.();
		},
		onError: (error) => {
			options?.onError?.(
				error instanceof Error ? error : new Error(String(error))
			);
		},
	});
}

export function useDeleteMoveMutation(options?: MutationOptions) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (moveId: string) =>
			orpc.admin.moves.deleteMove.call({ id: moveId }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin", "moves"] });
			options?.onSuccess?.();
		},
		onError: (error) => {
			options?.onError?.(
				error instanceof Error ? error : new Error(String(error))
			);
		},
	});
}

export function useRestoreMoveMutation(options?: MutationOptions) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (moveId: string) =>
			orpc.admin.moves.restoreMove.call({ id: moveId }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin", "moves"] });
			options?.onSuccess?.();
		},
		onError: (error) => {
			options?.onError?.(
				error instanceof Error ? error : new Error(String(error))
			);
		},
	});
}

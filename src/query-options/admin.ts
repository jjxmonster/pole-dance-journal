import { queryOptions } from "@tanstack/react-query";
import { orpc } from "@/orpc/client";
import type { AdminListMovesInput } from "@/orpc/schema";

export function adminMovesQueryOptions(filters: AdminListMovesInput) {
	return queryOptions({
		queryKey: ["admin", "moves", filters],
		queryFn: () => orpc.admin.moves.listMoves.call(filters),
	});
}

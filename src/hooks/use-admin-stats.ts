import { useQuery } from "@tanstack/react-query";
import { client } from "@/orpc/client";

export const useAdminStats = () =>
	useQuery({
		queryKey: ["admin", "stats"],
		queryFn: () => client.admin.getStats(),
	});
